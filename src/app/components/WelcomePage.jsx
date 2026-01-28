import { Button } from "./ui/button";
import { Music2 } from "lucide-react";

export function WelcomePage({ onStart }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#121212] via-[#1a1a1a] to-[#0a0a0a]">
      <div className="text-center space-y-8 px-6 max-w-2xl">
        <div className="flex justify-center">
          <div className="bg-[#1DB954] p-6 rounded-full">
            <Music2 className="w-16 h-16 text-black" />
          </div>
        </div>
        
        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-bold text-white">
            EmoBeat
          </h1>
          <p className="text-xl text-gray-300">
            Music that matches your mood
          </p>
        </div>

        <div className="space-y-4 max-w-md mx-auto">
          <p className="text-gray-400">
            EmoBeat uses advanced facial analysis to detect your emotional state in real-time 
            and recommends music that perfectly matches how you're feeling.
          </p>
          
          <div className="pt-4">
            <Button
              onClick={onStart}
              className="bg-[#1DB954] hover:bg-[#1ed760] text-black px-8 py-6 text-lg"
            >
              Get Started
            </Button>
          </div>
        </div>

        <div className="pt-8 text-sm text-gray-500">
          <p>Connect your Spotify account to unlock personalized recommendations</p>
        </div>
      </div>
    </div>
  );
}
