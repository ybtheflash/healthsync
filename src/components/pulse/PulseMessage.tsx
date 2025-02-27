// /components/pulse/PulseMessage.tsx
import { ThumbsUp, ThumbsDown, ExternalLink, AlertCircle, Loader2, ChevronDown, ChevronUp, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";
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
    isLoading?: boolean;
    isStreaming?: boolean;
    thinking?: boolean;
    thinkingContent?: string;
  };
}

export function PulseMessage({ message }: MessageProps) {
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);
  const [showSources, setShowSources] = useState(false);
  const [showThinking, setShowThinking] = useState(false);
  const [thinkingContent, setThinkingContent] = useState<string>("");
  const isUser = message.role === "user";
  
  // Format the timestamp string to a readable time
  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return "";
    }
  };
  
  // Simulate thinking content streaming
  useEffect(() => {
    if (message.thinking) {
      let timer: NodeJS.Timeout;
      const thoughts = [
        "First, let me understand what the user is asking about...",
        "This appears to be related to medical condition. Let me access relevant information...",
        "Checking multiple medical sources to ensure accuracy...",
        "Comparing information from verified medical databases...",
        "Analyzing the latest research on this topic...",
        "Organizing the information in a helpful, structured way..."
      ];
      
      let currentIndex = 0;
      
      const updateThinking = () => {
        if (currentIndex < thoughts.length) {
          setThinkingContent(prev => 
            prev + (prev ? "\n" : "") + thoughts[currentIndex]
          );
          currentIndex++;
          timer = setTimeout(updateThinking, 1000 + Math.random() * 2000);
        }
      };
      
      updateThinking();
      
      return () => {
        clearTimeout(timer);
      };
    }
  }, [message.thinking]);

  // For thinking state
  if (message.thinking) {
    return (
      <div className="flex items-start mb-4">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center mr-3">
          <span className="text-white font-medium">P</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <span className="font-medium text-blue-600">Pulse</span>
            <span className="text-xs text-slate-500">
              {formatTime(message.timestamp)}
            </span>
          </div>
          <div className="p-4 rounded-xl bg-slate-100 inline-block w-full">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
              <span className="text-slate-600">Analyzing your question with medical knowledge...</span>
            </div>
            
            <div className="mt-3">
              <button 
                onClick={() => setShowThinking(!showThinking)}
                className="flex items-center text-xs text-slate-500 hover:text-slate-700 transition-colors"
              >
                <Brain className="h-3 w-3 mr-1" />
                {showThinking ? "Hide thinking process" : "Show thinking process"}
                {showThinking ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}
              </button>
              
              {showThinking && (
                <div className="mt-2 p-3 bg-slate-200 rounded text-xs text-slate-600 font-mono whitespace-pre-wrap">
                  {thinkingContent}
                  <span className="inline-block animate-pulse">▌</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // For streaming state with thinking process
  if (message.isStreaming) {
    return (
      <div className="flex items-start mb-4">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center mr-3">
          <span className="text-white font-medium">P</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <span className="font-medium text-blue-600">Pulse</span>
            <span className="text-xs text-slate-500">
              {formatTime(message.timestamp)}
            </span>
          </div>
          <div className="p-4 rounded-xl bg-slate-100">
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
            <div className="mt-2 pl-2 border-l-2 border-blue-300 flex items-center text-xs text-slate-500">
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              Generating...
            </div>
            
            {message.thinkingContent && (
              <div className="mt-3">
                <button 
                  onClick={() => setShowThinking(!showThinking)}
                  className="flex items-center text-xs text-slate-500 hover:text-slate-700 transition-colors"
                >
                  <Brain className="h-3 w-3 mr-1" />
                  {showThinking ? "Hide thinking process" : "Show thinking process"}
                  {showThinking ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}
                </button>
                
                {showThinking && (
                  <div className="mt-2 p-3 bg-slate-200 rounded text-xs text-slate-600 font-mono whitespace-pre-wrap">
                    {message.thinkingContent}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Loading state for other scenarios
  if (message.isLoading) {
    return (
      <div className="flex items-start mb-4">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center mr-3">
          <span className="text-white font-medium">P</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <span className="font-medium text-blue-600">Pulse</span>
            <span className="text-xs text-slate-500">
              {formatTime(message.timestamp)}
            </span>
          </div>
          <div className="p-4 rounded-xl bg-slate-100 inline-block">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
              <span className="text-slate-600">Processing...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Normal message display
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
          <span className="text-xs text-slate-500">
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
          
          {!isUser && message.thinkingContent && (
            <div className="mt-3">
              <button 
                onClick={() => setShowThinking(!showThinking)}
                className="flex items-center text-xs text-slate-500 hover:text-slate-700 transition-colors"
              >
                <Brain className="h-3 w-3 mr-1" />
                {showThinking ? "Hide thinking process" : "Show thinking process"}
                {showThinking ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}
              </button>
              
              {showThinking && (
                <div className="mt-2 p-3 bg-slate-200 rounded text-xs text-slate-600 font-mono whitespace-pre-wrap">
                  {message.thinkingContent}
                </div>
              )}
            </div>
          )}
          
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
