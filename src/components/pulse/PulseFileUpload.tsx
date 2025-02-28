import { useState, useRef } from "react";
import { Upload, X, FileText, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PulseFileUploadProps {
  onUpload: (fileContent: string) => void;
  onCancel: () => void;
}

export function PulseFileUpload({ onUpload, onCancel }: PulseFileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    setError(null);

    // Accepted file types
    const acceptedTypes = [
      "text/plain",
      "application/pdf",
      "application/json",
      "text/csv",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
    ];

    if (!acceptedTypes.includes(file.type)) {
      setError("Please upload a text, PDF, CSV, DOCX, or JSON file.");
      return;
    }

    // File size limit (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("File size exceeds 5MB limit.");
      return;
    }

    setFile(file);
  };

  const processFile = async () => {
    if (!file) return;

    setIsLoading(true);

    try {
      const reader = new FileReader();

      reader.onload = async (e) => {
        const text = e.target?.result as string;
        onUpload(text.substring(0, 1000) + (text.length > 1000 ? "..." : ""));
        setIsLoading(false);
      };

      reader.onerror = () => {
        setError("Error reading file. Please try again.");
        setIsLoading(false);
      };

      reader.readAsText(file);
    } catch (error) {
      console.error("Error processing file:", error);
      setError("Failed to process file. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-medium">Upload Medical Document</h3>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {file ? (
        <div className="mb-4">
          <div className="flex items-center p-3 bg-slate-50 rounded-lg border border-slate-200">
            <FileText className="h-5 w-5 text-blue-600 mr-2" />
            <div className="flex-1 truncate">
              <p className="text-sm font-medium">{file.name}</p>
              <p className="text-xs text-slate-500">
                {(file.size / 1024).toFixed(1)} KB
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFile(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center mb-4 transition-colors ${
            isDragging
              ? "border-blue-500 bg-blue-50"
              : "border-slate-200 hover:border-blue-400"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="flex flex-col items-center cursor-pointer">
            <Upload className="h-8 w-8 text-slate-400 mb-2" />
            <p className="text-sm font-medium mb-1">
              Drag and drop your file here or click to browse
            </p>
            <p className="text-xs text-slate-500">
              Supported formats: PDF, TXT, CSV, DOCX, JSON (Max 5MB)
            </p>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInput}
              className="hidden"
              accept=".pdf,.txt,.csv,.docx,.json"
            />
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          onClick={processFile}
          disabled={!file || isLoading}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isLoading ? "Processing..." : "Upload and Analyze"}
        </Button>
      </div>
    </div>
  );
}