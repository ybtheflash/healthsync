"use client";

import { useState, useEffect, useCallback } from "react";
import { Client, Storage, Databases, ID } from "appwrite";
import { useDropzone } from "react-dropzone";

const client = new Client();
client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

const storage = new Storage(client);
const databases = new Databases(client);

export default function Home() {
  const [notes, setNotes] = useState<{ id: string; text: string; isEditing: boolean }[]>([]);
  const [files, setFiles] = useState<{ name: string; id: string; url?: string }[]>([]);
  const [inputNote, setInputNote] = useState("");
  const [editText, setEditText] = useState<{ [key: string]: string }>({}); // Stores edited text

  useEffect(() => {
    fetchFiles();
    fetchNotes();
  }, []);

  const fetchFiles = async () => {
    try {
      const response = await storage.listFiles(process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!);
      setFiles(
        response.files.map((file) => ({
          name: file.name,
          id: file.$id,
          url: `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID}/files/${file.$id}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`
        }))
      );
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
      setNotes(response.documents.map((doc) => ({ id: doc.$id, text: doc.text, isEditing: false })));
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
      setNotes(notes.filter((note) => note.id !== id));
    } catch (error) {
      console.error("Deleting note failed:", error);
    }
  };

  const startEditing = (id: string, text: string) => {
    setEditText({ ...editText, [id]: text });
    setNotes(notes.map((n) => (n.id === id ? { ...n, isEditing: true } : n)));
  };

  const saveEdit = async (id: string) => {
    if (!editText[id]?.trim()) return; // Prevent empty updates

    try {
      await databases.updateDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID!,
        id,
        { text: editText[id] }
      );

      setNotes(notes.map((n) => (n.id === id ? { ...n, text: editText[id], isEditing: false } : n)));
      setEditText((prev) => {
        const newEditText = { ...prev };
        delete newEditText[id]; // Clear after saving
        return newEditText;
      });
    } catch (error) {
      console.error("Updating note failed:", error);
    }
  };

  const cancelEdit = (id: string) => {
    setNotes(notes.map((n) => (n.id === id ? { ...n, isEditing: false } : n)));
    setEditText((prev) => {
      const newEditText = { ...prev };
      delete newEditText[id];
      return newEditText;
    });
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    acceptedFiles.forEach(async (file) => {
      try {
        await storage.createFile(process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!, ID.unique(), file);
        fetchFiles();
      } catch (error) {
        console.error("File upload failed:", error);
      }
    });
  }, []);

  const deleteFile = async (id: string) => {
    try {
      await storage.deleteFile(process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!, id);
      fetchFiles();
    } catch (error) {
      console.error("Deleting file failed:", error);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <h1 className="text-2xl font-bold">Drag & Drop Images or Add Notes</h1>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed p-6 mt-4 text-center ${isDragActive ? "bg-gray-300" : "bg-white"}`}
      >
        <input {...getInputProps()} />
        {isDragActive ? "Drop the files here..." : "Drag & Drop images here"}
      </div>

      <ul className="mt-4">
        {files.map((file) => (
          <li key={file.id} className="flex justify-between bg-white p-2 my-2 border rounded">
            <a href={file.url} target="_blank" rel="noopener noreferrer">
              {file.name}
            </a>
            <button className="bg-red-500 text-white px-3 py-1 rounded" onClick={() => deleteFile(file.id)}>
              Delete
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-4 bg-white p-2 border rounded">
        <textarea
          value={inputNote}
          onChange={(e) => setInputNote(e.target.value)}
          className="w-full p-2 border min-h-[50px] outline-none"
          placeholder="Type your note here..."
        ></textarea>
        <button className="bg-green-500 text-white px-4 py-2 mt-2 rounded" onClick={addNote}>
          Add Note
        </button>
      </div>

      <ul className="mt-4">
        {notes.map((note) => (
          <li key={note.id} className="flex flex-col bg-white p-2 my-2 border rounded">
            {note.isEditing ? (
              <>
                <textarea
                  value={editText[note.id] || ""}
                  onChange={(e) => setEditText({ ...editText, [note.id]: e.target.value })}
                  className="w-full p-2 border min-h-[50px] outline-none"
                  placeholder="Edit your note here..."
                  title="Edit Note"
                ></textarea>
                <div className="flex justify-end mt-2">
                  <button className="bg-green-500 text-white px-3 py-1 mx-1 rounded" onClick={() => saveEdit(note.id)}>
                    Save
                  </button>
                  <button className="bg-gray-500 text-white px-3 py-1 mx-1 rounded" onClick={() => cancelEdit(note.id)}>
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <p>{note.text}</p>
            )}
            {!note.isEditing && (
              <div className="flex justify-end mt-2">
                <button className="bg-blue-500 text-white px-3 py-1 mx-1 rounded" onClick={() => startEditing(note.id, note.text)}>
                  Edit
                </button>
                <button className="bg-red-500 text-white px-3 py-1 mx-1 rounded" onClick={() => deleteNote(note.id)}>
                  Delete
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
