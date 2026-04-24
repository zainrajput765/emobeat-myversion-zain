from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from ml_service import predictor
from spotify_service import spotify_service

app = FastAPI(title="EmoBeat API", description="Emotion-based music recommendation API")

# Configure CORS for the Vite React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class RecommendationResponse(BaseModel):
    detected_emotion: str
    playlist_name: str
    playlist_url: str
    playlist_cover_image: str

@app.get("/")
def read_root():
    return {"message": "Welcome to EmoBeat API. Send a POST request to /recommend-music"}

@app.post("/recommend-music", response_model=RecommendationResponse)
async def recommend_music(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File provided is not an image.")

    try:
        # Read the file bytes
        image_bytes = await file.read()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read file: {e}")

    try:
        # 1. ML Inference: Detect emotion from the image
        detected_emotion = predictor.predict_emotion(image_bytes)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Emotion prediction failed: {e}")

    try:
        # 2. Spotify API: Get a playlist based on the detected emotion
        playlist_data = spotify_service.get_playlist_for_emotion(detected_emotion)
        
        if not playlist_data:
            raise HTTPException(status_code=404, detail=f"No playlist found for emotion '{detected_emotion}'.")
            
        return RecommendationResponse(
            detected_emotion=detected_emotion,
            playlist_name=playlist_data["name"],
            playlist_url=playlist_data["url"],
            playlist_cover_image=playlist_data["cover_image"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Spotify service failed: {e}")

# To run the server for development:
# uvicorn main:app --reload
