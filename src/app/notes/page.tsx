"use client";

import { useState, useEffect, useCallback } from "react";
import { Client, Storage, ID } from "appwrite";
import { useDropzone } from "react-dropzone";
import dynamic from "next/dynamic";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

const client = new Client();
client.setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!).setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);
const storage = new Storage(client);

export default function Home() {
  const [notes, setNotes] = useState<{ text: string; isEditing: boolean; tempText: string }[]>([]);
  const [files, setFiles] = useState<{ name: string; id: string; url?: string }[]>([]);
  const [inputNote, setInputNote] = useState("");

  useEffect(() => {
    fetchFiles();
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

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach(file => uploadFile(file));
  }, []);

  const uploadFile = async (file: File) => {
    try {
      await storage.createFile(process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!, ID.unique(), file);
      fetchFiles();
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  const deleteFile = async (fileId: string) => {
    try {
      await storage.deleteFile(process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!, fileId);
      fetchFiles();
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const addNote = () => {
    if (inputNote.trim() !== "") {
      setNotes([...notes, { text: inputNote, isEditing: false, tempText: inputNote }]);
      setInputNote("");
    }
  };

  const deleteNote = (index: number) => {
    setNotes(notes.filter((_, i) => i !== index));
  };

  const startEditing = (index: number) => {
    setNotes(notes.map((n, i) => i === index ? { ...n, isEditing: true, tempText: n.text } : n));
  };

  const cancelEdit = (index: number) => {
    setNotes(notes.map((n, i) => i === index ? { ...n, isEditing: false, tempText: n.text } : n));
  };

  const saveEdit = (index: number) => {
    setNotes(notes.map((n, i) => i === index ? { ...n, text: n.tempText, isEditing: false } : n));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <h1 className="text-2xl font-bold">Drag & Drop Images or Add Notes</h1>

      {/* Drag & Drop Box */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed p-6 mt-4 text-center ${
          isDragActive ? "bg-gray-300" : "bg-white"
        }`}
      >
        <input {...getInputProps()} />
        {isDragActive ? "Drop the files here..." : "Drag & Drop images here"}
      </div>

      {/* File List */}
      <ul className="mt-4">
        {files.map((file) => (
          <li key={file.id} className="flex justify-between bg-white p-2 my-2 border rounded">
            <a href={file.url} target="_blank" rel="noopener noreferrer">{file.name}</a>
            <button className="bg-red-500 text-white px-3 py-1 rounded" onClick={() => deleteFile(file.id)}>Delete</button>
          </li>
        ))}
      </ul>

      {/* Notes Input & Display */}
      <div className="mt-4">
        <ReactQuill value={inputNote} onChange={setInputNote} className="bg-white p-2 border rounded" />
        <button className="bg-green-500 text-white px-4 py-2 mt-2 rounded" onClick={addNote}>Add Note</button>
      </div>

      {/* Notes List */}
      <ul className="mt-4">
        {notes.map((note, index) => (
          <li key={index} className="flex flex-col bg-white p-2 my-2 border rounded">
            {note.isEditing ? (
              <ReactQuill value={note.tempText} onChange={(value) => setNotes(notes.map((n, i) => i === index ? { ...n, tempText: value } : n))} className="bg-white p-2 border rounded" />
            ) : (
              <div dangerouslySetInnerHTML={{ __html: note.text }}></div>
            )}
            <div className="flex justify-end mt-2">
              {note.isEditing ? (
                <>
                  <button className="bg-green-500 text-white px-3 py-1 mx-1 rounded" onClick={() => saveEdit(index)}>Save</button>
                  <button className="bg-gray-500 text-white px-3 py-1 mx-1 rounded" onClick={() => cancelEdit(index)}>Cancel</button>
                </>
              ) : (
                <button className="bg-blue-500 text-white px-3 py-1 mx-1 rounded" onClick={() => startEditing(index)}>Edit</button>
              )}
              <button className="bg-red-500 text-white px-3 py-1 mx-1 rounded" onClick={() => deleteNote(index)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
