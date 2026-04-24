import os

# Ultra-stable high-res mood images for the UI
EMOTION_PLAYLISTS = {
    "Happy": {
        "name": "Happy Hits",
        "url": "https://open.spotify.com/playlist/37i9dQZF1DX3rxSjS1S6S5",
        "cover_image": "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=500&h=500&fit=crop"
    },
    "Sad": {
        "name": "All the Feels",
        "url": "https://open.spotify.com/playlist/37i9dQZF1DX3YSRmBzsSafe",
        "cover_image": "https://images.unsplash.com/photo-1516589174184-c68526614ae8?w=500&h=500&fit=crop"
    },
    "Angry": {
        "name": "Power Workout",
        "url": "https://open.spotify.com/playlist/37i9dQZF1DXcfZvY9LYv76",
        "cover_image": "https://images.unsplash.com/photo-1518005020481-a685315df121?w=500&h=500&fit=crop"
    },
    "Neutral": {
        "name": "Chill Lofi Beats",
        "url": "https://open.spotify.com/playlist/37i9dQZF1DX8UebIWsuA3v",
        "cover_image": "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=500&h=500&fit=crop"
    },
    "Disgust": {
        "name": "Grunge Forever",
        "url": "https://open.spotify.com/playlist/37i9dQZF1DX1s9vY9rnuGf",
        "cover_image": "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=500&h=500&fit=crop"
    },
    "Fear": {
        "name": "Dark Ambient",
        "url": "https://open.spotify.com/playlist/37i9dQZF1DXbS8uMDYv9PL",
        "cover_image": "https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=500&h=500&fit=crop"
    },
    "Surprise": {
        "name": "Chill Hits",
        "url": "https://open.spotify.com/playlist/37i9dQZF1DX4WYpdgoIcnM",
        "cover_image": "https://images.unsplash.com/photo-1494232410401-ad00d5433cfa?w=500&h=500&fit=crop"
    }
}

class SpotifyPlaylistService:
    def get_playlist_for_emotion(self, emotion: str) -> dict:
        # Return the pre-defined playlist for the emotion
        # Fallback to Neutral if emotion not found
        playlist = EMOTION_PLAYLISTS.get(emotion, EMOTION_PLAYLISTS["Neutral"])
        return playlist

# Singleton instance
spotify_service = SpotifyPlaylistService()
