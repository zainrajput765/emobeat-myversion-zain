import { useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Music2, Check, ChevronRight, Shield, Zap, User } from "lucide-react";

const OAUTH_STEPS = [
  { step: 1, label: "System requests Spotify login",      icon: "🔑" },
  { step: 2, label: "Redirecting to Spotify auth page",   icon: "🌐" },
  { step: 3, label: "Granting permission",                icon: "✅" },
  { step: 4, label: "Spotify sends auth code",            icon: "📨" },
  { step: 5, label: "Exchanging code for access token",   icon: "🔒" },
  { step: 6, label: "Returning to application",          icon: "🎵" },
];

export function SpotifyAuth({ onAuthenticate, onSkip }) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [currentOAuthStep, setCurrentOAuthStep] = useState(0);
  const [done, setDone] = useState(false);

  const permissions = [
    "Access your listening history",
    "Control playback on your devices",
    "Read your currently playing track",
    "Modify your playlists",
  ];

  const handleConnect = async () => {
    setIsConnecting(true);
    setCurrentOAuthStep(0);

    // Simulate OAuth 2.0 flow — each step has a realistic delay
    for (let i = 0; i < OAUTH_STEPS.length; i++) {
      await new Promise((r) => setTimeout(r, 600));
      setCurrentOAuthStep(i + 1);
    }

    await new Promise((r) => setTimeout(r, 400));
    setDone(true);
    await new Promise((r) => setTimeout(r, 600));
    onAuthenticate();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#050505] via-[#0d0d0d] to-[#050505] px-6 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#1DB954]/5 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-xl space-y-6 relative z-10">
        {/* Header Card */}
        <Card className="bg-[#0f0f0f] border-gray-800 p-10 rounded-[2.5rem] shadow-[0_30px_80px_rgba(0,0,0,0.6)]">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-[#1DB954] rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(29,185,84,0.4)]">
              <Music2 className="w-10 h-10 text-black" />
            </div>
            <h2 className="text-4xl font-black text-white italic tracking-tighter mb-2">
              Connect Spotify
            </h2>
            <p className="text-gray-500 text-sm font-medium">
              OAuth 2.0 Authentication · Client Credentials Flow
            </p>
          </div>

          {/* Permissions list */}
          {!isConnecting && (
            <div className="space-y-3 mb-8">
              <p className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] mb-4">
                EmoBeat will be able to:
              </p>
              {permissions.map((permission, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-white/3 rounded-xl border border-white/5">
                  <div className="w-6 h-6 bg-[#1DB954]/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-3.5 h-3.5 text-[#1DB954]" />
                  </div>
                  <span className="text-gray-300 text-sm font-medium">{permission}</span>
                </div>
              ))}
            </div>
          )}

          {/* OAuth Steps Progress (shown during connection) */}
          {isConnecting && (
            <div className="mb-8 space-y-2">
              <p className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] mb-5">
                OAuth 2.0 Flow
              </p>
              {OAUTH_STEPS.map((s) => {
                const isComplete = currentOAuthStep > s.step;
                const isActive   = currentOAuthStep === s.step;
                return (
                  <div
                    key={s.step}
                    className={`flex items-center gap-4 p-3 rounded-xl transition-all duration-300 border ${
                      isComplete ? "border-[#1DB954]/30 bg-[#1DB954]/5"
                      : isActive  ? "border-[#1DB954]/60 bg-[#1DB954]/10 shadow-[0_0_15px_rgba(29,185,84,0.1)]"
                      : "border-white/5 bg-white/2 opacity-40"
                    }`}
                  >
                    <span className="text-lg">{s.icon}</span>
                    <span className={`text-sm font-bold flex-1 ${isComplete ? "text-[#1DB954]" : isActive ? "text-white" : "text-gray-600"}`}>
                      {s.label}
                    </span>
                    {isComplete && <Check className="w-4 h-4 text-[#1DB954]" />}
                    {isActive && (
                      <div className="w-4 h-4 rounded-full border-2 border-[#1DB954] border-t-transparent animate-spin" />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* CTA buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleConnect}
              disabled={isConnecting}
              className="w-full bg-[#1DB954] hover:bg-[#1ed760] text-black font-black py-7 text-base rounded-[1.2rem] transition-all hover:scale-[1.02] shadow-2xl shadow-[#1DB954]/20 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isConnecting
                ? done ? "✅ Connected!" : "Authenticating…"
                : <><Music2 className="w-5 h-5 mr-2" /> Authorize with Spotify</>}
            </Button>

            {!isConnecting && (
              <Button
                variant="ghost"
                onClick={onSkip}
                className="w-full text-gray-600 hover:text-gray-400 hover:bg-white/5 font-bold py-5 rounded-[1.2rem] border border-white/5 transition-all"
              >
                <User className="w-4 h-4 mr-2" />
                Continue as Anonymous
              </Button>
            )}
          </div>

          <p className="text-[10px] text-center text-gray-700 font-medium mt-4">
            By connecting, you agree to Spotify's Terms of Service and Privacy Policy
          </p>
        </Card>

        {/* Info badges */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: <Shield className="w-4 h-4" />, label: "No video stored", sub: "Images never leave your session" },
            { icon: <Zap className="w-4 h-4" />, label: "Real-time AI", sub: "ResNet-18 on-demand inference" },
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
