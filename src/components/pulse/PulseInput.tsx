import { useState, useRef } from "react";
import { Send, FileUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface PulseInputProps {
  onSubmit: (message: string) => void;
  onFileUpload: () => void;
  isLoading: boolean;
}

export function PulseInput({ onSubmit, onFileUpload, isLoading }: PulseInputProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    onSubmit(input);
    setInput("");

    setTimeout(() => {
      textareaRef.current?.focus();
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input.trim()) {
        handleSubmit(e);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col space-y-2">
      <div className="flex rounded-xl border border-slate-200 bg-white shadow-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a medical question..."
          className="flex-1 min-h-12 p-3 border-0 rounded-l-xl focus:ring-0 resize-none"
          disabled={isLoading}
          rows={1}
          style={{
            minHeight: "56px",
            maxHeight: "200px",
          }}
        />
        <div className="flex items-center pr-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-slate-500 hover:text-blue-600"
            onClick={onFileUpload}
            disabled={isLoading}
            title="Upload document"
          >
            <FileUp className="h-5 w-5" />
          </Button>
          <Button
            type="submit"
            size="icon"
            className="bg-blue-600 hover:bg-blue-700 ml-2"
            disabled={isLoading || !input.trim()}
            title="Send message"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
      <div className="text-xs text-slate-500 text-center">
        Pulse provides medical information from verified sources. Always consult with healthcare professionals for medical advice.
      </div>
    </form>
  );
}