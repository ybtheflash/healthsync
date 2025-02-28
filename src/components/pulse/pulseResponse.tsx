// src/components/pulse/PulseResponse.tsx
import React from 'react';
import Markdown from 'react-markdown';

interface Source {
  title: string;
  url: string;
  snippet: string;
}

interface PulseResponseProps {
  content: string;
  sources: Source[];
  suggestedQueries: string[];
  onSuggestedQueryClick: (query: string) => void;
}

export const PulseResponse: React.FC<PulseResponseProps> = ({
  content,
  sources,
  suggestedQueries,
  onSuggestedQueryClick
}) => {
  // Clean the response by removing the references section
  const cleanContent = React.useMemo(() => {
    if (!content) return '';
    
    // Remove references section for cleaner display since we show it separately
    return content.replace(/references:?\s*\n([\s\S]+)$/i, '')
                 .replace(/sources:?\s*\n([\s\S]+)$/i, '')
                 .trim();
  }, [content]);

  return (
    <div className="pulse-response">
      {/* Main response content */}
      <div className="response-content">
        <Markdown>{cleanContent}</Markdown>
      </div>
      
      {/* Sources section - only shown if there are sources */}
      {sources.length > 0 && (
        <div className="sources-section mt-6">
          <h3 className="text-lg font-semibold mb-2">Sources</h3>
          <ul className="space-y-3">
            {sources.map((source, index) => (
              <li key={index} className="border-l-2 border-blue-500 pl-3 py-1">
                <div className="font-medium text-blue-700">
                  {source.url ? (
                    <a href={source.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      [{index + 1}] {source.title}
                    </a>
                  ) : (
                    <span>[{index + 1}] {source.title}</span>
                  )}
                </div>
                {source.snippet && (
                  <p className="text-sm text-gray-600 mt-1">{source.snippet}</p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Suggested queries */}
      {suggestedQueries.length > 0 && (
        <div className="suggested-queries mt-6">
          <h3 className="text-lg font-semibold mb-2">Follow-up Questions</h3>
          <div className="flex flex-wrap gap-2">
            {suggestedQueries.map((query, index) => (
              <button
                key={index}
                className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm hover:bg-blue-200"
                onClick={() => onSuggestedQueryClick(query)}
              >
                {query}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
