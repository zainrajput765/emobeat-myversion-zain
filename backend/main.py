import os
import requests
import urllib.parse
import base64
import json
from fastapi import FastAPI, File, UploadFile, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
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
    confidence: float
    playlist_name: str
    playlist_url: str
    playlist_cover_image: str

class CheckoutSessionRequest(BaseModel):
    plan: str

@app.get("/")
def read_root():
    return {"message": "Welcome to the EmoBeat API"}

@app.get("/auth/login")
def login_spotify():
    client_id = os.getenv("SPOTIFY_CLIENT_ID")
    redirect_uri = os.getenv("SPOTIFY_REDIRECT_URI", "http://localhost:8000/auth/callback")
    if not client_id:
        raise HTTPException(status_code=500, detail="SPOTIFY_CLIENT_ID not configured")
    
    scope = "user-read-private user-read-email"
    query_params = {
        "response_type": "code",
        "client_id": client_id,
        "scope": scope,
        "redirect_uri": redirect_uri,
        "show_dialog": "true"
    }
    url = f"https://accounts.spotify.com/authorize?{urllib.parse.urlencode(query_params)}"
    return RedirectResponse(url)

@app.get("/auth/callback")
def auth_callback(code: str):
    client_id = os.getenv("SPOTIFY_CLIENT_ID")
    client_secret = os.getenv("SPOTIFY_CLIENT_SECRET")
    redirect_uri = os.getenv("SPOTIFY_REDIRECT_URI", "http://localhost:8000/auth/callback")
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")

    if not client_id or not client_secret:
        raise HTTPException(status_code=500, detail="Spotify credentials not configured")

    # Exchange code for token
    token_url = "https://accounts.spotify.com/api/token"
    auth_header = base64.b64encode(f"{client_id}:{client_secret}".encode()).decode()
    headers = {
        "Authorization": f"Basic {auth_header}",
        "Content-Type": "application/x-www-form-urlencoded"
    }
    data = {
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": redirect_uri
    }
    
    response = requests.post(token_url, headers=headers, data=data)
    if response.status_code != 200:
        raise HTTPException(status_code=400, detail=f"Failed to fetch token from Spotify: {response.text}")
        
    token_info = response.json()
    access_token = token_info.get("access_token")
    
    # Get user profile
    profile_response = requests.get(
        "https://api.spotify.com/v1/me", 
        headers={"Authorization": f"Bearer {access_token}"}
    )
    if profile_response.status_code != 200:
        error_detail = profile_response.text
        if "premium subscription required" in error_detail.lower() or profile_response.status_code in [403, 401]:
            # Fallback for developers without a Spotify Premium subscription
            profile_data = {
                "display_name": "Spotify User (No Premium)",
                "email": "user@emobeat.test",
                "id": "spotify_mock_id"
            }
        else:
            raise HTTPException(status_code=400, detail=f"Failed to fetch user profile: {error_detail}")
    else:
        profile_data = profile_response.json()
    
    # Create session data for frontend
    session_data = {
        "displayName": profile_data.get("display_name") or profile_data.get("id"),
        "email": profile_data.get("email"),
        "mode": "authenticated",
        "spotifyId": profile_data.get("id")
    }
    
    # Encode session to base64 so we can pass it in URL
    session_json = json.dumps(session_data)
    session_encoded = urllib.parse.quote(base64.b64encode(session_json.encode()).decode())
    
    return RedirectResponse(f"{frontend_url}/?session={session_encoded}")

@app.post("/recommend-music", response_model=RecommendationResponse)
async def recommend_music(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File provided is not an image.")
    try:
        image_bytes = await file.read()
        result = predictor.predict_emotion(image_bytes)
        detected_emotion = result["emotion"]
        confidence = result["confidence"]
        playlist_data = spotify_service.get_playlist_for_emotion(detected_emotion)
        if not playlist_data:
            raise HTTPException(status_code=404, detail="No playlist found.")
        return RecommendationResponse(
            detected_emotion=detected_emotion,
            confidence=confidence,
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
