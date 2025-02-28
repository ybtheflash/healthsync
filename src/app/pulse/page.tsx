import { Pulse } from "@/components/pulse/Pulse";
import { Sidebar } from "@/components/ui/sidebar"

export default function PulsePage() {
  return (
    <Sidebar>
      <div className="container mx-auto h-[calc(100vh-theme(spacing.16))] py-6">
        <div className="flex flex-col h-full">
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              Pulse AI
            </h1>
            <p className="text-slate-600 mt-2">
              Get evidence-based answers to your health questions
            </p>
          </div>

          <div className="flex-1">
            <Pulse />
          </div>
        </div>
      </div>
    </Sidebar>
  );
}
