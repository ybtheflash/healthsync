"use client";

import { useState, useEffect, useCallback } from "react";
import PageWrapper from "@/components/PageWrapper";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast, Toaster } from "sonner";
import { Client, Storage, ID } from "appwrite";
import { FileUp, File, Trash2, Download } from "lucide-react";

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT as string)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID_REPORTS as string);

const storage = new Storage(client);

interface Report {
  id: string;
  name: string;
  date: string;
  size: string;
  fileId?: string;
  url?: string;
  downloadUrl?: string;
}

export default function Reports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const fetchReports = useCallback(async () => {
    try {
      const response = await storage.listFiles(
        process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID_REPORTS as string
      );

      const files = response.files.map((file) => ({
        id: file.$id,
        name: file.name,
        date: new Date(file.$createdAt).toLocaleDateString(),
        size: formatFileSize(file.sizeOriginal),
        fileId: file.$id,
        url: storage.getFileView( // Opens file in new tab
          process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID_REPORTS as string,
          file.$id
        ),
        downloadUrl: storage.getFileDownload( // Forces download
          process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID_REPORTS as string,
          file.$id
        ),
      }));

      setReports(files);
    } catch {
      toast.error("Failed to fetch reports");
    }
  }, [storage]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    confirmFiles(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    confirmFiles(files);
  };

  const confirmFiles = (files: File[]) => {
    if (files.length > 0) {
      toast("Confirm Upload", {
        description: "Do you want to upload these files?",
        action: (
          <div className="flex gap-2 mt-2">
            <Button onClick={() => { handleFiles(files); toast.dismiss(); }}>Yes</Button>
            <Button variant="outline" onClick={() => toast.dismiss()}>No</Button>
          </div>
        ),
      });
    }
  };

  const handleFiles = async (files: File[]) => {
    try {
      await Promise.all(
        files.map(async (file) => {
          const response = await storage.createFile(
            process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID_REPORTS as string,
            ID.unique(), // Generates a unique file ID
            file
          );
          
          if (response) {
            toast.success(`${file.name} uploaded successfully!`);
          }
        })
      );
  
      fetchReports(); // Refresh file list after upload
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload files");
    }
  };

  const deleteReport = async (_id: string, fileId?: string) => {
    if (fileId) {
      try {
        await storage.deleteFile(
          process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID_REPORTS as string,
          fileId
        );
        toast.success("File deleted successfully!");
      } catch {
        toast.error("Failed to delete file from storage");
        return;
      }
    }
    fetchReports();
  };

  return (
    <ProtectedRoute>
      <PageWrapper>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">Medical Reports</h1>
          <p className="text-muted-foreground">
            Upload and manage your medical reports
          </p>

          {/* Drag & Drop Upload Section */}
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-8 transition-colors duration-200 flex flex-col items-center justify-center gap-4",
              isDragging ? "border-blue-500 bg-blue-50" : "border-gray-200"
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <FileUp className="h-10 w-10 text-gray-400" />
            <div className="text-center">
              <p className="text-lg font-medium">Drop your files here</p>
              <p className="text-sm text-muted-foreground">or click to upload</p>
            </div>
            <label className="cursor-pointer">
              <input
                id="file-upload"
                type="file"
                multiple
                className="hidden"
                onChange={handleFileInput}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
              <Button variant="outline" className="mt-2" asChild>
                <span>Choose File</span>
              </Button>
            </label>
          </div>

          {/* File List */}
          {reports.length > 0 && (
            <div className="border rounded-lg">
              <div className="grid grid-cols-4 gap-4 p-4 font-medium border-b">
                <div>Name</div>
                <div>Date</div>
                <div>Size</div>
                <div className="text-right">Actions</div>
              </div>
              <div className="divide-y">
                {reports.map((report) => (
                  <div key={report.id} className="grid grid-cols-4 gap-4 p-4">
                    {/* Clickable File Name - Opens in New Tab */}
                    <div className="flex items-center gap-2">
                      <File className="h-4 w-4" />
                      <a
                        href={report.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline truncate"
                      >
                        {report.name}
                      </a>
                    </div>

                    <div>{report.date}</div>
                    <div>{report.size}</div>

                    {/* Actions - Download & Delete */}
                    <div className="text-right flex gap-2 items-center justify-end">
                      {report.downloadUrl && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-green-500 hover:text-green-600"
                          onClick={() => {
                            const link = document.createElement("a");
                            link.href = report.downloadUrl!;
                            link.setAttribute("download", report.name); // Force download
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteReport(report.id, report.fileId)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </PageWrapper>
      <Toaster />
    </ProtectedRoute>
  );
}
