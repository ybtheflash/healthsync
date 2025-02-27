"use client";

import { useState, useEffect, useCallback } from "react";
import { Client, Storage, Databases, ID } from "appwrite";
import { useDropzone } from "react-dropzone";
import { Sidebar } from "@/components/ui/sidebar";
import { Plus, Download } from "lucide-react";
import { TiPin, TiPinOutline } from "react-icons/ti";

const client = new Client();
client.setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!).setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);
const storage = new Storage(client);
const databases = new Databases(client);

type NoteColor = 'red' | 'blue' | 'green' | 'purple' | 'yellow';

interface Note {
  id: string;
  text: string;
  isEditing: boolean;
  pinned: boolean;
  color: NoteColor;
}

const colorClasses: Record<NoteColor, string> = {
  red: 'bg-gradient-to-br from-red-100 to-red-200 border-red-300 hover:from-red-200 hover:to-red-300',
  blue: 'bg-gradient-to-br from-blue-100 to-blue-200 border-blue-300 hover:from-blue-200 hover:to-blue-300',
  green: 'bg-gradient-to-br from-green-100 to-green-200 border-green-300 hover:from-green-200 hover:to-green-300',
  purple: 'bg-gradient-to-br from-purple-100 to-purple-200 border-purple-300 hover:from-purple-200 hover:to-purple-300',
  yellow: 'bg-gradient-to-br from-yellow-100 to-yellow-200 border-yellow-300 hover:from-yellow-200 hover:to-yellow-300'
};

export default function Notes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [files, setFiles] = useState<{ name: string; id: string; url?: string }[]>([]);
  const [inputNote, setInputNote] = useState("");
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);
  const [selectedColor, setSelectedColor] = useState<NoteColor>('blue');

  // File upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [customFileName, setCustomFileName] = useState("");
  
  // Loading state for download buttons
  const [downloadingFiles, setDownloadingFiles] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchFiles();
    fetchNotes();
  }, []);

  const fetchFiles = async () => {
    try {
      const response = await storage.listFiles(process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!);
      setFiles(response.files.map(file => ({
        name: file.name,
        id: file.$id,
        url: `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID}/files/${file.$id}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`
      })));
    } catch (error) {
      console.error("Fetching files failed:", error);
    }
  };

  const fetchNotes = async () => {
    try {
      const response = await databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID!
      );
      setNotes(response.documents.map(doc => ({
        id: doc.$id,
        text: doc.text,
        isEditing: false,
        pinned: doc.pinned || false,
        color: (doc.color as NoteColor) || 'blue'
      })));
    } catch (error) {
      console.error("Fetching notes failed:", error);
    }
  };

  const addNote = async () => {
    if (inputNote.trim() !== "") {
      try {
        const response = await databases.createDocument(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID!,
          ID.unique(),
          {
            text: inputNote,
            pinned: false,
            color: selectedColor
          }
        );
        setNotes([...notes, {
          id: response.$id,
          text: inputNote,
          isEditing: false,
          pinned: false,
          color: selectedColor
        }]);
        setInputNote("");
        setSelectedColor('blue');
        setShowAddNoteModal(false);
      } catch (error) {
        console.error("Adding note failed:", error);
      }
    }
  };

  const deleteNote = async (id: string) => {
    try {
      await databases.deleteDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID!,
        id
      );
      setNotes(notes.filter(note => note.id !== id));
    } catch (error) {
      console.error("Deleting note failed:", error);
    }
  };

  const togglePin = async (id: string) => {
    const note = notes.find(n => n.id === id);
    if (!note) return;

    try {
      await databases.updateDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID!,
        id,
        { 
          text: note.text,
          color: note.color,
          pinned: !note.pinned
        }
      );
      setNotes(notes.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n));
    } catch (error) {
      console.error("Updating pin status failed:", error);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setUploadFile(acceptedFiles[0]);
      setCustomFileName("");
      setShowUploadModal(true);
    }
  }, []);

  const uploadFileWithName = async () => {
    if (!uploadFile) return;

    try {
      const fileName = customFileName.trim() || `file_${Date.now()}`;
      const renamedFile = new File([uploadFile], fileName, { type: uploadFile.type });

      const response = await storage.createFile(
        process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!,
        ID.unique(),
        renamedFile
      );

      setFiles(prevFiles => [...prevFiles, {
        name: fileName,
        id: response.$id,
        url: `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID}/files/${response.$id}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`
      }]);

      setShowUploadModal(false);
      setUploadFile(null);
      setCustomFileName("");
    } catch (error) {
      console.error("File upload failed:", error);
      setShowUploadModal(false);
    }
  };

  const deleteFile = async (fileId: string) => {
    try {
      await storage.deleteFile(
        process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!,
        fileId
      );
      setFiles(files.filter(file => file.id !== fileId));
    } catch (error) {
      console.error("Deleting file failed:", error);
    }
  };

  // Function to download a file directly using fetch API
  const downloadFile = async (url: string | undefined, fileName: string, fileId: string) => {
    if (!url) return;
    
    try {
      // Set loading state for this file
      setDownloadingFiles(prev => ({ ...prev, [fileId]: true }));
      
      // Fetch the file
      const response = await fetch(url);
      const blob = await response.blob();
      
      // Create object URL from blob
      const objectUrl = window.URL.createObjectURL(blob);
      
      // Create download link and trigger download
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = fileName; // Set suggested filename
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(objectUrl);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Failed to download file. Please try again.");
    } finally {
      // Reset loading state
      setDownloadingFiles(prev => ({ ...prev, [fileId]: false }));
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const pinnedNotes = notes.filter(note => note.pinned);
  const unpinnedNotes = notes.filter(note => !note.pinned);

  return (
    <>
      <Sidebar>
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">My Space 🚀</h1>
          </div>

          <div className="grid gap-6 md:grid-cols-[2fr,1fr]">
            {/* Main Content */}
            <div className="space-y-6">
              {/* Pinned Notes */}
              {pinnedNotes.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-gray-700">📌 Pinned Notes</h2>
                  {pinnedNotes.map(note => (
                    <div 
                      key={note.id} 
                      className={`rounded-lg shadow-sm border p-4 transition-all ${colorClasses[note.color]}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="text-gray-700 whitespace-pre-wrap flex-1">{note.text}</div>
                        <button
                          onClick={() => togglePin(note.id)}
                          className="text-blue-500 hover:text-blue-700 ml-2 transition-all duration-300 hover:scale-110"
                          aria-label="Unpin note"
                          title="Unpin note"
                        >
                          <TiPin className="h-5 w-5 transition-transform hover:rotate-45" aria-hidden="true" />
                        </button>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <button
                          className="text-sm text-red-600 hover:text-red-800"
                          onClick={() => deleteNote(note.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Regular Notes */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-700">Notes</h2>
                {unpinnedNotes.map(note => (
                  <div 
                    key={note.id} 
                    className={`rounded-lg shadow-sm border p-4 transition-all ${colorClasses[note.color]}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-gray-700 whitespace-pre-wrap flex-1">{note.text}</div>
                      <button
                        onClick={() => togglePin(note.id)}
                        className="text-gray-500 hover:text-gray-700 ml-2 transition-all duration-300 hover:scale-110"
                        aria-label="Pin note"
                        title="Pin note"
                      >
                        <TiPinOutline className="h-5 w-5 transition-transform hover:rotate-45" aria-hidden="true" />
                      </button>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <button
                        className="text-sm text-red-600 hover:text-red-800"
                        onClick={() => deleteNote(note.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Attachments Section */}
            <div className="space-y-6">
              <div
                {...getRootProps()}
                className={`
                  border-2 border-dashed border-gray-300 rounded-lg p-6 
                  text-center transition-colors cursor-pointer
                  hover:border-blue-500 hover:bg-blue-50
                  ${isDragActive ? "border-blue-500 bg-blue-50" : ""}
                `}
              >
                <input {...getInputProps()} />
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">
                    {isDragActive ? "Drop files here..." : "Drag & drop files here, or click to select"}
                  </p>
                  <p className="text-xs text-gray-500">
                    Supported formats: PNG, JPG, GIF
                  </p>
                </div>
              </div>

              {files.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-4">Uploaded Files</h3>
                  <ul className="space-y-2">
                    {files.map((file) => (
                      <li key={file.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-md">
                        <div className="flex-1 min-w-0 mr-2">
                          <a
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:text-blue-800 truncate block"
                          >
                            {file.name}
                          </a>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => downloadFile(file.url, file.name, file.id)}
                            disabled={downloadingFiles[file.id]}
                            className={`text-sm ${downloadingFiles[file.id] ? 'text-gray-400' : 'text-green-600 hover:text-green-800'} flex items-center`}
                            title="Download file"
                          >
                            <Download className="h-4 w-4 mr-1" />
                            <span>{downloadingFiles[file.id] ? 'Downloading...' : 'Download'}</span>
                          </button>
                          <button
                            onClick={() => deleteFile(file.id)}
                            className="text-sm text-red-600 hover:text-red-800"
                            disabled={downloadingFiles[file.id]}
                          >
                            Delete
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </Sidebar>

      {/* Add Note Button */}
      <button
        onClick={() => setShowAddNoteModal(true)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 flex items-center justify-center transition-colors z-50"
        aria-label="Add new note"
        title="Add new note"
      >
        <Plus className="h-6 w-6" aria-hidden="true" />
      </button>

      {/* Add Note Modal */}
      {showAddNoteModal && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
          <div className="fixed inset-0 bg-black/5 backdrop-blur-[2px]" onClick={() => setShowAddNoteModal(false)} />
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl relative z-10 animate-fade-in">
            <h2 className="text-xl font-bold mb-4">Add New Note</h2>
            <textarea
              value={inputNote}
              onChange={(e) => setInputNote(e.target.value)}
              placeholder="Write your note here..."
              className="w-full min-h-[150px] p-3 border border-gray-200 rounded-md outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none mb-4"
            />
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Note Color</label>
              <div className="flex space-x-2">
                {(Object.entries(colorClasses) as [NoteColor, string][]).map(([color]) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`
                      w-8 h-8 rounded-full transition-all
                      ${colorClasses[color]}
                      ${selectedColor === color ? 'ring-2 ring-offset-2 ring-blue-500 scale-110' : 'hover:scale-105'}
                    `}
                    aria-label={`Select ${color} color`}
                    title={`${color} color`}
                  />
                ))}
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowAddNoteModal(false);
                  setInputNote("");
                  setSelectedColor('blue');
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={addNote}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Add Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* File Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
          <div className="fixed inset-0 bg-black/5 backdrop-blur-[2px]" onClick={() => setShowUploadModal(false)} />
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl relative z-10 animate-fade-in">
            <h2 className="text-xl font-bold mb-4">Upload File</h2>
            <p className="mb-2">File: {uploadFile?.name}</p>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Custom File Name (optional):
              </label>
              <input
                type="text"
                value={customFileName}
                onChange={(e) => setCustomFileName(e.target.value)}
                placeholder="Enter custom file name or leave blank for timestamp"
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setUploadFile(null);
                  setCustomFileName("");
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={uploadFileWithName}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}