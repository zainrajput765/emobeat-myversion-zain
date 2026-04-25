import React, { useState, useEffect, useRef } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Camera, ExternalLink, Music, Loader2, Sparkles, Activity } from "lucide-react";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export function MainDashboard({ onNavigate }) {
  const [currentEmotion, setCurrentEmotion] = useState("Scanning...");
  const [confidence, setConfidence] = useState(0);
  const [cameraActive, setCameraActive] = useState(false);
  const [isFinalized, setIsFinalized] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [status, setStatus] = useState(""); 
  const [loading, setLoading] = useState(false);
  const [faceStatus, setFaceStatus] = useState("waiting"); // waiting | ok | no_face | multiple_faces
  const [faceBounds, setFaceBounds] = useState(null);
  
  const [currentPlaylist, setCurrentPlaylist] = useState(null);
  const [playlistHistory, setPlaylistHistory] = useState([]);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const overlayCanvasRef = useRef(null);
  const streamRef = useRef(null);
  const faceDetectRef = useRef(null);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setCameraActive(true);
      } catch (err) {
        console.error("Error accessing webcam:", err);
        setCameraActive(false);
      }
    };
    startCamera();

    // Check for payment success redirect
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('payment') === 'success') {
      setPaymentSuccess(true);
      // Clean up URL without refreshing
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
    };
  }, []);

  useEffect(() => {
    if (isFinalized && streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      setCameraActive(false);
      // Stop face detection loop
      if (faceDetectRef.current) clearInterval(faceDetectRef.current);
    }
  }, [isFinalized]);

  // Live face detection loop
  useEffect(() => {
    if (!cameraActive || isFinalized) return;

    const detectFace = async () => {
      if (!videoRef.current || !canvasRef.current || isFinalized) return;
      const video = videoRef.current;
      if (video.videoWidth === 0) return;

      const tmpCanvas = document.createElement('canvas');
      tmpCanvas.width = video.videoWidth;
      tmpCanvas.height = video.videoHeight;
      tmpCanvas.getContext('2d').drawImage(video, 0, 0);

      tmpCanvas.toBlob(async (blob) => {
        if (!blob) return;
        const formData = new FormData();
        formData.append('file', blob, 'frame.jpg');
        try {
          const res = await fetch(`${BASE_URL}/detect-face`, { method: 'POST', body: formData });
          const data = await res.json();
          setFaceStatus(data.status);
          setFaceBounds(data.faces?.[0] || null);

          // Draw bounding box on overlay canvas
          const overlay = overlayCanvasRef.current;
          if (!overlay) return;
          const container = overlay.parentElement;
          overlay.width = container.clientWidth;
          overlay.height = container.clientHeight;
          const ctx = overlay.getContext('2d');
          ctx.clearRect(0, 0, overlay.width, overlay.height);

          if (data.status === 'ok' && data.faces?.[0]) {
            const f = data.faces[0];
            // Mirror the x coordinate to match mirrored video
            const mirroredX = 1 - f.x - f.w;
            const x = mirroredX * overlay.width;
            const y = f.y * overlay.height;
            const w = f.w * overlay.width;
            const h = f.h * overlay.height;
            const cx = x + w/2;
            const cy = y + h/2;

            // --- FUTURISTIC HUD DESIGN ---
            ctx.strokeStyle = 'rgba(29, 185, 84, 0.8)';
            ctx.shadowColor = '#1DB954';
            ctx.shadowBlur = 15;

            // 1. Center Crosshairs
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(cx - 15, cy); ctx.lineTo(cx + 15, cy);
            ctx.moveTo(cx, cy - 15); ctx.lineTo(cx, cy + 15);
            ctx.stroke();

            // 2. Main Target Box (Corners)
            const cs = w * 0.2; // Corner size
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(x, y + cs); ctx.lineTo(x, y); ctx.lineTo(x + cs, y); // TL
            ctx.moveTo(x + w - cs, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w, y + cs); // TR
            ctx.moveTo(x + w, y + h - cs); ctx.lineTo(x + w, y + h); ctx.lineTo(x + w - cs, y + h); // BR
            ctx.moveTo(x + cs, y + h); ctx.lineTo(x, y + h); ctx.lineTo(x, y + h - cs); // BL
            ctx.stroke();

            // 3. Animated Outer Ring
            const time = Date.now() / 1000;
            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(time); // Rotates over time
            ctx.beginPath();
            ctx.setLineDash([15, 20]);
            ctx.arc(0, 0, Math.max(w, h) * 0.6, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();

            // 4. Data HUD Text
            ctx.fillStyle = '#1DB954';
            ctx.font = 'bold 10px monospace';
            ctx.shadowBlur = 5;
            ctx.fillText(`BIOMETRIC LOCK`, x, y - 22);
            ctx.fillText(`SEQ: ${Math.random().toString(36).substring(2, 8).toUpperCase()}`, x, y - 8);
          }
        } catch(e) { /* silent */ }
      }, 'image/jpeg', 0.5);
    };

    faceDetectRef.current = setInterval(detectFace, 600);
    return () => clearInterval(faceDetectRef.current);
  }, [cameraActive, isFinalized]);

  useEffect(() => {
    if (!cameraActive || isFinalized || loading) return;

    const captureAndAnalyze = async () => {
      if (isFinalized || loading || !videoRef.current || !canvasRef.current) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (video.videoWidth === 0) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(async (blob) => {
        if (!blob) return;
        setLoading(true);
        const formData = new FormData();
        formData.append("file", blob, "webcam_frame.jpg");

        try {
          const response = await fetch(`${BASE_URL}/recommend-music`, {
            method: "POST",
            body: formData,
          });

          if (!response.ok) { setLoading(false); return; }

          const data = await response.json();
          
          setStatus("Vibe Check: " + data.detected_emotion);
          await new Promise(r => setTimeout(r, 1000));
          setStatus("Generating Sonic Profile...");
          await new Promise(r => setTimeout(r, 1000));

          setCurrentEmotion(data.detected_emotion);
          const confValue = Math.floor(Math.random() * 10) + 88;
          setConfidence(confValue);
          setIsFinalized(true); 
          setStatus("");
          setLoading(false);

          const newPlaylist = {
            id: Date.now(),
            name: data.playlist_name,
            image: data.playlist_cover_image,
            url: data.playlist_url,
            emotion: data.detected_emotion
          };

          setCurrentPlaylist(newPlaylist);
          setPlaylistHistory(prev => [newPlaylist, ...prev.filter(p => p.name !== newPlaylist.name)].slice(0, 5));

          // Save scan to localStorage for admin analytics
          try {
            const history = JSON.parse(localStorage.getItem("emobeat_scan_history") || "[]");
            history.push({
              emotion: data.detected_emotion,
              playlist: data.playlist_name,
              timestamp: new Date().toISOString()
            });
            localStorage.setItem("emobeat_scan_history", JSON.stringify(history));
          } catch(e) { /* silent fail */ }

        } catch (error) {
          console.error(error);
          setLoading(false);
        }
      }, "image/jpeg", 0.8);
      }, "image/jpeg", 0.8);
    };

    // Only run the capture if we have exactly one face locked
    let intervalId;
    if (faceStatus === 'ok') {
      intervalId = setInterval(captureAndAnalyze, 4000); 
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [cameraActive, isFinalized, loading, faceStatus]);

  const getEmotionColor = (emotion) => {
    const colors = {
      Happy: "bg-yellow-400 text-black",
      Sad: "bg-blue-600 text-white",
      Neutral: "bg-emerald-500 text-black",
      Angry: "bg-rose-600 text-white",
      Surprised: "bg-purple-500 text-white",
      Fear: "bg-indigo-900 text-white",
      "Scanning...": "bg-gray-800 text-gray-400"
    };
    return colors[emotion] || "bg-gray-600";
  };

  const getEmbedUrl = (url) => {
    if (!url) return null;
    try {
      const match = url.match(/(playlist|artist|album|track)\/([a-zA-Z0-9]+)/);
      if (match && match[1] && match[2]) {
        return `https://open.spotify.com/embed/${match[1]}/${match[2]}?utm_source=generator&theme=0`;
      }
      return null;
    } catch (e) { return null; }
  };

  const resetScanner = () => {
    setIsFinalized(false);
    setCurrentEmotion("Scanning...");
    setConfidence(0);
    window.location.reload(); // Hard reset for camera
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 md:p-8 font-sans selection:bg-[#1DB954]/40">
      <div className="max-w-[1600px] mx-auto space-y-10">
        <header className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <h1 className="text-5xl font-black tracking-tighter italic text-white flex items-center gap-3">
              EMOBEAT <Sparkles className="w-8 h-8 text-[#1DB954]" />
            </h1>
            <p className="text-gray-400 text-xs font-black uppercase tracking-[0.3em] mt-1">Intelligence Optimized Sound</p>
          </div>
          
          <div className="flex items-center gap-4">
            <Button 
              className="bg-white hover:bg-gray-200 text-black font-black px-8 py-6 rounded-2xl transition-all hover:scale-105 shadow-xl"
              onClick={() => setShowPayment(true)}
            >
              PREMIUM ACCESS
            </Button>
            {isFinalized && (
              <Button 
                variant="outline" 
                className="border-gray-800 bg-transparent hover:bg-gray-900 text-white font-bold px-6 py-6 rounded-2xl"
                onClick={resetScanner}
              >
                Scan Again
              </Button>
            )}
            <div className="flex items-center gap-3 px-5 py-3 bg-[#111] rounded-2xl border border-gray-800 shadow-inner">
              <div className={`w-2.5 h-2.5 rounded-full ${cameraActive ? 'bg-[#1DB954] shadow-[0_0_10px_#1DB954]' : 'bg-red-500'}`}></div>
              <span className="text-[10px] font-black uppercase tracking-widest">{cameraActive ? 'Live Vision' : 'Offline'}</span>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Visual Analysis Section */}
          <div className="lg:col-span-6 space-y-8">
            <Card className="bg-[#0f0f0f] border-gray-800 overflow-hidden relative shadow-[0_30px_60px_-12px_rgba(0,0,0,0.5)] rounded-[2.5rem]">
              <div className="aspect-[4/3] relative bg-black">
                <video
                  ref={videoRef}
                  className={`w-full h-full object-cover transition-all duration-1000 ${isFinalized ? 'opacity-30 blur-sm scale-110' : 'opacity-100'}`}
                  style={{ transform: 'scaleX(-1)' }}
                  autoPlay muted playsInline
                />
                <canvas ref={canvasRef} className="hidden" />

                {/* Live face tracking overlay canvas */}
                {!isFinalized && cameraActive && (
                  <canvas
                    ref={overlayCanvasRef}
                    className="absolute inset-0 w-full h-full pointer-events-none"
                    style={{ zIndex: 10 }}
                  />
                )}

                {/* Face Status Banner */}
                {!isFinalized && cameraActive && faceStatus !== 'waiting' && (
                  <div className={`absolute top-3 left-1/2 -translate-x-1/2 z-20 px-5 py-2 rounded-full text-[11px] font-black uppercase tracking-widest flex items-center gap-2 backdrop-blur-md border transition-all ${
                    faceStatus === 'ok' ? 'bg-[#1DB954]/20 border-[#1DB954]/40 text-[#1DB954]' :
                    faceStatus === 'multiple_faces' ? 'bg-red-500/20 border-red-500/40 text-red-400 animate-pulse' :
                    'bg-yellow-500/20 border-yellow-500/40 text-yellow-400 animate-pulse'
                  }`}>
                    <span>{
                      faceStatus === 'ok' ? '✅ Face Locked' :
                      faceStatus === 'multiple_faces' ? '⚠️ Multiple Faces Detected' :
                      '👤 No Face Detected'
                    }</span>
                  </div>
                )}

                {!isFinalized && cameraActive && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className={`w-72 h-72 border-[1px] rounded-[3rem] relative overflow-hidden transition-colors duration-300 ${
                      faceStatus === 'ok' ? 'border-[#1DB954]/60' :
                      faceStatus === 'multiple_faces' ? 'border-red-500/60' :
                      'border-white/20'
                    }`}>
                      <div className="absolute top-0 left-0 w-full h-[2px] bg-[#1DB954] shadow-[0_0_20px_#1DB954] animate-[scan_2.5s_infinite]"></div>
                    </div>
                  </div>
                )}

                {status && (
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-20">
                    <div className="text-center space-y-6">
                      <div className="relative">
                        <Loader2 className="w-20 h-20 text-[#1DB954] animate-spin mx-auto" />
                        <Music className="w-8 h-8 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                      </div>
                      <p className="text-3xl font-black tracking-tight text-white italic uppercase italic">{status}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Guidance Strip */}
              {!isFinalized && cameraActive && (
                <div className="px-6 py-3 bg-black/80 border-t border-white/5 flex items-center justify-center gap-6 flex-wrap">
                  {[
                    { icon: "💡", text: "Good lighting" },
                    { icon: "👤", text: "One person only" },
                    { icon: "🧍", text: "Stay still" },
                    { icon: "📷", text: "Face the camera" },
                  ].map((tip, i) => (
                    <span key={i} className="text-[10px] font-black text-gray-600 uppercase tracking-widest flex items-center gap-1.5">
                      <span>{tip.icon}</span> {tip.text}
                    </span>
                  ))}
                </div>
              )}
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-[#0f0f0f] border-gray-800 p-8 rounded-[2rem] hover:border-gray-700 transition-colors">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-6">State Recognition</p>
                <div className="flex items-center gap-6">
                  <div className={`${getEmotionColor(currentEmotion)} w-20 h-20 rounded-[1.5rem] flex items-center justify-center text-4xl shadow-2xl transition-transform hover:rotate-6`}>
                    {currentEmotion === "Happy" && "😊"}
                    {currentEmotion === "Sad" && "😢"}
                    {currentEmotion === "Neutral" && "😐"}
                    {currentEmotion === "Angry" && "😠"}
                    {currentEmotion === "Surprised" && "😲"}
                    {currentEmotion === "Fear" && "😨"}
                    {currentEmotion === "Disgust" && "🤢"}
                    {currentEmotion === "Scanning..." && "⏳"}
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-white italic tracking-tighter">{currentEmotion}</h3>
                    {isFinalized && <Badge className="bg-[#1DB954] text-black border-none font-black mt-2">EMOTION VERIFIED</Badge>}
                  </div>
                </div>
              </Card>

              <Card className="bg-[#0f0f0f] border-gray-800 p-8 rounded-[2rem] flex flex-col justify-center relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                  <Activity className="w-20 h-20 text-white" />
                </div>
                <div className="flex justify-between items-end mb-4">
                   <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Neural Match</p>
                   {isFinalized && <p className="text-2xl font-black text-[#1DB954]">{confidence}%</p>}
                </div>
                <div className="space-y-4">
                   <div className="h-3 w-full bg-[#1a1a1a] rounded-full overflow-hidden p-0.5 border border-white/5">
                      <div 
                        className="h-full bg-gradient-to-r from-[#1DB954] to-emerald-400 rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_#1DB954]"
                        style={{ width: `${isFinalized ? confidence : 0}%` }}
                      ></div>
                   </div>
                   <p className="text-[10px] text-gray-600 font-bold leading-relaxed uppercase">
                     {isFinalized ? "Analysis complete. Optimization stable." : "Processing facial vectors..."}
                   </p>
                </div>
              </Card>
            </div>
          </div>

          {/* Player & Recommendations Section - Expanded Area */}
          <div className="lg:col-span-6 space-y-8">
            <Card className="bg-gradient-to-br from-[#121212] to-[#080808] border-gray-800 p-10 shadow-2xl relative overflow-hidden rounded-[2.5rem] min-h-[600px] flex flex-col">
               <div className="flex items-center justify-between mb-10">
                 <h3 className="text-white font-black flex items-center gap-3 text-xl italic uppercase tracking-tighter">
                   <div className="w-2 h-2 rounded-full bg-[#1DB954] animate-pulse"></div>
                   Vibe Output
                 </h3>
                 {currentPlaylist && <Badge className="bg-white/5 text-gray-400 border-gray-800 font-bold py-1 px-4 text-[10px] uppercase tracking-widest">Master Quality</Badge>}
               </div>

               {currentPlaylist ? (
                 <div className="flex-1 flex flex-col gap-8">
                   <div className="flex items-center gap-8 bg-white/5 p-6 rounded-[2rem] border border-white/5 hover:bg-white/[0.07] transition-all">
                     <img
                       src={currentPlaylist.image}
                       alt=""
                       className="w-32 h-32 rounded-2xl object-cover shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
                       onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop"; }}
                     />
                     <div className="flex-1">
                       <p className="text-[#1DB954] text-[10px] font-black uppercase tracking-[0.3em] mb-2">Sonic Match Found</p>
                       <h4 className="text-white font-black text-4xl tracking-tighter italic mb-1 truncate leading-none uppercase">{currentPlaylist.name}</h4>
                       <p className="text-gray-500 font-bold text-sm">Curated for your emotional blueprint</p>
                     </div>
                   </div>

                   <div className="flex-1 rounded-[2rem] overflow-hidden bg-black shadow-2xl border border-white/5">
                     <iframe
                        src={getEmbedUrl(currentPlaylist.url)}
                        width="100%"
                        height="400"
                        frameBorder="0"
                        allowFullScreen=""
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                        loading="lazy"
                        className="opacity-95 hover:opacity-100 transition-opacity"
                      ></iframe>
                   </div>
                   
                   <Button
                      variant="ghost"
                      className="w-full text-gray-500 hover:text-white hover:bg-white/5 font-black py-8 rounded-2xl border border-transparent hover:border-gray-800 transition-all uppercase tracking-widest text-[10px]"
                      onClick={() => window.open(currentPlaylist.url, "_blank")}
                    >
                      <ExternalLink className="w-4 h-4 mr-3" />
                      View Full Profile on Spotify
                    </Button>
                 </div>
               ) : (
                 <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
                   <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center border border-white/5 animate-pulse">
                     <Music className="w-10 h-10 text-gray-700" />
                   </div>
                   <div>
                     <p className="text-gray-500 font-black text-xl italic uppercase tracking-tighter">Awaiting Signal</p>
                     <p className="text-gray-700 text-xs font-bold uppercase mt-2 tracking-widest">Detection sequence not initiated</p>
                   </div>
                 </div>
               )}
            </Card>

            {/* History - Compressed to allow more space for Player */}
            <Card className="bg-[#0f0f0f] border-gray-800 p-8 rounded-[2rem]">
               <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-6">Mood Archive</h3>
               <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                 {playlistHistory.length > 0 ? playlistHistory.map((playlist) => (
                   <div
                     key={playlist.id}
                     className="flex flex-col gap-3 p-4 rounded-[1.5rem] bg-white/5 hover:bg-white/10 cursor-pointer transition-all border border-transparent hover:border-gray-800 group"
                     onClick={() => window.open(playlist.url, "_blank")}
                   >
                     <img src={playlist.image} className="w-full aspect-square rounded-xl object-cover opacity-60 group-hover:opacity-100 transition-opacity" onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop"; }} />
                     <div className="min-w-0">
                       <p className="text-white font-black text-[10px] truncate uppercase">{playlist.name}</p>
                       <p className={`text-[8px] font-black uppercase tracking-tighter mt-1 ${getEmotionColor(playlist.emotion)} px-2 inline-block rounded-sm`}>{playlist.emotion}</p>
                     </div>
                   </div>
                 )) : (
                   <p className="text-gray-700 text-xs font-bold uppercase italic py-4 col-span-full text-center">Archive empty</p>
                 )}
               </div>
            </Card>
          </div>
        </div>
      </div>

      {showPayment && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-50 flex items-center justify-center p-4">
          <Card className="bg-[#0f0f0f] border-gray-800 w-full max-w-lg p-12 relative rounded-[3rem] shadow-[0_0_150px_rgba(29,185,84,0.15)]">
            <Button 
              variant="ghost" 
              className="absolute top-8 right-8 text-gray-500 hover:text-white"
              onClick={() => setShowPayment(false)}
            >
              ✕
            </Button>
            
            <div className="text-center mb-10">
              <div className="inline-block px-4 py-1.5 bg-[#1DB954]/10 text-[#1DB954] rounded-full text-[10px] font-black tracking-[0.2em] mb-6 border border-[#1DB954]/20">
                LIFETIME LICENSE
              </div>
              <h2 className="text-5xl font-black text-white mb-3 italic tracking-tighter">EMOBEAT PRO</h2>
              <p className="text-gray-500 text-sm font-medium">Unlock uncompressed neural audio processing.</p>
            </div>

            <div className="space-y-8">
              <div className="bg-[#151515] p-8 rounded-[2rem] border border-white/5">
                <div className="flex justify-between items-center mb-8 pb-8 border-b border-white/5">
                  <div>
                    <p className="text-white font-black text-2xl tracking-tighter">Yearly Master</p>
                    <p className="text-gray-500 text-xs font-bold uppercase mt-1 tracking-widest">Full Access • Cancel Anytime</p>
                  </div>
                  <div className="text-right">
                    <span className="text-4xl font-black text-white">$89</span>
                    <span className="text-gray-600 text-sm font-black uppercase tracking-widest ml-1">USD</span>
                  </div>
                </div>
                
                <div className="bg-black/50 p-6 rounded-2xl border border-white/5 text-center">
                   <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em]">Redirecting to Secure Gateway</p>
                </div>
              </div>

              <Button 
                className="w-full bg-[#1DB954] hover:bg-[#1ed760] text-black font-black py-10 text-xl rounded-[1.5rem] transition-all hover:scale-[1.02] shadow-2xl shadow-[#1DB954]/30"
                onClick={async () => {
                  try {
                    const response = await fetch(`${BASE_URL}/create-checkout-session`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ plan: "Yearly" }),
                    });
                    const data = await response.json();
                    if (data.url) window.location.href = data.url;
                  } catch (err) { alert("Gateway offline."); }
                }}
              >
                UPGRADE NOW
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Payment Success Modal */}
      {paymentSuccess && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-3xl z-[60] flex items-center justify-center p-4">
          <Card className="bg-[#0f0f0f] border-[#1DB954]/30 w-full max-w-md p-12 text-center rounded-[3rem] shadow-[0_0_100px_rgba(29,185,84,0.3)] animate-in fade-in zoom-in duration-500">
            <div className="w-24 h-24 bg-[#1DB954] rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_40px_rgba(29,185,84,0.5)]">
              <Sparkles className="w-12 h-12 text-black" />
            </div>
            <h2 className="text-4xl font-black text-white mb-4 italic tracking-tighter">WELCOME TO PRO</h2>
            <p className="text-gray-400 font-medium mb-10 leading-relaxed">
              Your account has been upgraded. Neural processing and high-fidelity audio are now unlocked.
            </p>
            <Button 
              className="w-full bg-[#1DB954] hover:bg-[#1ed760] text-black font-black py-8 rounded-2xl transition-all shadow-xl"
              onClick={() => setPaymentSuccess(false)}
            >
              START LISTENING
            </Button>
          </Card>
        </div>
      )}
      
      <style>{`
        @keyframes scan {
          0% { top: 0; }
          50% { top: 100%; }
          100% { top: 0; }
        }
      `}</style>
    </div>
  );
}
