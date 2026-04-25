import os
import torch
import torch.nn as nn
from torchvision import transforms, models
from PIL import Image
import io
import cv2
import numpy as np

# Standard FER2013 label order
EMOTION_LABELS = ["Angry", "Disgust", "Fear", "Happy", "Sad", "Surprise", "Neutral"]

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
        return transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
        ])

    def predict_emotion(self, image_bytes: bytes) -> str:
        if self.model is None:
            self.model = self._load_model()
            if self.model is None:
                raise RuntimeError("Model is not loaded.")

        try:
            # 1. Convert bytes to OpenCV image
            nparr = np.frombuffer(image_bytes, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

            # 2. Detect Faces
            faces = self.face_cascade.detectMultiScale(gray, 1.1, 4)
            
            if len(faces) > 0:
                # Use the largest face if multiple detected
                (x, y, w, h) = sorted(faces, key=lambda f: f[2]*f[3], reverse=True)[0]
                face_img = img[y:y+h, x:x+w]
                # Convert back to PIL for transforms
                pil_image = Image.fromarray(cv2.cvtColor(face_img, cv2.COLOR_BGR2RGB))
                print(f"DEBUG: Face detected and cropped at ({x}, {y}, {w}, {h})")
            else:
                # Fallback to whole image if no face detected (better than failing)
                pil_image = Image.fromarray(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))
                print("DEBUG: No face detected, using full image.")

            # 3. Apply transforms and run inference
            try:
                tensor = self.transform(pil_image).unsqueeze(0).to(self.device)

                with torch.no_grad():
                    outputs = self.model(tensor)
                    # Apply softmax to get probabilities
                    probabilities = torch.nn.functional.softmax(outputs, dim=1)
                    confidence, predicted = torch.max(probabilities, 1)
                    class_idx = predicted.item()
                    conf_pct = confidence.item() * 100

                if class_idx < len(EMOTION_LABELS):
                    label = EMOTION_LABELS[class_idx]
                    print(f"DEBUG: Predicted Label: {label} ({conf_pct:.1f}%)")
                    print(f"DEBUG: All probabilities: {dict(zip(EMOTION_LABELS, [f'{p*100:.1f}%' for p in probabilities[0].tolist()]))}")
                    return label
                else:
                    print(f"DEBUG: Predicted index {class_idx} out of range. Defaulting to Neutral.")
                    return "Neutral"
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
