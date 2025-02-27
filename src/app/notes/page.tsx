"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Client, Storage, Databases, ID, Query } from "appwrite";
import { useDropzone } from "react-dropzone";

const client = new Client();
client.setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!).setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);
const storage = new Storage(client);
const databases = new Databases(client);

export default function Home() {
  const [notes, setNotes] = useState<{ id: string; text: string; isEditing: boolean }[]>([]);
  const [files, setFiles] = useState<{ name: string; id: string; url?: string }[]>([]);
  const [inputNote, setInputNote] = useState("");
  const [editBackup, setEditBackup] = useState("");
  const [currentEditText, setCurrentEditText] = useState("");
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [customFileName, setCustomFileName] = useState("");
  
  // Refs for contentEditable elements
  const inputNoteRef = useRef<HTMLDivElement>(null);
  const editNoteRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchFiles();
    fetchNotes();
  }, []);

  useEffect(() => {
    // Set content when editing starts
    if (editNoteRef.current && currentEditText) {
      editNoteRef.current.textContent = currentEditText;
    }
  }, [currentEditText, notes]);

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
      setNotes(response.documents.map(doc => ({ id: doc.$id, text: doc.text, isEditing: false })));
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
          { text: inputNote }
        );
        setNotes([...notes, { id: response.$id, text: inputNote, isEditing: false }]);
        setInputNote("");
        if (inputNoteRef.current) {
          inputNoteRef.current.textContent = "";
        }
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

  const startEditing = (index: number) => {
    setEditBackup(notes[index].text);
    setCurrentEditText(notes[index].text);
    setNotes(notes.map((n, i) => i === index ? { ...n, isEditing: true } : n));
  };

  const handleEditChange = () => {
    if (editNoteRef.current) {
      setCurrentEditText(editNoteRef.current.textContent || "");
    }
  };

  const saveEdit = async (index: number) => {
    try {
      await databases.updateDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID!,
        notes[index].id,
        { text: currentEditText }
      );
      setNotes(notes.map((n, i) => i === index ? { ...n, text: currentEditText, isEditing: false } : n));
    } catch (error) {
      console.error("Updating note failed:", error);
    }
  };

  const cancelEdit = (index: number) => {
    setNotes(notes.map((n, i) => i === index ? { ...n, text: editBackup, isEditing: false } : n));
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setUploadFile(acceptedFiles[0]);
      setCustomFileName("");
      setShowModal(true);
    }
  }, []);

  const uploadFileWithName = async () => {
    if (!uploadFile) return;

    try {
      // Use custom name or timestamp if not provided
      const fileName = customFileName.trim() || `file_${Date.now()}`;
      
      // Create a new file with custom name but same content
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
      
      // Close modal and reset state
      setShowModal(false);
      setUploadFile(null);
      setCustomFileName("");
    } catch (error) {
      console.error("File upload failed:", error);
      setShowModal(false);
    }
  };

  const cancelUpload = () => {
    setShowModal(false);
    setUploadFile(null);
    setCustomFileName("");
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

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const handleInputChange = () => {
    if (inputNoteRef.current) {
      setInputNote(inputNoteRef.current.textContent || "");
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <h1 className="text-2xl font-bold">Drag & Drop Images or Add Notes</h1>

      <div {...getRootProps()} className={`border-2 border-dashed p-6 mt-4 text-center ${isDragActive ? "bg-gray-300" : "bg-white"}`}>
        <input {...getInputProps()} />
        {isDragActive ? "Drop the files here..." : "Drag & Drop images here"}
      </div>

      <ul className="mt-4">
        {files.map((file) => (
          <li key={file.id} className="flex justify-between bg-white p-2 my-2 border rounded">
            <a href={file.url} target="_blank" rel="noopener noreferrer">{file.name}</a>
            <button className="bg-red-500 text-white px-3 py-1 rounded" onClick={() => deleteFile(file.id)}>Delete</button>
          </li>
        ))}
      </ul>

      <div className="mt-4 bg-white p-2 border rounded">
        <div 
          ref={inputNoteRef}
          contentEditable 
          onInput={handleInputChange} 
          className="p-2 border min-h-[50px] outline-none"
        ></div>
        <button className="bg-green-500 text-white px-4 py-2 mt-2 rounded" onClick={addNote}>Add Note</button>
      </div>

      <ul className="mt-4">
        {notes.map((note, index) => (
          <li key={note.id} className="flex flex-col bg-white p-2 my-2 border rounded">
            {note.isEditing ? (
              <>
                <div 
                  ref={editNoteRef}
                  contentEditable 
                  onInput={handleEditChange} 
                  className="p-2 border min-h-[50px] outline-none"
                ></div>
                <div className="flex justify-end mt-2">
                  <button className="bg-green-500 text-white px-3 py-1 mx-1 rounded" onClick={() => saveEdit(index)}>Save</button>
                  <button className="bg-gray-500 text-white px-3 py-1 mx-1 rounded" onClick={() => cancelEdit(index)}>Cancel</button>
                </div>
              </>
            ) : (
              <div>{note.text}</div>
            )}
            {!note.isEditing && (
              <div className="flex justify-end mt-2">
                <button className="bg-blue-500 text-white px-3 py-1 mx-1 rounded" onClick={() => startEditing(index)}>Edit</button>
                <button className="bg-red-500 text-white px-3 py-1 mx-1 rounded" onClick={() => deleteNote(note.id)}>Delete</button>
              </div>
            )}
          </li>
        ))}
      </ul>

      {/* File Upload Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
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
                onClick={cancelUpload}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button 
                onClick={uploadFileWithName}
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}