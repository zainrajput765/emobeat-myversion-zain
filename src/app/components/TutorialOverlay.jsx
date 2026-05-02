import React, { useState, useRef, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { ChevronRight, ChevronLeft, X, HelpCircle } from "lucide-react";

// ─── Tutorial Steps (§4.15 First-Time User Guidance) ──────────────────────────
const TUTORIAL_STEPS = [
  {
    title: "Position Your Face",
    description:
      "Centre your face inside the HUD frame. Keep 2–3 feet of distance from the camera. Make sure light comes from in front of you — not behind you.",
    image: "👤",
    tip: "Avoid shadows and harsh backlighting for best results.",
  },
  {
    title: "Natural vs Exaggerated",
    description:
      "Our ResNet-18 model was trained on the FER2013 dataset with real, subtle expressions. Natural expressions give the most accurate match. Exaggerated poses still work, but may lower confidence.",
    image: "😊",
    tip: "A relaxed, authentic expression gives the best sonic match.",
  },
  {
    title: "Reading Confidence Scores",
    description:
      "The 'Neural Match' percentage shows how certain the AI is about your emotion. 90 %+ is a strong lock. 70–89 % is a reliable match. Below 70 % means try repositioning.",
    image: "📊",
    tip: "90 %+ is a perfect lock — your playlist will be highly curated!",
  },
  {
    title: "Authenticated vs Anonymous",
    description:
      "Authenticated users get persistent mood history across devices, premium audio processing, and detailed confidence analytics. Anonymous users get local-only session history.",
    image: "👑",
    tip: "Upgrade to Pro via the Premium button on the dashboard!",
  },
];

// ─── Tutorial Overlay ─────────────────────────────────────────────────────────
export function TutorialOverlay({ onClose }) {
  const [step, setStep] = useState(0);

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
      <Card className="bg-[#0f0f0f] border-gray-800 max-w-lg w-full overflow-hidden shadow-[0_0_80px_rgba(29,185,84,0.15)] rounded-[2.5rem]">
        <div className="relative p-10">
          <Button
            variant="ghost"
            className="absolute top-5 right-5 text-gray-500 hover:text-white"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </Button>

          <div className="text-center space-y-6">
            {/* Icon */}
            <div className="w-24 h-24 bg-[#1DB954]/15 border border-[#1DB954]/30 rounded-full flex items-center justify-center mx-auto text-5xl shadow-[0_0_30px_rgba(29,185,84,0.2)]">
              {TUTORIAL_STEPS[step].image}
            </div>

            {/* Text */}
            <div className="space-y-2">
              <p className="text-[#1DB954] text-[10px] font-black uppercase tracking-[0.3em]">
                Tutorial {step + 1}/{TUTORIAL_STEPS.length}
              </p>
              <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">
                {TUTORIAL_STEPS[step].title}
              </h2>
              <p className="text-gray-400 font-medium leading-relaxed text-sm">
                {TUTORIAL_STEPS[step].description}
              </p>
            </div>

            {/* Tip box */}
            <div className="bg-black/50 p-4 rounded-2xl border border-[#1DB954]/20">
              <p className="text-[10px] text-[#1DB954] font-black uppercase tracking-widest mb-1">
                Expert Tip
              </p>
              <p className="text-gray-300 text-xs">{TUTORIAL_STEPS[step].tip}</p>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between pt-2">
              <Button
                variant="ghost"
                className="text-gray-500 hover:text-white disabled:opacity-0"
                onClick={() => setStep((s) => s - 1)}
                disabled={step === 0}
              >
                <ChevronLeft className="w-5 h-5 mr-1" /> Back
              </Button>

              <div className="flex gap-2">
                {TUTORIAL_STEPS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setStep(i)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      i === step ? "bg-[#1DB954] w-6" : "bg-gray-700 w-2"
                    }`}
                  />
                ))}
              </div>

              {step < TUTORIAL_STEPS.length - 1 ? (
                <Button
                  className="bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold rounded-xl"
                  onClick={() => setStep((s) => s + 1)}
                >
                  Next <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button
                  className="bg-white hover:bg-gray-200 text-black font-bold rounded-xl"
                  onClick={onClose}
                >
                  Get Started
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ─── Contextual Help Tooltip (§4.15 Contextual Help) ──────────────────────────
// Usage: <HelpTooltip topic="emotion_detection" />
const HELP_CONTENT = {
  emotion_detection: {
    title: "How Emotion Detection Works",
    body: "EmoBeat captures a single webcam frame and sends it to a ResNet-18 Convolutional Neural Network trained on the FER2013 dataset. The model outputs probabilities across 7 emotion classes (Angry, Disgust, Fear, Happy, Neutral, Sad, Surprise). CLAHE preprocessing corrects for lighting before inference.",
  },
  privacy: {
    title: "Privacy Assurance",
    body: "No video footage is recorded or transmitted. Only a single JPEG snapshot is sent to the AI backend at detection time. Images are processed in memory and discarded immediately. No facial data is stored on any server.",
  },
  music_algorithm: {
    title: "Music Matching Algorithm",
    body: "Once your emotion is classified, EmoBeat queries a curated playlist library mapped to each emotion. The Spotify Client Credentials API (no user login required) fetches the playlist metadata and embed URL, which loads directly in the player.",
  },
  tips: {
    title: "Tips for Best Experience",
    body: "• Use front-facing lighting\n• Keep one person in frame\n• Stay 2–3 feet from camera\n• A natural expression beats an exaggerated one\n• High confidence (90 %+) gives the best playlist match",
  },
  confidence: {
    title: "Understanding Confidence",
    body: "The Neural Match % is the Softmax probability output from ResNet-18, averaged with a Test-Time Augmentation (horizontally flipped) pass. Higher confidence means the model is more certain. Scores above 85 % are very reliable.",
  },
};

export function HelpTooltip({ topic }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const info = HELP_CONTENT[topic];

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  if (!info) return null;

  return (
    <span ref={ref} className="relative inline-flex items-center">
      <button
        onClick={() => setOpen((o) => !o)}
        className="text-gray-600 hover:text-[#1DB954] transition-colors ml-1.5 align-middle"
        title="Help"
        aria-label={`Help: ${info.title}`}
      >
        <HelpCircle className="w-3.5 h-3.5" />
      </button>

      {open && (
        <div className="absolute left-5 bottom-5 z-50 w-72 bg-[#0f0f0f] border border-gray-700 rounded-2xl shadow-2xl p-5 text-left animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-start justify-between mb-3">
            <p className="text-white font-black text-xs uppercase tracking-wider pr-4">
              {info.title}
            </p>
            <button onClick={() => setOpen(false)} className="text-gray-600 hover:text-white flex-shrink-0">
              <X className="w-3 h-3" />
            </button>
          </div>
          <p className="text-gray-400 text-[11px] leading-relaxed whitespace-pre-line">{info.body}</p>
          <div className="mt-3 pt-3 border-t border-white/5">
            <p className="text-[#1DB954] text-[9px] font-black uppercase tracking-widest">EmoBeat · AI-Driven Music</p>
          </div>
        </div>
      )}
    </span>
  );
}
