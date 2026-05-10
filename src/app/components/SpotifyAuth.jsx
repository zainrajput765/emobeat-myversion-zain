import { useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Music2, Check, Shield, Zap, User, Mail, ChevronRight } from "lucide-react";

const OAUTH_STEPS = [
  { step: 1, label: "System requests Spotify login",     icon: "🔑" },
  { step: 2, label: "Redirecting to Spotify auth page",  icon: "🌐" },
  { step: 3, label: "Granting permission",               icon: "✅" },
  { step: 4, label: "Spotify sends auth code",           icon: "📨" },
  { step: 5, label: "Exchanging code for access token",  icon: "🔒" },
  { step: 6, label: "Returning to application",         icon: "🎵" },
];

export function SpotifyAuth({ onAuthenticate, onSkip }) {
  const [view, setView]               = useState("landing"); // landing | form | oauth | done
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail]             = useState("");
  const [formError, setFormError]     = useState("");
  const [currentOAuthStep, setCurrentOAuthStep] = useState(0);

  const permissions = [
    "Access your listening history",
    "Control playback on your devices",
    "Read your currently playing track",
    "Modify your playlists",
  ];

  const handleBeginConnect = () => {
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
    window.location.href = `${apiUrl}/auth/login`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#050505] via-[#0d0d0d] to-[#050505] px-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#1DB954]/5 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-xl space-y-5 relative z-10">
        <Card className="bg-[#0f0f0f] border-gray-800 p-10 rounded-[2.5rem] shadow-[0_30px_80px_rgba(0,0,0,0.6)]">

          {/* ── LANDING VIEW ── */}
          {view === "landing" && (
            <>
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-[#1DB954] rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(29,185,84,0.35)]">
                  <Music2 className="w-10 h-10 text-black" />
                </div>
                <h2 className="text-4xl font-black text-white italic tracking-tighter mb-2">Connect Spotify</h2>
                <p className="text-gray-500 text-sm">OAuth 2.0 Authentication · Client Credentials Flow</p>
              </div>

              <div className="space-y-3 mb-8">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4">EmoBeat will be able to:</p>
                {permissions.map((p, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-white/[0.03] rounded-xl border border-white/5">
                    <div className="w-6 h-6 bg-[#1DB954]/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-3.5 h-3.5 text-[#1DB954]" />
                    </div>
                    <span className="text-gray-300 text-sm font-medium">{p}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleBeginConnect}
                  className="w-full bg-[#1DB954] hover:bg-[#1ed760] text-black font-black py-7 text-base rounded-[1.2rem] transition-all hover:scale-[1.02] shadow-2xl shadow-[#1DB954]/20"
                >
                  <Music2 className="w-5 h-5 mr-2" /> Authorize with Spotify
                </Button>
                <Button
                  variant="ghost"
                  onClick={onSkip}
                  className="w-full text-gray-600 hover:text-gray-400 hover:bg-white/5 font-bold py-5 rounded-[1.2rem] border border-white/5 transition-all"
                >
                  <User className="w-4 h-4 mr-2" /> Continue as Anonymous
                </Button>
              </div>
              <p className="text-[10px] text-center text-gray-700 mt-4">
                By connecting, you agree to Spotify's Terms of Service and Privacy Policy
              </p>
            </>
          )}

          {/* ── FORM VIEW ── */}
          {view === "form" && (
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-[#1DB954]/15 border border-[#1DB954]/30 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <User className="w-8 h-8 text-[#1DB954]" />
                </div>
                <h2 className="text-3xl font-black text-white italic tracking-tighter mb-1">Your Account</h2>
                <p className="text-gray-500 text-sm">Enter your details to link your Spotify profile</p>
              </div>

              <div className="space-y-4 mb-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Display Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                    <input
                      type="text"
                      value={displayName}
                      onChange={e => setDisplayName(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && handleFormSubmit()}
                      placeholder="Your name"
                      className="w-full bg-[#151515] border border-gray-800 focus:border-[#1DB954] rounded-2xl pl-11 pr-5 py-4 text-white placeholder-gray-600 outline-none transition-all text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Spotify Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && handleFormSubmit()}
                      placeholder="you@email.com"
                      className="w-full bg-[#151515] border border-gray-800 focus:border-[#1DB954] rounded-2xl pl-11 pr-5 py-4 text-white placeholder-gray-600 outline-none transition-all text-sm"
                    />
                  </div>
                </div>

                {formError && (
                  <p className="text-red-400 text-xs font-bold uppercase tracking-widest animate-pulse">⚠ {formError}</p>
                )}
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleFormSubmit}
                  className="w-full bg-[#1DB954] hover:bg-[#1ed760] text-black font-black py-7 text-base rounded-[1.2rem] transition-all hover:scale-[1.02] shadow-xl"
                >
                  Connect &amp; Continue <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setView("landing")}
                  className="w-full text-gray-600 hover:text-gray-400 font-bold py-4 rounded-[1.2rem] transition-all"
                >
                  ← Back
                </Button>
              </div>
            </>
          )}

          {/* ── OAUTH ANIMATION VIEW ── */}
          {(view === "oauth" || view === "done") && (
            <>
              <div className="text-center mb-8">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 transition-all duration-500 ${view === "done" ? "bg-[#1DB954] shadow-[0_0_40px_rgba(29,185,84,0.5)]" : "bg-[#1DB954]/15 border border-[#1DB954]/30"}`}>
                  {view === "done"
                    ? <Check className="w-8 h-8 text-black" />
                    : <div className="w-7 h-7 border-2 border-[#1DB954] border-t-transparent rounded-full animate-spin" />
                  }
                </div>
                <h2 className="text-3xl font-black text-white italic tracking-tighter mb-1">
                  {view === "done" ? "Connected!" : "Authenticating…"}
                </h2>
                <p className="text-gray-500 text-sm">OAuth 2.0 Flow in Progress</p>
              </div>

              <div className="space-y-2 mb-6">
                {OAUTH_STEPS.map(s => {
                  const isComplete = currentOAuthStep > s.step;
                  const isActive   = currentOAuthStep === s.step;
                  return (
                    <div
                      key={s.step}
                      className={`flex items-center gap-4 p-3 rounded-xl transition-all duration-300 border ${
                        isComplete ? "border-[#1DB954]/30 bg-[#1DB954]/5"
                        : isActive  ? "border-[#1DB954]/60 bg-[#1DB954]/10"
                        : "border-white/5 opacity-30"
                      }`}
                    >
                      <span className="text-lg">{s.icon}</span>
                      <span className={`text-sm font-bold flex-1 ${isComplete ? "text-[#1DB954]" : isActive ? "text-white" : "text-gray-600"}`}>
                        {s.label}
                      </span>
                      {isComplete && <Check className="w-4 h-4 text-[#1DB954]" />}
                      {isActive && <div className="w-4 h-4 rounded-full border-2 border-[#1DB954] border-t-transparent animate-spin" />}
                    </div>
                  );
                })}
              </div>

              {view === "done" && (
                <div className="bg-[#1DB954]/10 border border-[#1DB954]/30 rounded-2xl p-4 text-center">
                  <p className="text-[#1DB954] font-black text-sm">Welcome, {displayName}! 🎵</p>
                  <p className="text-gray-500 text-xs mt-1">Redirecting to your dashboard…</p>
                </div>
              )}
            </>
          )}
        </Card>

        {/* Info badges */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: <Shield className="w-4 h-4" />, label: "No video stored", sub: "Images never leave your session" },
            { icon: <Zap className="w-4 h-4" />, label: "Real-time AI",   sub: "ResNet-18 on-demand inference" },
          ].map((item, i) => (
            <Card key={i} className="bg-[#0f0f0f] border-gray-800 p-5 rounded-2xl flex items-start gap-3">
              <div className="text-[#1DB954] mt-0.5">{item.icon}</div>
              <div>
                <p className="text-white font-black text-xs uppercase tracking-wider">{item.label}</p>
                <p className="text-gray-600 text-[10px] mt-0.5">{item.sub}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
