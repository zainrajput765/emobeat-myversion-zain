# 🎵 EmoBeat: Emotion-Driven Sonic Experience

EmoBeat is an advanced, full-stack AI application that uses real-time facial expression analysis to curate the perfect musical atmosphere. By combining Deep Learning with the Spotify ecosystem, EmoBeat transforms your emotional state into a personalized sonic profile.

![EmoBeat Header](https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&h=400&fit=crop)

## 🌐 Live Demo
*   **Frontend (Live App):** [https://emobeat-final.vercel.app](https://emobeat-final.vercel.app)
*   **Backend (API Docs):** [https://shazy07-emobeat-backend.hf.space/docs](https://shazy07-emobeat-backend.hf.space/docs)

## 🚀 Key Features

### 🧠 Intelligent Emotion Recognition
*   **Neural Analysis:** Powered by a **ResNet-18** deep learning model trained for facial expression recognition.
*   **Precision Vision:** Uses **OpenCV Haar Cascades** for real-time face detection and automated cropping, ensuring background noise doesn't affect accuracy.
*   **Dynamic Matching:** Recognizes 7 distinct emotional states: *Happy, Sad, Angry, Neutral, Surprised, Fear, and Disgust*.

### 🎨 Premium Studio UI/UX
*   **State-of-the-Art Aesthetic:** A "Spotify-inspired" dark interface utilizing glassmorphism, fluid animations, and a high-fidelity design system.
*   **Interactive Scanner:** Real-time visual feedback with a neural scanning overlay and sequential status updates.
*   **Responsive Experience:** Fully optimized for different screen sizes and high-resolution displays.

### 🎧 Seamless Music Integration
*   **Smart Embedding:** Dynamically renders Spotify Playlists, Artists, and Albums directly within the dashboard.
*   **Customizable Profiles:** Easily update emotion-to-music mappings in the `spotify_service.py` configuration.
*   **Sonic History:** Tracks your recent moods and recommendations for quick access.

### 💳 Secure Payment Gateway
*   **Stripe Integration:** A fully functional **Stripe Checkout** flow for upgrading to "Premium" status.
*   **Simulation Mode:** Built-in demo mode that allows for full flow presentations even without active API keys.

---

## 🛠️ Technology Stack

*   **Frontend:** React.js, Vite, Tailwind CSS, Lucide Icons, Shadcn UI.
*   **Backend:** FastAPI (Python), Uvicorn.
*   **Machine Learning:** PyTorch, Torchvision, OpenCV, NumPy.
*   **DevOps:** Docker, Docker Compose.
*   **Payments:** Stripe API.

---

## 📦 Installation & Setup

### Using Docker (Recommended)
The easiest way to run EmoBeat is using Docker Compose:

1.  Clone the repository:
    ```bash
    git clone https://github.com/shazy07/EmoBeat-Final.git
    cd EmoBeat-Final
    ```
2.  Start the containers:
    ```bash
    docker-compose up --build
    ```
3.  Open [http://localhost:5173](http://localhost:5173) in your browser.

### Manual Installation

**Backend:**
```bash
cd backend
pip install -r requirements.txt
python main.py
```

**Frontend:**
```bash
npm install
npm run dev
```

---

## 🔧 Configuration
Configure your environment variables in `backend/.env`:
*   `STRIPE_SECRET_KEY`: Your Stripe secret key (optional, simulation mode active by default).
*   `FRONTEND_URL`: URL of your frontend (default: http://localhost:5173).

## 🎓 Academic Context
This project was developed as a **Final Year Project (FYP)**. It demonstrates the integration of computer vision, cloud-based music services, and modern full-stack architecture to create an emotionally-aware user experience.

---

## 👨‍💻 Contributors
*   **Shazil** - Lead Developer & Architect

---
*Created with ❤️ by the EmoBeat Team*