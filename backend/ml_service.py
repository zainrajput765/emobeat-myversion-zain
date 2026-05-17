import os
import torch
import torch.nn as nn
from torchvision import transforms, models
from PIL import Image
import io
import cv2
import numpy as np

# Alphabetical FER2013 label order (Standard PyTorch ImageFolder mapping)
EMOTION_LABELS = ["Angry", "Disgust", "Fear", "Happy", "Neutral", "Sad", "Surprise"]

# Smart model path: checks /app first (Hugging Face), then one level up (local Docker)
_dir = os.path.dirname(__file__)
_local_path = os.path.join(_dir, "emotion_resnet18.pth")
_parent_path = os.path.join(_dir, "..", "emotion_resnet18.pth")
MODEL_PATH = _local_path if os.path.exists(_local_path) else _parent_path

class EmotionPredictor:
    def __init__(self):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model = self._load_model()
        self.transform = self._get_transforms()
        
        # Load OpenCV Face Cascade
        self.face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

    def _load_model(self):
        try:
            if not os.path.exists(MODEL_PATH):
                print(f"Warning: Model file not found at {MODEL_PATH}.")
                return None
            
            # Initialize ResNet-18
            model = models.resnet18(weights=None)
            num_ftrs = model.fc.in_features
            model.fc = nn.Linear(num_ftrs, 7)
            
            state_dict = torch.load(MODEL_PATH, map_location=self.device)
            model.load_state_dict(state_dict)
            model.to(self.device)
            model.eval()
            return model
        except Exception as e:
            print(f"Error loading model: {e}")
            return None

    def _get_transforms(self):
        # Original ImageNet transforms used during training
        return transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
        ])

    def predict_emotion(self, image_bytes: bytes) -> dict:
        if self.model is None:
            self.model = self._load_model()
            if self.model is None:
                raise RuntimeError("Model is not loaded.")

        try:
            # 1. Convert bytes to OpenCV image
            nparr = np.frombuffer(image_bytes, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            img_h, img_w, _ = img.shape
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

            # 2. Detect Faces
            faces, rejectLevels, levelWeights = self.face_cascade.detectMultiScale3(gray, 1.1, 4, outputRejectLevels=True)
            
            if len(faces) > 0:
                # Use the face with the highest weight (confidence)
                weights = np.array(levelWeights).flatten()
                max_weight_idx = np.argmax(weights)
                (x, y, w, h) = faces[max_weight_idx]
                face_weight = weights[max_weight_idx]
                
                # Normalize detector confidence (Haar weights typically max out around 5-10)
                detector_conf = min(max(face_weight / 5.0, 0.1), 1.0)
                
                face_img = img[y:y+h, x:x+w]
                
                # Calculate Face Clarity & Proximity Metrics
                # Size metric (relative area to total frame)
                face_area = w * h
                frame_area = img_w * img_h
                area_ratio = face_area / frame_area
                size_score = min(area_ratio / 0.15, 1.0) # Assume 15% frame area is optimal
                
                # Blurriness metric (Laplacian variance)
                gray_face = cv2.cvtColor(face_img, cv2.COLOR_BGR2GRAY)
                blur_variance = cv2.Laplacian(gray_face, cv2.CV_64F).var()
                blur_score = min(blur_variance / 100.0, 1.0) # > 100 is usually sharp
                
                # Center metric
                face_center_x = x + w / 2
                face_center_y = y + h / 2
                frame_center_x = img_w / 2
                frame_center_y = img_h / 2
                dist = np.sqrt((face_center_x - frame_center_x)**2 + (face_center_y - frame_center_y)**2)
                max_dist = np.sqrt(frame_center_x**2 + frame_center_y**2)
                center_score = max(0, 1.0 - (dist / max_dist))
                
                # Overall visibility score
                visibility_score = (size_score * 0.4) + (blur_score * 0.4) + (center_score * 0.2)
                
                # Convert back to PIL for transforms
                pil_image = Image.fromarray(cv2.cvtColor(face_img, cv2.COLOR_BGR2RGB))
            else:
                raise ValueError("No face detected in the frame. Please ensure your face is visible.")

            # 3. Pure AI PyTorch Inference
            try:
                tensor = self.transform(pil_image).unsqueeze(0).to(self.device)

                with torch.no_grad():
                    outputs = self.model(tensor)
                    probabilities = torch.nn.functional.softmax(outputs, dim=1)
                    
                    # --- MANUAL CALIBRATION ---
                    # FER2013 models often over-predict 'Sad' or 'Neutral' for resting faces.
                    # We can manually bias the probabilities to fix this!
                    # Index 3 is 'Happy', Index 5 is 'Sad', Index 4 is 'Neutral'
                    probabilities[0][3] *= 1.35  # Boost Happy by 35%
                    probabilities[0][5] *= 0.70  # Reduce Sad by 30%
                    probabilities[0][4] *= 0.90  # Slightly reduce Neutral
                    
                    confidence, predicted = torch.max(probabilities, 1)
                    class_idx = predicted.item()
                    ai_conf = confidence.item()

                # 4. Final Neural Match Calculation
                # The PyTorch model splits 100% across 7 emotions. 
                # So even a 30% raw score means it's the dominant emotion!
                # We map this raw probability to a consumer-friendly "Neural Match Score" (82% - 99%)
                
                # Base scaling: 82.0 + (raw_ai_confidence * 17.0)
                # If AI is 30% confident -> 82 + (0.3 * 17) = 87.1%
                # If AI is 90% confident -> 82 + (0.9 * 17) = 97.3%
                base_confidence = 82.0 + (ai_conf * 17.0)
                
                # Apply minor penalties only if conditions are poor
                penalty = 0
                if visibility_score < 0.6:
                    penalty += 2.5
                if detector_conf < 0.5:
                    penalty += 2.5
                    
                conf_pct = round(base_confidence - penalty, 1)
                
                # Ensure it stays within realistic bounds
                conf_pct = max(75.0, min(99.9, conf_pct))

                if class_idx < len(EMOTION_LABELS):
                    label = EMOTION_LABELS[class_idx]
                    print(f"DEBUG: Predicted: {label} (AI: {ai_conf*100:.1f}%, Final Match: {conf_pct:.1f}%, Vis: {visibility_score*100:.1f}%)")
                    return {"emotion": label, "confidence": conf_pct}
                else:
                    return {"emotion": "Neutral", "confidence": 50.0}
                    
            except Exception as inference_error:
                print(f"CRITICAL: Inference failed: {inference_error}")
                import traceback
                traceback.print_exc()
                raise inference_error

        except Exception as e:
            print(f"CRITICAL: Process failed: {e}")
            import traceback
            traceback.print_exc()
            raise RuntimeError(f"Prediction failed: {e}")

predictor = EmotionPredictor()
