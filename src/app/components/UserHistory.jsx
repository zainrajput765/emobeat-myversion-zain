import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Calendar, Clock, Music, Trash2 } from "lucide-react";
import { Button } from "./ui/button";

const getEmotionColor = (emotion) => {
  const colors = {
    Happy: "bg-yellow-500/20 text-yellow-500 border-yellow-500/30",
    Sad: "bg-blue-500/20 text-blue-500 border-blue-500/30",
    Neutral: "bg-gray-500/20 text-gray-400 border-gray-500/30",
    Angry: "bg-red-500/20 text-red-500 border-red-500/30",
    Surprise: "bg-purple-500/20 text-purple-500 border-purple-500/30",
    Fear: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
    Disgust: "bg-green-900/20 text-green-600 border-green-900/30",
  };
  return colors[emotion] || "bg-gray-500/20 text-gray-400 border-gray-500/30";
};

const getEmotionEmoji = (emotion) => {
  const emojis = { Happy: "😊", Sad: "😢", Neutral: "😐", Angry: "😠", Surprise: "😲", Fear: "😨", Disgust: "🤢" };
  return emojis[emotion] || "🎵";
};

const formatDate = (isoString) => {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  const timeStr = date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  if (diffDays === 0) return { date: "Today", time: timeStr };
  if (diffDays === 1) return { date: "Yesterday", time: timeStr };
  return { date: date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }), time: timeStr };
};

export function UserHistory() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    try {
      const raw = JSON.parse(localStorage.getItem("emobeat_scan_history") || "[]");
      setHistory([...raw].reverse()); // Most recent first
    } catch {
      setHistory([]);
    }
  }, []);

  const totalSessions = history.length;
  const emotionCounts = history.reduce((acc, h) => { acc[h.emotion] = (acc[h.emotion] || 0) + 1; return acc; }, {});
  const topEmotion = Object.entries(emotionCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";

  const clearHistory = () => {
    localStorage.removeItem("emobeat_scan_history");
    setHistory([]);
  };

  return (
    <div className="min-h-screen bg-[#050505] p-6 md:p-10">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black text-white italic tracking-tighter">MOOD ARCHIVE</h1>
            <p className="text-gray-500 text-xs uppercase tracking-widest font-bold mt-1">Your emotional scan history</p>
          </div>
          {history.length > 0 && (
            <Button
              variant="outline"
              className="border-red-500/30 text-red-500 hover:bg-red-500/10 font-bold"
              onClick={clearHistory}
            >
              <Trash2 className="w-4 h-4 mr-2" /> Clear All
            </Button>
          )}
        </div>

        {/* Stats Cards - REAL DATA */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-[#0f0f0f] border-gray-800 p-6 rounded-[2rem]">
            <div className="flex items-center gap-4">
              <div className="bg-[#1DB954]/10 p-3 rounded-2xl">
                <Music className="w-6 h-6 text-[#1DB954]" />
              </div>
              <div>
                <p className="text-3xl font-black text-white">{totalSessions}</p>
                <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Total Scans</p>
              </div>
            </div>
          </Card>

          <Card className="bg-[#0f0f0f] border-gray-800 p-6 rounded-[2rem]">
            <div className="flex items-center gap-4">
              <div className="bg-yellow-500/10 p-3 rounded-2xl">
                <Calendar className="w-6 h-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-3xl font-black text-white">{getEmotionEmoji(topEmotion)}</p>
                <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">{topEmotion === "—" ? "No data" : `Top: ${topEmotion}`}</p>
              </div>
            </div>
          </Card>

          <Card className="bg-[#0f0f0f] border-gray-800 p-6 rounded-[2rem]">
            <div className="flex items-center gap-4">
              <div className="bg-blue-500/10 p-3 rounded-2xl">
                <Clock className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-3xl font-black text-white">{Object.keys(emotionCounts).length}</p>
                <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Unique Moods Detected</p>
              </div>
            </div>
          </Card>
        </div>

        {/* History List */}
        <Card className="bg-[#0f0f0f] border-gray-800 rounded-[2rem] overflow-hidden">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="text-6xl mb-6">🎵</div>
              <p className="text-gray-500 font-black italic uppercase text-lg tracking-tighter">No history yet</p>
              <p className="text-gray-700 text-xs font-bold uppercase tracking-widest mt-2">Go scan your emotion on the dashboard!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-900">
              {history.map((entry, i) => {
                const { date, time } = formatDate(entry.timestamp);
                return (
                  <div key={i} className="p-5 hover:bg-white/5 transition-colors flex items-center gap-5">
                    {/* Emoji */}
                    <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-3xl flex-shrink-0">
                      {getEmotionEmoji(entry.emotion)}
                    </div>

                    {/* Playlist Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-black truncate uppercase tracking-tight">{entry.playlist}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="w-3 h-3 text-gray-600" />
                        <span className="text-xs text-gray-600 font-bold">{date} at {time}</span>
                      </div>
                    </div>

                    {/* Emotion Badge */}
                    <Badge variant="outline" className={`${getEmotionColor(entry.emotion)} font-black uppercase text-[10px] tracking-wider`}>
                      {entry.emotion}
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
