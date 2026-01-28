import React, { useState, useEffect, useRef } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Play, Pause, SkipForward, SkipBack, Volume2, Camera, AlertCircle } from "lucide-react";
import { Slider } from "./ui/slider";

const emotions = ["Happy", "Sad", "Neutral", "Angry", "Surprised", "Calm"];

const mockPlaylists = [
  {
    id: 1,
    name: "Happy Vibes",
    image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop",
    emotion: "Happy"
  },
  {
    id: 2,
    name: "Chill Beats",
    image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=300&h=300&fit=crop",
    emotion: "Calm"
  },
  {
    id: 3,
    name: "Energetic Mix",
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&h=300&fit=crop",
    emotion: "Happy"
  },
  {
    id: 4,
    name: "Reflective Moments",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop",
    emotion: "Sad"
  }
];

export function MainDashboard({ onNavigate }) {
  const [currentEmotion, setCurrentEmotion] = useState("Happy");
  const [confidence, setConfidence] = useState(92);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState([75]);
  const [progress, setProgress] = useState(45);
  const [cameraActive, setCameraActive] = useState(true);
  const [faceDetected, setFaceDetected] = useState(true);
  const videoRef = useRef(null);

  // Simulate emotion changes
  useEffect(() => {
    const interval = setInterval(() => {
      const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
      const randomConfidence = Math.floor(Math.random() * 20) + 80;
      setCurrentEmotion(randomEmotion);
      setConfidence(randomConfidence);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Simulate playback progress
  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setProgress(prev => (prev >= 100 ? 0 : prev + 1));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isPlaying]);

  const getEmotionColor = (emotion) => {
    const colors = {
      Happy: "bg-yellow-500",
      Sad: "bg-blue-500",
      Neutral: "bg-gray-500",
      Angry: "bg-red-500",
      Surprised: "bg-purple-500",
      Calm: "bg-green-500"
    };
    return colors[emotion] || "bg-gray-500";
  };

  return (
    <div className="min-h-screen bg-[#121212] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">EmoBeat Dashboard</h1>
          <div className="flex items-center gap-2">
            <Badge variant={cameraActive ? "default" : "secondary"} className="bg-[#1DB954] text-black">
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
                <p className="text-yellow-500 font-medium">No face detected</p>
                <p className="text-sm text-yellow-500/80">Please position yourself in front of the camera</p>
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
                  className="w-full h-full object-cover"
                  autoPlay
                  muted
                  playsInline
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Camera className="w-16 h-16 text-gray-600" />
                </div>
                <div className="absolute top-4 right-4">
                  <div className="bg-red-500 w-3 h-3 rounded-full animate-pulse"></div>
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
                  </div>
                  <div className="flex-1">
                    <p className="text-2xl font-bold text-white">{currentEmotion}</p>
                    <p className="text-[#1DB954]">Confidence: {confidence}%</p>
                  </div>
                </div>
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
              </div>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <Card className="bg-[#181818] border-[#282828] p-6">
              <h3 className="text-white mb-4">Recommended for {currentEmotion}</h3>
              <div className="grid grid-cols-2 gap-4">
                {mockPlaylists.map((playlist) => (
                  <div
                    key={playlist.id}
                    className="group cursor-pointer"
                    onClick={() => setIsPlaying(true)}
                  >
                    <div className="relative aspect-square rounded-lg overflow-hidden mb-2">
                      <img
                        src={playlist.image}
                        alt={playlist.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Play className="w-12 h-12 text-white" fill="white" />
                      </div>
                    </div>
                    <p className="text-white font-medium truncate">{playlist.name}</p>
                    <p className="text-sm text-gray-400">{playlist.emotion}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="bg-[#181818] border-[#282828] p-6">
              <h3 className="text-white mb-4">Now Playing</h3>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <img
                    src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=80&h=80&fit=crop"
                    alt="Album Art"
                    className="w-20 h-20 rounded-lg"
                  />
                  <div className="flex-1">
                    <p className="text-white font-medium">Feel Good Hits</p>
                    <p className="text-sm text-gray-400">Various Artists</p>
                    <p className="text-xs text-gray-500 mt-1">Happy Mix</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Slider
                    value={[progress]}
                    max={100}
                    step={1}
                    className="w-full"
                    onValueChange={(value) => setProgress(value[0])}
                  />
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>1:23</span>
                    <span>3:45</span>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-4">
                  <Button size="icon" variant="ghost" className="text-gray-400 hover:text-white">
                    <SkipBack className="w-5 h-5" />
                  </Button>
                  <Button
                    size="icon"
                    className="bg-[#1DB954] hover:bg-[#1ed760] text-black w-12 h-12 rounded-full"
                    onClick={() => setIsPlaying(!isPlaying)}
                  >
                    {isPlaying ? <Pause className="w-6 h-6" fill="black" /> : <Play className="w-6 h-6" fill="black" />}
                  </Button>
                  <Button size="icon" variant="ghost" className="text-gray-400 hover:text-white">
                    <SkipForward className="w-5 h-5" />
                  </Button>
                </div>

                <div className="flex items-center gap-3">
                  <Volume2 className="w-5 h-5 text-gray-400" />
                  <Slider value={volume} max={100} step={1} className="w-full" onValueChange={setVolume} />
                  <span className="text-sm text-gray-400 w-10">{volume[0]}%</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
