"use client";

import { useState, useRef, useEffect } from "react";
import { PulseMessage } from "./PulseMessage";
import { PulseInput } from "./PulseInput";
import { PulseFileUpload } from "./PulseFileUpload";
import { streamDocumentAnalysis, streamPulseQuery } from "@/lib/api/pulse-client";


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
  suggestedQueries?: string[];
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
      },
    ]);

    setIsLoading(true);

    try {
      await streamPulseQuery(
        text,
        (chunk: string) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === loadingMessageId
                ? { ...msg, content: msg.content + chunk }
                : msg
            )
          );
        },
        (sources: any, suggestedQueries: any) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === loadingMessageId
                ? {
                    ...msg,
                    sources: sources,
                    suggestedQueries: suggestedQueries,
                  }
                : msg
            )
          );
          setIsLoading(false);
        },
        (error: { message: any; }) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === loadingMessageId
                ? {
                    ...msg,
                    content: error.message,
                  }
                : msg
            )
          );
          setIsLoading(false);
        }
      );
    } catch (error) {
      console.error("Error processing request:", error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === loadingMessageId
            ? {
                ...msg,
                content: "I'm sorry, I encountered an error processing your request. Please try again.",
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
      },
    ]);

    setIsLoading(true);

    try {
      await streamDocumentAnalysis(
        fileContent,
        (chunk: string) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === loadingMessageId
                ? { ...msg, content: msg.content + chunk }
                : msg
            )
          );
        },
        (sources: any, suggestedQueries: any) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === loadingMessageId
                ? {
                    ...msg,
                    sources: sources,
                    suggestedQueries: suggestedQueries,
                  }
                : msg
            )
          );
          setIsLoading(false);
        },
        (error: { message: any; }) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === loadingMessageId
                ? {
                    ...msg,
                    content: error.message,
                  }
                : msg
            )
          );
          setIsLoading(false);
        }
      );
    } catch (error) {
      console.error("Error processing document:", error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === loadingMessageId
            ? {
                ...msg,
                content: "I'm sorry, I encountered an error processing your document. Please try again with a different file.",
              }
            : msg
        )
      );
      setIsLoading(false);
    }
  };

  const handleSuggestedQueryClick = (query: string) => {
    handleUserInput(query);
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto pt-4 pb-8 px-4">
      <div className="flex-1 overflow-auto mb-4 rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="p-4">
          {messages.map((message) => (
            <PulseMessage
              key={message.id}
              message={message}
              onQueryClick={handleSuggestedQueryClick}
            />
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