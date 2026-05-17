import React, { useEffect, useState } from "react";
import { Card } from "./ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { Activity, Sparkles, TrendingUp, Music } from "lucide-react";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const COLORS = {
  Happy: "#facc15",
  Sad: "#2563eb",
  Neutral: "#10b981",
  Angry: "#e11d48",
  Surprised: "#a855f7",
  Fear: "#312e81",
  Disgust: "#65a30d"
};

export function AnalyticsDashboard({ userData }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!userData?.spotifyId) return;
      try {
        const response = await fetch(`${BASE_URL}/api/analytics/${userData.spotifyId}`);
        if (!response.ok) throw new Error("Failed to load analytics");
        const json = await response.json();
        setData(json);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [userData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white">
        <Activity className="w-12 h-12 text-[#1DB954] animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white">
        <p className="text-red-500 font-black text-xl uppercase">{error}</p>
      </div>
    );
  }

  // Format history for LineChart
  const timelineData = data?.history?.map((h, i) => ({
    name: `Scan ${data.totalScans - i}`,
    confidence: h.confidence
  })).reverse() || [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#050505] text-gray-900 dark:text-white p-4 md:p-8 font-sans transition-colors duration-300">
      <div className="max-w-[1200px] mx-auto space-y-8">
        <header className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-gray-200 dark:border-white/10 pb-8">
          <div>
            <h1 className="text-4xl font-black tracking-tighter italic text-gray-900 dark:text-white flex items-center gap-3">
              PRO ANALYTICS <Sparkles className="w-8 h-8 text-[#1DB954]" />
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-xs font-black uppercase tracking-[0.3em] mt-1">Advanced Neural Metrics</p>
          </div>
          <div className="bg-[#1DB954]/10 text-[#1DB954] px-6 py-3 rounded-2xl border border-[#1DB954]/20 flex items-center gap-3">
            <TrendingUp className="w-5 h-5" />
            <span className="font-black uppercase tracking-widest text-sm">Total Scans: {data?.totalScans || 0}</span>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Emotion Distribution Pie Chart */}
          <Card className="bg-white dark:bg-[#0f0f0f] border-gray-200 dark:border-gray-800 p-8 rounded-[2rem] shadow-sm transition-colors duration-300">
            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-6">Emotion Distribution</h3>
            <div className="h-[300px] w-full">
              {data?.emotionDistribution?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.emotionDistribution}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={110}
                      paddingAngle={5}
                    >
                      {data.emotionDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[entry.name] || "#1DB954"} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '1rem' }}
                      itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500 italic">No data yet</div>
              )}
            </div>
            {/* Legend */}
            <div className="flex flex-wrap gap-4 mt-6 justify-center">
              {data?.emotionDistribution?.map((em) => (
                <div key={em.name} className="flex items-center gap-2 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[em.name] || "#1DB954" }}></div>
                  {em.name} ({em.value})
                </div>
              ))}
            </div>
          </Card>

          {/* AI Confidence Timeline */}
          <Card className="bg-white dark:bg-[#0f0f0f] border-gray-200 dark:border-gray-800 p-8 rounded-[2rem] shadow-sm transition-colors duration-300">
            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-6">Confidence Trends</h3>
            <div className="h-[300px] w-full">
              {timelineData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timelineData}>
                    <XAxis dataKey="name" stroke="#333" tick={{fill: '#666', fontSize: 10}} />
                    <YAxis stroke="#333" domain={[0, 100]} tick={{fill: '#666', fontSize: 10}} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '1rem' }}
                    />
                    <Line type="monotone" dataKey="confidence" stroke="#1DB954" strokeWidth={3} dot={{r: 4, fill: "#1DB954"}} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                 <div className="h-full flex items-center justify-center text-gray-500 italic">No data yet</div>
              )}
            </div>
          </Card>
        </div>

        {/* Recent Pro History List */}
        <Card className="bg-white dark:bg-[#0f0f0f] border-gray-200 dark:border-gray-800 p-8 rounded-[2rem] shadow-sm transition-colors duration-300">
           <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-6">Complete Log</h3>
           <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
             {data?.history?.map((h, i) => (
               <div key={i} className="flex items-center justify-between bg-gray-50 dark:bg-white/5 p-4 rounded-2xl border border-gray-100 dark:border-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                 <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-inner" style={{ backgroundColor: COLORS[h.emotion] || "#1DB954", color: "#000" }}>
                     {h.emotion === "Happy" ? "😊" : h.emotion === "Sad" ? "😢" : h.emotion === "Angry" ? "😠" : "😐"}
                   </div>
                   <div>
                     <p className="font-black uppercase tracking-wide text-gray-900 dark:text-white">{h.playlist}</p>
                     <p className="text-xs text-gray-500 font-bold mt-1">
                       {new Date(h.timestamp).toLocaleString()} • {h.confidence.toFixed(1)}% Confidence
                     </p>
                   </div>
                 </div>
                 <div className="text-[#1DB954]">
                   <Music className="w-5 h-5" />
                 </div>
               </div>
             ))}
             {data?.history?.length === 0 && (
               <p className="text-gray-500 italic text-center py-8">No scans recorded yet.</p>
             )}
           </div>
        </Card>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
      `}</style>
    </div>
  );
}
