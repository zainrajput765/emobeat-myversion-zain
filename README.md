# EmoBeat 🎵

**EmoBeat** is an intelligent, emotion-based music recommendation system designed to enhance the listening experience by aligning music with the user's current mood. This project was developed as a Final Year Project (FYP) to demonstrate the integration of Deep Learning and real-time API services.

## 🚀 Features

- **Real-time Emotion Detection**: Uses a custom-trained PyTorch ResNet-18 model to detect 7 distinct emotions (Happy, Sad, Angry, Neutral, Disgust, Fear, Surprise).
- **Sequential User Experience**: Automatically scans the user, announces the detected emotion via voice, and recommends a matching Spotify playlist.
- **Spotify Integration**: Seamlessly plays curated playlists tailored to the detected mood using Spotify Embeds.
- **Premium Mockup**: Includes a fully functional subscription and payment interface (Stripe/PayPal mockup) for FYP requirements.
- **Responsive Dashboard**: A sleek, dark-themed dashboard built with React and Vite for a premium feel.

## 🛠️ Technology Stack

- **Frontend**: React.js, Vite, Tailwind CSS, Lucide React
- **Backend**: FastAPI (Python)
- **Machine Learning**: PyTorch, Torchvision, PIL
- **Music API**: Spotify Web API logic

## 📦 Installation & Setup

### Backend
1. `cd backend`
2. `pip install -r requirements.txt`
3. `uvicorn main:app --reload`

### Frontend
1. `npm install`
2. `npm run dev`

## 👥 Contributors
- **Shazil Rehman** (@shazy07) - Lead Developer

---
*Created for FYP Requirements - 2026*