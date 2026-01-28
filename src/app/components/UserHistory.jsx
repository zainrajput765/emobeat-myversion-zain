import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Calendar, Clock, Music } from "lucide-react";

const mockHistory = [
  {
    id: 1,
    date: "Today",
    time: "2:30 PM",
    emotion: "Happy",
    confidence: 92,
    track: "Good Vibes",
    artist: "Positive Energy",
    image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=100&h=100&fit=crop"
  },
  {
    id: 2,
    date: "Today",
    time: "11:15 AM",
    emotion: "Calm",
    confidence: 88,
    track: "Peaceful Mind",
    artist: "Relaxation Sounds",
    image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=100&h=100&fit=crop"
  },
  {
    id: 3,
    date: "Yesterday",
    time: "6:45 PM",
    emotion: "Energetic",
    confidence: 95,
    track: "Power Hour",
    artist: "Workout Mix",
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=100&h=100&fit=crop"
  },
  {
    id: 4,
    date: "Yesterday",
    time: "3:20 PM",
    emotion: "Sad",
    confidence: 79,
    track: "Melancholy",
    artist: "Emotional Ballads",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop"
  },
  {
    id: 5,
    date: "Jan 5, 2026",
    time: "8:00 AM",
    emotion: "Neutral",
    confidence: 85,
    track: "Morning Coffee",
    artist: "Chill Playlist",
    image: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=100&h=100&fit=crop"
  },
  {
    id: 6,
    date: "Jan 5, 2026",
    time: "1:30 PM",
    emotion: "Happy",
    confidence: 91,
    track: "Sunshine Day",
    artist: "Happy Hits",
    image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=100&h=100&fit=crop"
  }
];

const getEmotionColor = (emotion) => {
  const colors = {
    Happy: "bg-yellow-500/20 text-yellow-500 border-yellow-500/30",
    Sad: "bg-blue-500/20 text-blue-500 border-blue-500/30",
    Neutral: "bg-gray-500/20 text-gray-400 border-gray-500/30",
    Angry: "bg-red-500/20 text-red-500 border-red-500/30",
    Surprised: "bg-purple-500/20 text-purple-500 border-purple-500/30",
    Calm: "bg-green-500/20 text-green-500 border-green-500/30",
    Energetic: "bg-orange-500/20 text-orange-500 border-orange-500/30"
  };
  return colors[emotion] || "bg-gray-500/20 text-gray-400 border-gray-500/30";
};

export function UserHistory() {
  return (
    <div className="min-h-screen bg-[#121212] p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-white">Listening History</h1>
          <p className="text-gray-400">Track your emotional journey and music selections</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-[#181818] border-[#282828] p-6">
            <div className="flex items-center gap-3">
              <div className="bg-[#1DB954]/20 p-3 rounded-lg">
                <Music className="w-6 h-6 text-[#1DB954]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">124</p>
                <p className="text-sm text-gray-400">Total Sessions</p>
              </div>
            </div>
          </Card>

          <Card className="bg-[#181818] border-[#282828] p-6">
            <div className="flex items-center gap-3">
              <div className="bg-yellow-500/20 p-3 rounded-lg">
                <Calendar className="w-6 h-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">Happy</p>
                <p className="text-sm text-gray-400">Most Common Mood</p>
              </div>
            </div>
          </Card>

          <Card className="bg-[#181818] border-[#282828] p-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500/20 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">32h</p>
                <p className="text-sm text-gray-400">Total Listening Time</p>
              </div>
            </div>
          </Card>
        </div>

        {/* History List */}
        <Card className="bg-[#181818] border-[#282828]">
          <div className="divide-y divide-[#282828]">
            {mockHistory.map((entry) => (
              <div
                key={entry.id}
                className="p-4 hover:bg-[#282828]/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  {/* Album Art */}
                  <img
                    src={entry.image}
                    alt={entry.track}
                    className="w-16 h-16 rounded-lg"
                  />

                  {/* Track Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{entry.track}</p>
                    <p className="text-sm text-gray-400 truncate">{entry.artist}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="w-3 h-3 text-gray-500" />
                      <span className="text-xs text-gray-500">{entry.date} at {entry.time}</span>
                    </div>
                  </div>

                  {/* Emotion Badge */}
                  <div className="text-right">
                    <Badge
                      variant="outline"
                      className={getEmotionColor(entry.emotion)}
                    >
                      {entry.emotion}
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">{entry.confidence}% confidence</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
