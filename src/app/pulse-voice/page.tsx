// /app/pulse-voice/page.tsx
import { PulseVoice } from "@/components/pulse/PulseVoice";

export default function PulseVoicePage() {
  return (
    <div className="container mx-auto h-[calc(100vh-theme(spacing.16))] py-6">
      <div className="flex flex-col h-full">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            Pulse Voice
          </h1>
          <p className="text-slate-600 mt-2">
            Get medical assistance using voice commands
          </p>
        </div>
        
        <div className="flex-1 flex items-start justify-center">
          <PulseVoice />
        </div>
      </div>
    </div>
  );
}
