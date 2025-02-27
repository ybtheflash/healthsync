// /components/pulse/Pulse.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { PulseMessage } from "./PulseMessage";
import { PulseInput } from "./PulseInput";
import { PulseFileUpload } from "./PulseFileUpload";
import { streamPulseQuery, streamDocumentAnalysis, PulseError } from "@/lib/api/pulse-client";

interface Source {
  title: string;
  url: string;
  snippet: string;
}

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: string;
  sources?: Source[];
  isLoading?: boolean;
  isStreaming?: boolean;
  thinking?: boolean;
  thinkingContent?: string;
}

interface StreamCallback {
  (chunk: string): void;
}

interface ThinkingStreamCallback {
  (chunk: string, thinking: string | null): void;
}

interface SourceCallback {
  (sources: Source[]): void;
}

interface ErrorCallback {
  (error: Error): void;
}

export function Pulse() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content: "Hello, I'm Pulse, your medical assistant. I can help answer your health questions with reliable information from verified sources. How can I assist you today?",
      role: "assistant",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleUserInput = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: text,
      role: "user",
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);

    const loadingMessageId = (Date.now() + 1).toString();
    setMessages((prev) => [
      ...prev,
      {
        id: loadingMessageId,
        content: "",
        role: "assistant",
        timestamp: new Date().toISOString(),
        isLoading: true,
        thinking: true,
        isStreaming: false,
        sources: [],
        thinkingContent: ""
      },
    ]);

    setIsLoading(true);
    
    let capturedThinkingContent = "";
    let thinkingTimer: NodeJS.Timeout | undefined;
    
    try {
      thinkingTimer = setTimeout(() => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === loadingMessageId
              ? {
                  ...msg,
                  thinking: false,
                  isStreaming: true,
                  thinkingContent: capturedThinkingContent
                }
              : msg
          )
        );
      }, 3000);
      
      await streamPulseQuery(
        text,
        (chunk, thinking) => {
          if (thinking) {
            capturedThinkingContent += thinking;
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === loadingMessageId
                  ? {
                      ...msg,
                      thinkingContent: capturedThinkingContent
                    }
                  : msg
              )
            );
          } else {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === loadingMessageId
                  ? {
                      ...msg,
                      content: chunk,
                      thinking: false,
                      isLoading: true,
                      isStreaming: true,
                      thinkingContent: capturedThinkingContent
                    }
                  : msg
              )
            );
          }
        },
        (sources) => {
          clearTimeout(thinkingTimer);
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === loadingMessageId
                ? {
                    ...msg,
                    isLoading: false,
                    isStreaming: false,
                    sources: sources,
                    thinking: false,
                    thinkingContent: capturedThinkingContent
                  }
                : msg
            )
          );
          setIsLoading(false);
        },
        (error) => {
          clearTimeout(thinkingTimer);
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === loadingMessageId
                ? {
                    ...msg,
                    content: error.message,
                    isLoading: false,
                    isStreaming: false,
                    thinking: false
                  }
                : msg
            )
          );
          setIsLoading(false);
        }
      );
    } catch (error) {
      console.error("Error processing request:", error);
      if (thinkingTimer) clearTimeout(thinkingTimer);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === loadingMessageId
            ? {
                ...msg,
                content: "I'm sorry, I encountered an error processing your request. Please try again.",
                isLoading: false,
                isStreaming: false,
                thinking: false
              }
            : msg
        )
      );
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (fileContent: string) => {
    setShowFileUpload(false);
    
    const userMessage: Message = {
      id: Date.now().toString(),
      content: "I've uploaded a document for analysis.",
      role: "user",
      timestamp: new Date().toISOString(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    
    const loadingMessageId = (Date.now() + 1).toString();
    setMessages((prev) => [
      ...prev,
      {
        id: loadingMessageId,
        content: "",
        role: "assistant",
        timestamp: new Date().toISOString(),
        isLoading: true,
        thinking: true,
        isStreaming: false,
        sources: [],
        thinkingContent: ""
      },
    ]);
    
    setIsLoading(true);
    
    let capturedThinkingContent = "";
    let thinkingTimer: NodeJS.Timeout | undefined;
    
    try {
      thinkingTimer = setTimeout(() => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === loadingMessageId
              ? {
                  ...msg,
                  thinking: false,
                  isStreaming: true,
                  content: "Analyzing your document...",
                  thinkingContent: capturedThinkingContent
                }
              : msg
          )
        );
      }, 4000);
      
      await streamDocumentAnalysis(
        fileContent,
        (chunk: string) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === loadingMessageId
                ? {
                    ...msg,
                    content: chunk,
                    thinking: false,
                    isLoading: true,
                    isStreaming: true,
                    thinkingContent: capturedThinkingContent
                  }
                : msg
            )
          );
        },
        (sources: Source[]) => {
          clearTimeout(thinkingTimer);
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === loadingMessageId
                ? {
                    ...msg,
                    isLoading: false,
                    isStreaming: false,
                    sources: sources,
                    thinking: false,
                    thinkingContent: capturedThinkingContent
                  }
                : msg
            )
          );
          setIsLoading(false);
        },
        (error: PulseError) => {
          clearTimeout(thinkingTimer);
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === loadingMessageId
                ? {
                    ...msg,
                    content: error.message,
                    isLoading: false,
                    isStreaming: false,
                    thinking: false
                  }
                : msg
            )
          );
          setIsLoading(false);
        }
      );
    } catch (error) {
      console.error("Error processing document:", error);
      if (thinkingTimer) clearTimeout(thinkingTimer);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === loadingMessageId
            ? {
                ...msg,
                content: "I'm sorry, I encountered an error processing your document. Please try again with a different file.",
                isLoading: false,
                isStreaming: false,
                thinking: false
              }
            : msg
        )
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto pt-4 pb-8 px-4">
      <div className="flex-1 overflow-auto mb-4 rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="p-4">
          {messages.map((message) => (
            <PulseMessage key={message.id} message={message} />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {showFileUpload ? (
        <PulseFileUpload 
          onUpload={handleFileUpload} 
          onCancel={() => setShowFileUpload(false)} 
        />
      ) : (
        <PulseInput
          onSubmit={handleUserInput}
          onFileUpload={() => setShowFileUpload(true)}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
