import React, { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Activity, Users, Music, TrendingUp, Lock, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

const ADMIN_PASSWORD = "emobeat@admin2026";

// Helper: read real stats from localStorage
function loadStats() {
  try {
    return JSON.parse(localStorage.getItem("emobeat_scan_history") || "[]");
  } catch {
    return [];
  }
}

function buildEmotionDistribution(scans) {
  const counts = {};
  scans.forEach(s => {
    counts[s.emotion] = (counts[s.emotion] || 0) + 1;
  });
  return Object.entries(counts).map(([emotion, count]) => ({ emotion, count }));
}

function buildDailyTrend(scans) {
  const days = {};
  scans.forEach(s => {
    const d = new Date(s.timestamp).toLocaleDateString("en-GB", { month: "short", day: "numeric" });
    days[d] = (days[d] || 0) + 1;
  });
  return Object.entries(days).slice(-7).map(([date, scans]) => ({ date, scans }));
}

// --- Admin Login Gate ---
function AdminLogin({ onSuccess }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [show, setShow] = useState(false);

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      onSuccess();
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
      <Card className={`bg-[#0f0f0f] border-gray-800 w-full max-w-md p-12 rounded-[3rem] text-center transition-all duration-300 ${error ? "border-red-500/50 shadow-[0_0_40px_rgba(239,68,68,0.2)]" : "shadow-[0_0_60px_rgba(29,185,84,0.1)]"}`}>
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8 transition-all ${error ? "bg-red-500/20" : "bg-[#1DB954]/10"}`}>
          <Lock className={`w-10 h-10 transition-all ${error ? "text-red-500" : "text-[#1DB954]"}`} />
        </div>
        <h2 className="text-3xl font-black text-white italic tracking-tighter mb-2">ADMIN ACCESS</h2>
        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-10">Restricted Area · Authorized Only</p>

        <div className="relative mb-4">
          <input
            type={show ? "text" : "password"}
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleLogin()}
            placeholder="Enter admin password"
            className={`w-full bg-[#151515] border rounded-2xl px-6 py-4 text-white placeholder-gray-600 outline-none transition-all font-mono text-sm ${error ? "border-red-500" : "border-gray-800 focus:border-[#1DB954]"}`}
          />
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white transition-colors"
            onClick={() => setShow(!show)}
          >
            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        {error && <p className="text-red-400 text-xs font-bold uppercase tracking-widest mb-4 animate-pulse">⛔ Incorrect password</p>}

        <Button
          className="w-full bg-[#1DB954] hover:bg-[#1ed760] text-black font-black py-7 rounded-2xl transition-all hover:scale-[1.02] shadow-xl"
          onClick={handleLogin}
        >
          <ShieldCheck className="w-5 h-5 mr-2" /> AUTHENTICATE
        </Button>
      </Card>
    </div>
  );
}

// --- Main Admin Dashboard ---
export function AdminDashboard() {
  const [authenticated, setAuthenticated] = useState(false);
  const [scans, setScans] = useState([]);

  useEffect(() => {
    if (authenticated) {
      setScans(loadStats());
    }
  }, [authenticated]);

  if (!authenticated) {
    return <AdminLogin onSuccess={() => setAuthenticated(true)} />;
  }

  const emotionDist = buildEmotionDistribution(scans);
  const dailyTrend = buildDailyTrend(scans);
  const totalScans = scans.length;
  const uniqueDays = new Set(scans.map(s => new Date(s.timestamp).toDateString())).size;
  const topEmotion = emotionDist.sort((a, b) => b.count - a.count)[0]?.emotion || "N/A";
  const avgPerDay = uniqueDays > 0 ? (totalScans / uniqueDays).toFixed(1) : 0;

  return (
    <div className="min-h-screen bg-[#050505] p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-white italic tracking-tighter">ADMIN PANEL</h1>
            <p className="text-gray-500 text-xs uppercase tracking-widest font-bold mt-1">Real-Time System Analytics</p>
          </div>
          <Badge className="bg-[#1DB954]/10 text-[#1DB954] border border-[#1DB954]/30 font-bold px-4 py-2">
            <ShieldCheck className="w-4 h-4 mr-2" /> Authenticated Session
          </Badge>
        </div>

        {/* Key Metrics - REAL DATA */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Scans", value: totalScans, icon: Activity, color: "text-[#1DB954]", bg: "bg-[#1DB954]/10" },
            { label: "Active Days", value: uniqueDays, icon: TrendingUp, color: "text-blue-400", bg: "bg-blue-400/10" },
            { label: "Dominant Mood", value: topEmotion, icon: Users, color: "text-purple-400", bg: "bg-purple-400/10" },
            { label: "Avg Scans/Day", value: avgPerDay, icon: Music, color: "text-yellow-400", bg: "bg-yellow-400/10" },
          ].map((m, i) => {
            const Icon = m.icon;
            return (
              <Card key={i} className="bg-[#0f0f0f] border-gray-800 p-6 rounded-[2rem] hover:border-gray-700 transition-colors">
                <div className={`${m.bg} w-12 h-12 rounded-2xl flex items-center justify-center mb-4`}>
                  <Icon className={`w-6 h-6 ${m.color}`} />
                </div>
                <p className="text-3xl font-black text-white">{m.value}</p>
                <p className="text-gray-500 text-xs uppercase tracking-widest font-bold mt-1">{m.label}</p>
              </Card>
            );
          })}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-[#0f0f0f] border-gray-800 p-8 rounded-[2rem]">
            <h3 className="text-white font-black italic uppercase tracking-tighter text-lg mb-6">Emotion Distribution</h3>
            {emotionDist.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={emotionDist}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
                  <XAxis dataKey="emotion" stroke="#555" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#555" tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: "#0f0f0f", border: "1px solid #222", borderRadius: "12px", color: "#fff" }} />
                  <Bar dataKey="count" fill="#1DB954" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-gray-700 font-black italic uppercase">No scan data yet</div>
            )}
          </Card>

          <Card className="bg-[#0f0f0f] border-gray-800 p-8 rounded-[2rem]">
            <h3 className="text-white font-black italic uppercase tracking-tighter text-lg mb-6">Daily Scan Trend</h3>
            {dailyTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={dailyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
                  <XAxis dataKey="date" stroke="#555" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#555" tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: "#0f0f0f", border: "1px solid #222", borderRadius: "12px", color: "#fff" }} />
                  <Line type="monotone" dataKey="scans" stroke="#1DB954" strokeWidth={2} dot={{ fill: "#1DB954", r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-gray-700 font-black italic uppercase">No trend data yet</div>
            )}
          </Card>
        </div>

        {/* Recent Scan Log */}
        <Card className="bg-[#0f0f0f] border-gray-800 p-8 rounded-[2rem]">
          <h3 className="text-white font-black italic uppercase tracking-tighter text-lg mb-6">Recent Scan Log</h3>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {scans.length > 0 ? [...scans].reverse().slice(0, 20).map((scan, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-[#151515] rounded-2xl border border-white/5 hover:border-gray-700 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#1DB954]/10 flex items-center justify-center text-lg">
                    {scan.emotion === "Happy" && "😊"}
                    {scan.emotion === "Sad" && "😢"}
                    {scan.emotion === "Angry" && "😠"}
                    {scan.emotion === "Neutral" && "😐"}
                    {scan.emotion === "Surprise" && "😲"}
                    {scan.emotion === "Fear" && "😨"}
                    {scan.emotion === "Disgust" && "🤢"}
                  </div>
                  <div>
                    <p className="text-white font-black text-sm uppercase tracking-tight">{scan.emotion}</p>
                    <p className="text-gray-600 text-xs font-bold">{scan.playlist}</p>
                  </div>
                </div>
                <p className="text-gray-600 text-xs font-bold">{new Date(scan.timestamp).toLocaleString()}</p>
              </div>
            )) : (
              <p className="text-gray-700 font-black italic uppercase text-center py-8">No scans recorded yet. Start scanning!</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
