import os

# Updated to the latest official Spotify editorial playlist IDs (2026)
EMOTION_PLAYLISTS = {
    "Happy": {
        "name": "Bollywood 2000s Hits",
        "url": "https://open.spotify.com/playlist/2QnLDxeZMzIoCno54I9vKj?si=9qEIzMAyTRSRxzEi32GGuQ",
        "cover_image": "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=500&h=500&fit=crop"
    },
    "Sad": {
        "name": "Nusrat",
        "url": "https://open.spotify.com/playlist/7mFOaSSRtPJj2JzH5GxFnS?si=N-CCi46eRHa8AhGCSivHpQ",
        "cover_image": "https://images.unsplash.com/photo-1516589174184-c68526614ae8?w=500&h=500&fit=crop"
    },
    "Angry": {
        "name": "Power Workout",
        "url": "https://open.spotify.com/playlist/1LIowjORrNqFFyXYqK0JvE?si=niMq3rONRK-DvAfaS6psFA",
        "cover_image": "https://images.unsplash.com/photo-1518005020481-a685315df121?w=500&h=500&fit=crop"
    },
    "Neutral": {
        "name": "Lofi Beats",
        "url": "https://open.spotify.com/playlist/38mWQAGEylOPPcWfDpB6FO?si=-V-3u3VRSSOIINF6I-of1A",
        "cover_image": "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=500&h=500&fit=crop"
    },
    "Disgust": {
        "name": "Grunge Forever",
        "url": "https://open.spotify.com/playlist/3tKyCWqLHaVGoiVzoPe68N?si=N1Fg49S_RQWb_ShmC-8w5Q",
        "cover_image": "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=500&h=500&fit=crop"
    },
    "Fear": {
        "name": "Dark Ambient",
        "url": "https://open.spotify.com/playlist/3nSKcSSzEMw7TyqxejMIjZ?si=Xa7TBKXxQSWKw-A-vSVxpQ",
        "cover_image": "https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=500&h=500&fit=crop"
    },
    "Surprise": {
        "name": "Elemental Surprise",
        "url": "https://open.spotify.com/playlist/2tSbw892pmjeprgFpibJQx?si=iL2EU_OxSKGJ9XvzLtEdYw",
        "cover_image": "https://images.unsplash.com/photo-1494232410401-ad00d5433cfa?w=500&h=500&fit=crop"
    }
}

class SpotifyPlaylistService:
    def get_playlist_for_emotion(self, emotion: str) -> dict:
        # Fallback to Neutral if emotion not found
        playlist = EMOTION_PLAYLISTS.get(emotion, EMOTION_PLAYLISTS["Neutral"])
        return playlist

# Singleton instance
spotify_service = SpotifyPlaylistService()
