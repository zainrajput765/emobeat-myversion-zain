import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
import cv2

EMOTION_LABELS = ["Angry", "Disgust", "Fear", "Happy", "Neutral", "Sad", "Surprise"]

try:
    img = cv2.imread("test_face.jpg")
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    faces = face_cascade.detectMultiScale(gray, 1.1, 4)
    
    if len(faces) > 0:
        (x, y, w, h) = sorted(faces, key=lambda f: f[2]*f[3], reverse=True)[0]
        face_img = img[y:y+h, x:x+w]
        pil_image = Image.fromarray(cv2.cvtColor(face_img, cv2.COLOR_BGR2RGB))
    else:
        pil_image = Image.fromarray(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))

    model = models.resnet18(weights=None)
    model.fc = nn.Linear(model.fc.in_features, 7)
    model.load_state_dict(torch.load('emotion_resnet18.pth', map_location='cpu'))
    model.eval()

    transform = transforms.Compose([
        transforms.Grayscale(num_output_channels=3),
        transforms.Resize((48, 48)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.5, 0.5, 0.5], std=[0.5, 0.5, 0.5]),
    ])

    tensor = transform(pil_image).unsqueeze(0)
    
    with torch.no_grad():
        outputs = model(tensor)
        prob = torch.nn.functional.softmax(outputs, dim=1)
        conf, pred = torch.max(prob, 1)
        
        print(f"Face Image (48x48 Grayscale) -> Predicted: {EMOTION_LABELS[pred.item()]} ({conf.item()*100:.1f}%) | Raw index: {pred.item()}")
        
except Exception as e:
    print(f"Error: {e}")
