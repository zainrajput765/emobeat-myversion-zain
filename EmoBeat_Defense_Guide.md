# EmoBeat: Project Defense & Presentation Guide

This document is your ultimate resource for defending your Final Year Design Project (FYDP). It covers the deep technical architecture, maps directly to your SDS/Proposal requirements, provides a word-for-word presentation script, and prepares you for the hardest questions your professors might ask.

---

## Part 1: Deep Core Technical Concepts (The "Brain" of EmoBeat)

To defend your project, you must deeply understand how the pieces connect. EmoBeat is a **Microservices-based, AI-driven Web Application**.

### 1. The Architecture (Separation of Concerns)
Your project is split into two independent services communicating via REST APIs:
*   **Frontend (Vercel):** Built with React + Vite. It handles the UI, webcam access, and local state (history). Vercel provides a blazing-fast Content Delivery Network (CDN) for hosting static assets.
*   **Backend (Hugging Face Spaces):** Built with FastAPI (Python). It is isolated from the frontend because running PyTorch neural networks requires heavy CPU/RAM that browsers cannot handle. Hugging Face provides a dedicated Linux container for this.

### 2. The AI Pipeline (How it sees emotion)
When a user clicks "Scan Face", the following pipeline executes:
1.  **Capture:** The frontend `<canvas>` captures a snapshot of the video feed as a JPEG blob.
2.  **Smart Scan Lock:** Before sending heavy data, the frontend rapidly polls the `/detect-face` endpoint. This uses **OpenCV (Haar Cascades)** to mathematically ensure exactly *one* face is in the frame. If the camera is covered, it rejects the scan, saving server resources.
3.  **Preprocessing (Crucial Step):** The backend receives the image. It uses `torchvision.transforms` to convert the image to 224x224 resolution and applies **ImageNet Normalization** (`mean=[0.485, 0.456, 0.406]`). This normalizes the pixels so the AI can understand the lighting.
4.  **Inference:** The tensor is passed through **ResNet-18** (Residual Network). ResNet was chosen because its "skip connections" prevent the vanishing gradient problem, allowing it to learn deep facial features (wrinkles, eye shapes, mouth curves) accurately.
5.  **Classification:** The output layer uses a Softmax function to calculate probabilities across 7 classes (`Angry, Disgust, Fear, Happy, Neutral, Sad, Surprise`), returning the highest probability.

### 3. The Music Engine
Once the emotion is classified, the backend uses the `spotipy` library to authenticate with the **Spotify Web API**. It searches for highly curated playlists matching the emotion string and returns the Spotify URI, which the frontend embeds using an `<iframe>`.

---

## Part 2: Fulfilling Proposal & SDS Requirements

Your professors will check if you met the requirements you promised in your proposal.

1.  **Docker Requirement:**
    *   *How you met it:* The project includes a `Dockerfile` and `docker-compose.yml`. During development, Docker orchestrates both the FastAPI backend and the frontend in isolated, reproducible containers. This guarantees "it works on my machine" translates to "it works anywhere."
2.  **Real-Time Processing Constraint:**
    *   *How you met it:* By implementing the lightweight `/detect-face` endpoint for the green/red tracking box, you avoid running the heavy PyTorch model every frame. The heavy model is only triggered upon a successful "lock," keeping the application latency incredibly low (sub-3 seconds).
3.  **Modern UI/UX Guidelines:**
    *   *How you met it:* Implemented a futuristic "Biometric HUD" with animated SVG crosshairs, spinning canvas elements, and a glassmorphism design system using TailwindCSS to give a premium, professional feel.
4.  **State Management & Persistence:**
    *   *How you met it:* User session data and scan history are persistently stored using browser `localStorage`, ensuring data survives page refreshes without needing a heavy SQL database for a prototype.
5.  **Security & Monetization:**
    *   *How you met it:* Integrated a Stripe payment simulation for premium upgrades and an Admin dashboard secured by an environment-variable password gate.

---

## Part 3: Presentation Script

*Use this script as a foundation. Speak confidently and pause at the designated moments to demonstrate.*

**[Slide 1: Introduction]**
"Respected panel, good morning. My team and I are proud to present **EmoBeat**, an AI-driven music recommendation system. Have you ever spent 10 minutes just scrolling through Spotify trying to find a playlist that matches your exact current mood? EmoBeat solves this by reading your facial expressions in real-time and instantly curating the perfect soundtrack for how you feel."

**[Slide 2: System Architecture & Technologies]**
"To build a scalable and professional application, we utilized a microservices architecture. Our frontend is a React application hosted on Vercel for maximum speed. Because deep learning requires heavy processing, we isolated our AI backend using Python and FastAPI, containerized via Docker, and hosted on a dedicated Hugging Face server."

**[Slide 3: The AI Model]**
"At the core of EmoBeat is a ResNet-18 Convolutional Neural Network, trained on the FER2013 dataset. We chose ResNet because its residual architecture allows for deep feature extraction without losing accuracy. To ensure real-time performance without crashing the browser, we built a 'Smart Scan Lock' system using OpenCV that pre-validates facial presence before triggering the heavy PyTorch inference."

**[Live Demonstration]**
"I will now demonstrate the system. 
*(Cover the camera with your hand)* 
Notice that the system intelligently detects that no face is present and locks the scan. This saves bandwidth and server compute.
*(Reveal face, show a neutral expression, click scan)*
The biometric scanner locks on, processes the image tensor through ResNet, detects 'Neutral', and seamlessly interfaces with the Spotify API to pull a matching acoustic playlist.
*(Smile broadly and scan again)*
By detecting the high contrast around the cheeks and mouth curvature, it instantly adapts to 'Happy' and shifts the music genre."

**[Slide 4: Conclusion]**
"In conclusion, EmoBeat successfully merges biometric computer vision with modern web technologies to create a seamless, emotionally intelligent user experience. Thank you, we are now open to any technical questions."

---

## Part 4: Defense Q&A (The Hard Questions)

**Q1: Why did you use ResNet-18 instead of a lighter model like MobileNet or a heavier one like ResNet-50?**
*Answer:* "ResNet-18 provides the perfect balance for a web-based prototype. MobileNet is faster but struggles with subtle facial micro-expressions (like distinguishing between sad and neutral). ResNet-50 is more accurate but the 100+ MB model size would cause cold-start latency issues on our Hugging Face server. ResNet-18 (44MB) gives us >65% accuracy while keeping inference time under 1 second."

**Q2: I see you have Docker files, but you deployed on Vercel and Hugging Face. Why?**
*Answer:* "Docker was used strictly for the development environment to ensure all team members had identical dependencies without 'works on my machine' issues. For production, deploying serverless (Vercel) and on specialized ML hosting (Hugging Face) provides better auto-scaling and zero-downtime CI/CD than a single monolithic Docker VPS."

**Q3: How does your application handle poor lighting or multiple people in the camera?**
*Answer:* "We implemented an OpenCV Haar Cascade preprocessing step. If the `detectMultiScale` algorithm returns zero faces due to poor lighting, or more than one face, our FastAPI backend instantly rejects the request with a 400 status code before the PyTorch model even loads. This acts as a strict validation layer."

**Q4: How did you connect to Spotify without requiring the user to log in?**
*Answer:* "We used the Client Credentials flow of the Spotify Web API. Our backend holds the `CLIENT_ID` and `CLIENT_SECRET` securely in environment variables. We request an access token server-side to search for public playlists, which allows any user to experience the app immediately without the friction of an OAuth login screen."

**Q5: What happens if the AI predicts the wrong emotion?**
*Answer:* "Facial recognition in 2D space is susceptible to domain shift—meaning webcam lighting differs from the FER2013 training dataset. To mitigate this, we strictly enforce `transforms.Normalize` with ImageNet standards to center the pixel distribution. However, if an edge-case fails, the system safely defaults to 'Neutral' to ensure the user still receives music."
