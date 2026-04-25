import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
import numpy as np

EMOTION_LABELS = ["Angry", "Disgust", "Fear", "Happy", "Neutral", "Sad", "Surprise"]

try:
    model = models.resnet18(weights=None)
    model.fc = nn.Linear(model.fc.in_features, 7)
    model.load_state_dict(torch.load('emotion_resnet18.pth', map_location='cpu'))
    model.eval()

    transform = transforms.Compose([
        transforms.Grayscale(num_output_channels=3),
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ])

    print("Testing 100 random grayscale images...")
    preds = []
    for i in range(100):
        dummy_img = Image.fromarray(np.random.randint(0, 255, (200, 200, 3), dtype=np.uint8))
        tensor = transform(dummy_img).unsqueeze(0)
        
        with torch.no_grad():
            outputs = model(tensor)
            prob = torch.nn.functional.softmax(outputs, dim=1)
            conf, pred = torch.max(prob, 1)
            preds.append(pred.item())
    
    unique, counts = np.unique(preds, return_counts=True)
    print(f"Prediction distribution over 100 random inputs: {dict(zip(unique, counts))}")

except Exception as e:
    print(f"Error: {e}")
