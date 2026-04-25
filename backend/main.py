import os
from fastapi import FastAPI, File, UploadFile, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import stripe

from ml_service import predictor
from spotify_service import spotify_service

# Load environment variables
load_dotenv()

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

app = FastAPI(title="EmoBeat API", description="Emotion-based music recommendation API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class RecommendationResponse(BaseModel):
    detected_emotion: str
    playlist_name: str
    playlist_url: str
    playlist_cover_image: str

class CheckoutSessionRequest(BaseModel):
    plan: str

@app.get("/")
def read_root():
    return {"message": "Welcome to EmoBeat API"}

@app.post("/recommend-music", response_model=RecommendationResponse)
async def recommend_music(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File provided is not an image.")
    try:
        image_bytes = await file.read()
        detected_emotion = predictor.predict_emotion(image_bytes)
        playlist_data = spotify_service.get_playlist_for_emotion(detected_emotion)
        if not playlist_data:
            raise HTTPException(status_code=404, detail="No playlist found.")
        return RecommendationResponse(
            detected_emotion=detected_emotion,
            playlist_name=playlist_data["name"],
            playlist_url=playlist_data["url"],
            playlist_cover_image=playlist_data["cover_image"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/detect-face")
async def detect_face(file: UploadFile = File(...)):
    """Lightweight endpoint for real-time face tracking on the frontend."""
    import cv2, numpy as np
    try:
        image_bytes = await file.read()
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is None:
            return {"face_count": 0, "faces": [], "status": "no_image"}

        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(60, 60))

        h_img, w_img = img.shape[:2]
        face_list = []
        for (x, y, w, h) in faces:
            face_list.append({
                "x": float(x / w_img),
                "y": float(y / h_img),
                "w": float(w / w_img),
                "h": float(h / h_img)
            })

        face_count = len(face_list)
        if face_count == 0:
            status = "no_face"
        elif face_count > 1:
            status = "multiple_faces"
        else:
            status = "ok"

        return {"face_count": face_count, "faces": face_list, "status": status}
    except Exception as e:
        return {"face_count": 0, "faces": [], "status": "error", "detail": str(e)}

@app.post("/create-checkout-session")
async def create_checkout_session(plan: dict):
    # Check if we have a real Stripe key or a placeholder
    stripe_key = os.getenv("STRIPE_SECRET_KEY", "")
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
    
    if not stripe_key or "your_secret_key" in stripe_key:
        print("⚠️ STRIPE_SECRET_KEY not set. Running in SIMULATION MODE.")
        # Redirect back to local app with success status
        return {"url": "http://localhost:5173/?payment=success"}

    try:
        checkout_session = stripe.checkout.Session.create(
            line_items=[
                {
                    'price_data': {
                        'currency': 'usd',
                        'product_data': {
                            'name': f'EmoBeat {plan.get("plan", "Premium")} Plan',
                        },
                        'unit_amount': 8900,
                    },
                    'quantity': 1,
                },
            ],
            mode='payment',
            success_url=f"{frontend_url}/success",
            cancel_url=f"{frontend_url}/cancel",
        )
        return {"url": checkout_session.url}
    except Exception as e:
        print(f"❌ Stripe Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
