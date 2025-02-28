import { ThumbsUp, ThumbsDown, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import ReactMarkdown from "react-markdown";

interface Source {
  title: string;
  url: string;
  snippet: string;
}

interface MessageProps {
  message: {
    id: string;
    content: string;
    role: "user" | "assistant";
    timestamp: string;
    sources?: Source[];
    suggestedQueries?: string[];
  };
  onQueryClick: (query: string) => void;
}

export function PulseMessage({ message, onQueryClick }: MessageProps) {
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);
  const [showSources, setShowSources] = useState(false);
  const isUser = message.role === "user";

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  const handleSuggestedQuery = (query: string) => {
    if (onQueryClick) {
      onQueryClick(query);
    }
  };

  return (
    <div className={`flex items-start mb-4 ${isUser ? "justify-end" : ""}`}>
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center mr-3">
          <span className="text-white font-medium">P</span>
        </div>
      )}
      <div className={`flex-1 ${isUser ? "max-w-3xl ml-auto" : "max-w-3xl"}`}>
        <div className={`flex items-center space-x-2 mb-1 ${isUser ? "justify-end" : ""}`}>
          <span className={isUser ? "text-slate-600" : "font-medium text-blue-600"}>
            {isUser ? "You" : "Pulse"}
          </span>
          <span className="text-xs text-slate-500" suppressHydrationWarning>
            {formatTime(message.timestamp)}
          </span>
        </div>
        <div
          className={`p-4 rounded-xl ${
            isUser
              ? "bg-blue-600 text-white ml-auto"
              : "bg-slate-100 text-slate-800"
          }`}
        >
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>

          {!isUser && message.sources && message.sources.length > 0 && (
            <div className="mt-3">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-blue-600 hover:text-blue-700 p-0"
                onClick={() => setShowSources(!showSources)}
              >
                {showSources ? "Hide sources" : "Show sources"} ({message.sources.length})
              </Button>

              {showSources && (
                <div className="mt-2 pt-2 border-t border-slate-200">
                  <h4 className="text-sm font-medium mb-2">Sources</h4>
                  <div className="space-y-2">
                    {message.sources.map((source, index) => (
                      <div key={index} className="text-xs bg-white p-2 rounded border border-slate-200">
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-blue-600 hover:underline flex items-center"
                        >
                          {source.title}
                          <ExternalLink className="ml-1 h-3 w-3" />
                        </a>
                        <p className="mt-1 text-slate-600">{source.snippet}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {!isUser && message.suggestedQueries && message.suggestedQueries.length > 0 && (
            <div className="mt-3">
              <h4 className="text-sm font-medium mb-2">Follow-up questions:</h4>
              <div className="flex flex-wrap gap-2">
                {message.suggestedQueries.map((query, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestedQuery(query)}
                    className="px-3 py-1.5 text-xs bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 transition-colors"
                  >
                    {query}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {!isUser && (
          <div className="flex items-center mt-2">
            <div className="flex space-x-2">
              <Button
                variant={feedback === "up" ? "secondary" : "ghost"}
                size="sm"
                className="text-xs"
                onClick={() => setFeedback(feedback === "up" ? null : "up")}
              >
                <ThumbsUp className="h-3 w-3 mr-1" />
                Helpful
              </Button>
              <Button
                variant={feedback === "down" ? "secondary" : "ghost"}
                size="sm"
                className="text-xs"
                onClick={() => setFeedback(feedback === "down" ? null : "down")}
              >
                <ThumbsDown className="h-3 w-3 mr-1" />
                Not helpful
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}