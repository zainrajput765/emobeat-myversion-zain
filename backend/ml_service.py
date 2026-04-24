import os
import torch
import torch.nn as nn
from torchvision import transforms, models
from PIL import Image
import io

# Updated to 7 classes based on the provided model weights
EMOTION_LABELS = ["Angry", "Disgust", "Fear", "Happy", "Sad", "Surprise", "Neutral"]

# Assuming emotion_resnet18.pth is in the root directory (one level up from backend/)
MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "emotion_resnet18.pth")

class EmotionPredictor:
    def __init__(self):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model = self._load_model()
        self.transform = self._get_transforms()

    def _load_model(self):
        try:
            if not os.path.exists(MODEL_PATH):
                print(f"Warning: Model file not found at {MODEL_PATH}. Prediction will fail until the file is present.")
                return None
            
            # Initialize ResNet-18
            model = models.resnet18(weights=None)
            
            # Modify the final fully connected layer for 7 classes
            num_ftrs = model.fc.in_features
            model.fc = nn.Linear(num_ftrs, 7)
            
            # Load the state_dict
            state_dict = torch.load(MODEL_PATH, map_location=self.device)
            model.load_state_dict(state_dict)
            
            model.to(self.device)
            model.eval()
            return model
        except Exception as e:
            print(f"Error loading model from {MODEL_PATH}: {e}")
            return None

    def _get_transforms(self):
        # Simplified transforms for FER models
        return transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.5, 0.5, 0.5], std=[0.5, 0.5, 0.5]),
        ])

    def predict_emotion(self, image_bytes: bytes) -> str:
        if self.model is None:
            # Try loading again in case the file was added later
            self.model = self._load_model()
            if self.model is None:
                raise RuntimeError("Model is not loaded. Please ensure model exists.")

        try:
            # Load image from bytes
            image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
            
            # Apply transforms and add batch dimension
            tensor = self.transform(image).unsqueeze(0).to(self.device)

            # Run inference
            with torch.no_grad():
                outputs = self.model(tensor)
                print(f"DEBUG: Model Logits: {outputs}")
                
            # Get the predicted class index
            _, predicted = torch.max(outputs, 1)
            class_idx = predicted.item()

            # Map index to label
            if class_idx < len(EMOTION_LABELS):
                label = EMOTION_LABELS[class_idx]
                print(f"DEBUG: Predicted Label: {label}")
                return label
            else:
                raise ValueError(f"Predicted index {class_idx} is out of bounds for emotion labels.")
                
        except Exception as e:
            raise RuntimeError(f"Failed to process image and predict emotion: {e}")

# Singleton instance to be used by the FastAPI app
predictor = EmotionPredictor()
