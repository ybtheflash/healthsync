"use client"

import { useState } from "react"
import { Sidebar } from "@/components/ui/sidebar"
import ProtectedRoute from "@/components/ProtectedRoute"
import { FileUp, File, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Report {
  id: string
  name: string
  date: string
  size: string
}

export default function Reports() {
  const [reports, setReports] = useState<Report[]>([])
  const [isDragging, setIsDragging] = useState(false)

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files)
    handleFiles(files)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : []
    handleFiles(files)
  }

  const handleFiles = (files: File[]) => {
    const newReports = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      date: new Date().toLocaleDateString(),
      size: formatFileSize(file.size)
    }))
    setReports([...reports, ...newReports])
  }

  const deleteReport = (id: string) => {
    setReports(reports.filter(report => report.id !== id))
  }

  return (
    <ProtectedRoute>
      <Sidebar>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Medical Reports</h1>
            <p className="text-muted-foreground">Upload and manage your medical reports</p>
          </div>

          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-8",
              "transition-colors duration-200",
              isDragging ? "border-blue-500 bg-blue-50" : "border-gray-200",
              "flex flex-col items-center justify-center gap-4"
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
            <label htmlFor="file-upload">
              <Button variant="outline" className="mt-2">
                Choose File
              </Button>
              <input
                id="file-upload"
                type="file"
                multiple
                className="hidden"
                onChange={handleFileInput}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
            </label>
          </div>

          {reports.length > 0 && (
            <div className="border rounded-lg">
              <div className="grid grid-cols-4 gap-4 p-4 font-medium border-b">
                <div>Name</div>
                <div>Date</div>
                <div>Size</div>
                <div className="text-right">Action</div>
              </div>
              <div className="divide-y">
                {reports.map(report => (
                  <div key={report.id} className="grid grid-cols-4 gap-4 p-4 items-center">
                    <div className="flex items-center gap-2">
                      <File className="h-4 w-4" />
                      <span className="truncate">{report.name}</span>
                    </div>
                    <div>{report.date}</div>
                    <div>{report.size}</div>
                    <div className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteReport(report.id)}
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
      </Sidebar>
    </ProtectedRoute>
  )
}
