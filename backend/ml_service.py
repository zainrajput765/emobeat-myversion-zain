import os
import torch
import torch.nn as nn
from torchvision import transforms, models
from PIL import Image, ImageEnhance
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

        # Load OpenCV Face Cascade — primary detector
        self.face_cascade = cv2.CascadeClassifier(
            cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
        )
        # Secondary cascade for profile faces (improves detection in varied poses)
        self.face_cascade_alt = cv2.CascadeClassifier(
            cv2.data.haarcascades + "haarcascade_frontalface_alt2.xml"
        )

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
            print(f"✅ Model loaded successfully from {MODEL_PATH} on {self.device}")
            return model
        except Exception as e:
            print(f"Error loading model: {e}")
            return None

    def _get_transforms(self):
        """ImageNet normalization transforms used during training."""
        return transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
        ])

    def _preprocess_face(self, face_bgr: np.ndarray) -> Image.Image:
        """
        Enhanced preprocessing pipeline to improve emotion classification accuracy:
        1. CLAHE (Contrast Limited Adaptive Histogram Equalization) — corrects lighting
        2. Slight Gaussian blur — reduces noise from webcam compression artifacts
        3. Sharpness boost via PIL — emphasises micro-expression edges
        """
        # Step 1: Apply CLAHE on the L channel of LAB color space for lighting correction
        lab = cv2.cvtColor(face_bgr, cv2.COLOR_BGR2LAB)
        l, a, b = cv2.split(lab)
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(4, 4))
        l_clahe = clahe.apply(l)
        enhanced_lab = cv2.merge([l_clahe, a, b])
        face_bgr = cv2.cvtColor(enhanced_lab, cv2.COLOR_LAB2BGR)

        # Step 2: Mild Gaussian blur to remove JPEG compression noise
        face_bgr = cv2.GaussianBlur(face_bgr, (3, 3), 0)

        # Step 3: Convert to PIL and boost sharpness to enhance expression edges
        pil_image = Image.fromarray(cv2.cvtColor(face_bgr, cv2.COLOR_BGR2RGB))
        enhancer = ImageEnhance.Sharpness(pil_image)
        pil_image = enhancer.enhance(1.5)

        return pil_image

    def _detect_best_face(self, img: np.ndarray, gray: np.ndarray):
        """
        Multi-scale face detection using both Haar cascades.
        Returns the bounding box (x, y, w, h) of the largest face found,
        or None if no face is detected.
        """
        # Primary cascade with tighter settings
        faces_primary = self.face_cascade.detectMultiScale(
            gray, scaleFactor=1.05, minNeighbors=4, minSize=(48, 48)
        )
        # Alt cascade (better for slightly tilted faces)
        faces_alt = self.face_cascade_alt.detectMultiScale(
            gray, scaleFactor=1.05, minNeighbors=3, minSize=(48, 48)
        )

        # Merge results and pick the largest face by area
        all_faces = []
        if len(faces_primary) > 0:
            all_faces.extend(list(faces_primary))
        if len(faces_alt) > 0:
            all_faces.extend(list(faces_alt))

        if not all_faces:
            return None

        # Return the bounding box of the largest detected face
        return max(all_faces, key=lambda f: f[2] * f[3])

    def _run_inference(self, pil_image: Image.Image) -> tuple[str, float]:
        """
        Runs a single inference pass through ResNet-18.
        Returns (emotion_label, confidence_percentage).
        """
        tensor = self.transform(pil_image).unsqueeze(0).to(self.device)
        with torch.no_grad():
            outputs = self.model(tensor)
            probabilities = torch.nn.functional.softmax(outputs, dim=1)
            confidence, predicted = torch.max(probabilities, 1)
            class_idx = predicted.item()
            conf_pct = round(confidence.item() * 100, 1)

        label = EMOTION_LABELS[class_idx] if class_idx < len(EMOTION_LABELS) else "Neutral"
        return label, conf_pct

    def predict_emotion(self, image_bytes: bytes) -> dict:
        """
        Full prediction pipeline with enhanced preprocessing.
        Returns a dict: { "emotion": str, "confidence": float, "all_scores": dict }
        """
        if self.model is None:
            self.model = self._load_model()
            if self.model is None:
                raise RuntimeError("Model is not loaded.")

        try:
            # 1. Decode image
            nparr = np.frombuffer(image_bytes, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            if img is None:
                raise ValueError("Could not decode image bytes.")

            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

            # 2. Enhanced multi-scale face detection
            face_box = self._detect_best_face(img, gray)

            if face_box is None:
                raise ValueError("No face detected in the frame. Please ensure your face is visible.")

            (x, y, w, h) = face_box

            # 3. Crop with 15% padding to include eyebrows and chin
            pad_x = int(w * 0.15)
            pad_y = int(h * 0.15)
            x1 = max(0, x - pad_x)
            y1 = max(0, y - pad_y)
            x2 = min(img.shape[1], x + w + pad_x)
            y2 = min(img.shape[0], y + h + pad_y)
            face_crop = img[y1:y2, x1:x2]

            # 4. Enhanced preprocessing (CLAHE + sharpness boost)
            pil_face = self._preprocess_face(face_crop)

            # 5. Primary inference
            label, conf_pct = self._run_inference(pil_face)

            # 6. Test-Time Augmentation (TTA): run flipped version and average
            pil_flipped = pil_face.transpose(Image.FLIP_LEFT_RIGHT)
            label_flipped, conf_flipped = self._run_inference(pil_flipped)

            # Average the two confidence scores for the agreed label
            if label == label_flipped:
                final_confidence = round((conf_pct + conf_flipped) / 2, 1)
            else:
                # Pick the prediction with higher confidence
                if conf_pct >= conf_flipped:
                    final_confidence = conf_pct
                else:
                    label = label_flipped
                    final_confidence = conf_flipped

            print(f"DEBUG: Predicted={label} | Confidence={final_confidence}% | TTA_flip={label_flipped}({conf_flipped}%)")
            return {"emotion": label, "confidence": final_confidence}

        except Exception as e:
            print(f"CRITICAL: Process failed: {e}")
            import traceback
            traceback.print_exc()
            raise RuntimeError(f"Prediction failed: {e}")


predictor = EmotionPredictor()
