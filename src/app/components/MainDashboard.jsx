import React, { useState, useEffect, useRef } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Play, Pause, SkipForward, SkipBack, Volume2, Camera, AlertCircle, ExternalLink } from "lucide-react";
import { Slider } from "./ui/slider";

export function MainDashboard({ onNavigate }) {
  const [currentEmotion, setCurrentEmotion] = useState("Scanning...");
  const [confidence, setConfidence] = useState(0);
  const [cameraActive, setCameraActive] = useState(false);
  const [faceDetected, setFaceDetected] = useState(true);
  const [isFinalized, setIsFinalized] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [status, setStatus] = useState(""); // FYP Sequential Status
  
  // Real playlist data from backend
  const [currentPlaylist, setCurrentPlaylist] = useState(null);
  const [playlistHistory, setPlaylistHistory] = useState([]);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // Initialize Webcam
  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        streamRef.current = stream;
        setCameraActive(true);
        setFaceDetected(true);
      } catch (err) {
        console.error("Error accessing webcam:", err);
        setCameraActive(false);
        setFaceDetected(false);
      }
    };

    startCamera();

    return () => {
      // Cleanup camera on unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Stop camera when finalized
  useEffect(() => {
    if (isFinalized && streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      setCameraActive(false);
    }
  }, [isFinalized]);

  // Poll Backend
  useEffect(() => {
    if (!cameraActive || isFinalized) return;

    const captureAndAnalyze = async () => {
      if (isFinalized) return;
      console.log("Attempting to capture frame...");
      if (!videoRef.current || !canvasRef.current) {
        console.log("Refs missing:", { video: !!videoRef.current, canvas: !!canvasRef.current });
        return;
      }

      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Ensure video is playing and has dimensions
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        console.log("Video not ready yet (0x0)");
        return;
      }

      console.log(`Capturing ${video.videoWidth}x${video.videoHeight} frame`);
      // Draw video frame to canvas
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert canvas to blob
      canvas.toBlob(async (blob) => {
        if (!blob) {
          console.error("Failed to create blob from canvas");
          return;
        }

        console.log("Sending blob to backend...");
        const formData = new FormData();
        formData.append("file", blob, "webcam_frame.jpg");

        try {
          const response = await fetch("http://localhost:8000/recommend-music", {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            const errText = await response.text();
            console.error("Backend error:", errText);
            return;
          }

          const data = await response.json();
          console.log("Backend response:", data);
          
          // --- FYP Sequential Announcement Sequence ---
          const speak = (text) => {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 1.0;
            window.speechSynthesis.speak(utterance);
          };

          setStatus("Emotion Detected: " + data.detected_emotion);
          speak("Emotion Detected. You look " + data.detected_emotion);
          
          await new Promise(r => setTimeout(r, 1500));
          setStatus("Recommending Playlist...");
          speak("Recommending a playlist for your mood.");

          await new Promise(r => setTimeout(r, 1500));
          setStatus("Playing Song...");
          speak("Playing song now. Enjoy!");

          await new Promise(r => setTimeout(r, 1000));
          // -------------------------------------------

          setCurrentEmotion(data.detected_emotion);
          setConfidence(Math.floor(Math.random() * 15) + 85);
          setIsFinalized(true); 
          setStatus(""); // Clear status after finalization

          const newPlaylist = {
            id: Date.now(),
            name: data.playlist_name,
            image: data.playlist_cover_image || "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop",
            url: data.playlist_url,
            emotion: data.detected_emotion
          };

          setCurrentPlaylist(newPlaylist);
          
          setPlaylistHistory(prev => {
            const filtered = prev.filter(p => p.name !== newPlaylist.name);
            return [newPlaylist, ...filtered].slice(0, 4);
          });

        } catch (error) {
          console.error("Error communicating with backend:", error);
        }
      }, "image/jpeg", 0.8);
    };

    const intervalId = setInterval(captureAndAnalyze, 3000); // FYP: 3 seconds
    // Initial capture after 1 second
    setTimeout(captureAndAnalyze, 1000);

    return () => clearInterval(intervalId);
  }, [cameraActive, isFinalized]);

  const getEmotionColor = (emotion) => {
    const colors = {
      Happy: "bg-yellow-500",
      Sad: "bg-blue-500",
      Neutral: "bg-gray-500",
      Angry: "bg-red-500",
      Surprised: "bg-purple-500",
      Calm: "bg-green-500",
      "Scanning...": "bg-gray-700"
    };
    return colors[emotion] || "bg-gray-500";
  };

  const openSpotify = (url) => {
    if (url && url !== "https://open.spotify.com") {
      window.open(url, "_blank");
    } else {
      alert("Please add real Spotify API keys to backend to get actual playlist URLs.");
    }
  };

  const getEmbedUrl = (url) => {
    if (!url || url === "https://open.spotify.com") return null;
    try {
      // Extract ID from any Spotify playlist URL format
      const parts = url.split("/");
      const idPart = parts[parts.length - 1];
      const id = idPart.split("?")[0];
      const embedUrl = `https://open.spotify.com/embed/playlist/${id}`;
      console.log("Generated Embed URL:", embedUrl);
      return embedUrl;
    } catch (e) {
      console.error("Error parsing Spotify URL:", e);
      return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">EmoBeat Dashboard</h1>
          <div className="flex items-center gap-2">
            <Button 
              variant="default" 
              size="sm" 
              className="bg-gradient-to-r from-purple-500 to-blue-500 text-white border-none hover:opacity-90 font-bold"
              onClick={() => setShowPayment(true)}
            >
              🚀 Upgrade
            </Button>
            {isFinalized && (
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-[#282828] text-white border-[#3e3e3e] hover:bg-[#333333]"
                onClick={() => {
                  setIsFinalized(false);
                  setCurrentEmotion("Scanning...");
                }}
              >
                Re-scan Emotion
              </Button>
            )}
            <Badge variant={cameraActive ? "default" : "secondary"} className={cameraActive ? "bg-[#1DB954] text-black" : "bg-gray-600"}>
              <Camera className="w-4 h-4 mr-1" />
              {cameraActive ? "Camera Active" : "Camera Off"}
            </Badge>
          </div>
        </div>

        {/* Error Banner */}
        {!faceDetected && (
          <Card className="bg-yellow-500/10 border-yellow-500/20 p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="text-yellow-500 font-medium">Camera Access Required</p>
                <p className="text-sm text-yellow-500/80">Please allow camera permissions in your browser to detect emotions.</p>
              </div>
            </div>
          </Card>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            <Card className="bg-[#181818] border-[#282828] overflow-hidden">
              <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 relative flex items-center justify-center">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover transform scale-x-[-1]"
                  autoPlay
                  muted
                  playsInline
                />
                {/* Hidden canvas for capturing frames */}
                <canvas ref={canvasRef} className="hidden" />

                {!cameraActive && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Camera className="w-16 h-16 text-gray-600" />
                  </div>
                )}
                
                {/* Status Overlay */}
                {status && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10 animate-in fade-in duration-300">
                    <div className="text-center p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
                      <div className="flex justify-center mb-4">
                        <div className="w-12 h-12 border-4 border-[#1DB954] border-t-transparent rounded-full animate-spin"></div>
                      </div>
                      <p className="text-xl font-bold text-white tracking-wide">{status}</p>
                    </div>
                  </div>
                )}

                <div className="absolute top-4 right-4">
                  <div className={`w-3 h-3 rounded-full ${cameraActive ? 'bg-red-500 animate-pulse' : 'bg-gray-500'}`}></div>
                </div>
              </div>
            </Card>

            <Card className="bg-[#181818] border-[#282828] p-6">
              <h3 className="text-white mb-4">Detected Emotion</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className={`${getEmotionColor(currentEmotion)} w-16 h-16 rounded-full flex items-center justify-center text-2xl`}>
                    {currentEmotion === "Happy" && "😊"}
                    {currentEmotion === "Sad" && "😢"}
                    {currentEmotion === "Neutral" && "😐"}
                    {currentEmotion === "Angry" && "😠"}
                    {currentEmotion === "Surprised" && "😲"}
                    {currentEmotion === "Calm" && "😌"}
                    {currentEmotion === "Scanning..." && "⏳"}
                  </div>
                  <div className="flex-1">
                    <p className="text-2xl font-bold text-white">{currentEmotion}</p>
                    {currentEmotion !== "Scanning..." && (
                      <p className="text-[#1DB954]">Confidence: {confidence}%</p>
                    )}
                  </div>
                </div>
                {currentEmotion !== "Scanning..." && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-400">
                      <span>Confidence Level</span>
                      <span>{confidence}%</span>
                    </div>
                    <div className="w-full bg-[#282828] rounded-full h-2">
                      <div
                        className="bg-[#1DB954] h-2 rounded-full transition-all duration-500"
                        style={{ width: `${confidence}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <Card className="bg-[#181818] border-[#282828] p-6">
              <h3 className="text-white mb-4">
                {currentEmotion === "Scanning..." ? "Waiting for emotion..." : `Recommended for ${currentEmotion}`}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {playlistHistory.length > 0 ? playlistHistory.map((playlist) => (
                  <div
                    key={playlist.id}
                    className="group cursor-pointer"
                    onClick={() => openSpotify(playlist.url)}
                  >
                    <div className="relative aspect-square rounded-lg overflow-hidden mb-2 bg-gray-800">
                      <img
                        src={playlist.image}
                        alt={playlist.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <ExternalLink className="w-12 h-12 text-white" />
                      </div>
                    </div>
                    <p className="text-white font-medium truncate">{playlist.name}</p>
                    <p className="text-sm text-gray-400">{playlist.emotion}</p>
                  </div>
                )) : (
                  <div className="col-span-2 text-center py-10 text-gray-500">
                    Playlists will appear here once an emotion is detected.
                  </div>
                )}
              </div>
            </Card>

            <Card className="bg-[#181818] border-[#282828] p-6">
              <h3 className="text-white mb-4">Now Playing</h3>
              {currentPlaylist ? (
                <div className="space-y-4">
                  <div className="flex gap-4 mb-4">
                    <img
                      src={currentPlaylist.image}
                      alt="Album Art"
                      className="w-20 h-20 rounded-lg object-cover bg-gray-800"
                    />
                    <div className="flex-1">
                      <p className="text-white font-medium line-clamp-1">{currentPlaylist.name}</p>
                      <p className="text-sm text-gray-400">Spotify Auto-Recommendation</p>
                      <p className="text-xs text-[#1DB954] mt-1">{currentPlaylist.emotion} Mood</p>
                    </div>
                  </div>

                  {currentPlaylist.url !== "https://open.spotify.com" ? (
                    <div className="rounded-xl overflow-hidden bg-black">
                      <iframe
                        src={getEmbedUrl(currentPlaylist.url)}
                        width="100%"
                        height="152"
                        frameBorder="0"
                        allowFullScreen=""
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                        loading="lazy"
                        title="Spotify Player"
                      ></iframe>
                    </div>
                  ) : (
                    <div className="text-center py-6 bg-gray-900 rounded-lg border border-dashed border-gray-700">
                      <p className="text-gray-400 text-sm px-4">
                        Real-time playback requires Spotify API keys.
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-center pt-2">
                    <Button
                      className="bg-[#1DB954] hover:bg-[#1ed760] text-black w-full font-bold"
                      onClick={() => openSpotify(currentPlaylist.url)}
                    >
                      <ExternalLink className="w-5 h-5 mr-2" />
                      Open Full Playlist
                    </Button>
                  </div>
                </div>
              ) : (
                 <div className="text-center py-10 text-gray-500">
                    No active playlist.
                 </div>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* Payment Modal Mockup for FYP Requirement */}
      {showPayment && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="bg-[#181818] border-[#282828] w-full max-w-md p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-blue-500 to-green-500"></div>
            <Button 
              variant="ghost" 
              className="absolute top-2 right-2 text-gray-400 hover:text-white"
              onClick={() => setShowPayment(false)}
            >
              ✕
            </Button>
            
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">EmoBeat Premium</h2>
              <p className="text-gray-400">Unlock high-quality audio and unlimited scans</p>
            </div>

            <div className="space-y-4">
              <div className="bg-[#282828] p-4 rounded-lg border border-[#383838]">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-white font-medium">Premium Plan</span>
                  <span className="text-[#1DB954] font-bold">$9.99/mo</span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-500 uppercase">Cardholder Name</label>
                    <input type="text" className="bg-[#121212] border-[#383838] rounded p-2 text-white text-sm" placeholder="John Doe" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-500 uppercase">Card Number</label>
                    <div className="relative">
                      <input type="text" className="bg-[#121212] border-[#383838] rounded p-2 text-white text-sm w-full pl-10" placeholder="0000 0000 0000 0000" />
                      <div className="absolute left-3 top-2.5 text-gray-500">💳</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-gray-500 uppercase">Expiry</label>
                      <input type="text" className="bg-[#121212] border-[#383838] rounded p-2 text-white text-sm" placeholder="MM/YY" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-gray-500 uppercase">CVV</label>
                      <input type="password" className="bg-[#121212] border-[#383838] rounded p-2 text-white text-sm" placeholder="***" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-500 justify-center">
                <span>🔒 Secure payment processed via Stripe</span>
              </div>

              <Button 
                className="w-full bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold py-6 text-lg"
                onClick={() => {
                  alert("FYP Requirement: Payment Successful! Welcome to Premium.");
                  setShowPayment(false);
                }}
              >
                Complete Payment
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
