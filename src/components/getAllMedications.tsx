"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { collection, getDocs, orderBy, query, where, doc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

interface Medication {
  id: string;
  name: string;
  dosage: string;
  timings: Array<{
    time: string;
    relation: "before" | "after";
    isCustom: boolean;
  }>;
  startDate: Date;
  endDate: Date;
  days: number;
}

const RenderAllMedications = () => {
  const router = useRouter();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { authState } = useAuth();

  // Fetch medications on component mount
  useEffect(() => {
    const fetchMedications = async () => {
      if (!authState.user?.uid) {
        setError("User not authenticated");
        setLoading(false);
        return;
      }

      try {
        const medicationsQuery = query(
          collection(db, "medications"),
          where("userId", "==", authState.user.uid),
          orderBy("name")
        );

        const querySnapshot = await getDocs(medicationsQuery);
        const meds = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Medication[];
        setMedications(meds);
      } catch (err: any) {
        setError(err.message || "Failed to load medications");
      } finally {
        setLoading(false);
      }
    };

    fetchMedications();
  }, [authState.user?.uid]);

  // Handle medication deletion
  const handleDeleteMedication = async (id: string) => {
    if (!authState.user?.uid) {
      setError("User not authenticated");
      return;

    }

    try {
      // Delete medication from Firestore
      await deleteDoc(doc(db, "medications", id));

      // Update local state to remove the deleted medication
      setMedications((prev) => prev.filter((med) => med.id !== id));
    } catch (err: any) {
      setError(err.message || "Failed to delete medication");
    }
  };

  // Format date display
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleEditMedication = (id: string) => {
    router.push(`/medications/edit/${id}`);
  };
  // Format time display
  const formatTimeDisplay = (time: string) => {
    if (!time.includes(":")) return time;
    const [hours, minutes] = time.split(":");
    return `${hours.padStart(2, "0")}:${minutes}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded">
        {error}
      </div>
    );
  }

  if (medications.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No medications found.</p>
        <button
          onClick={() => router.push("/medications/add")}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Add Medication
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Your Medications</h2>

      <div className="space-y-4">
        {medications.map((med) => (
          <div
            key={med.id}
            onClick={() => handleEditMedication(med.id)}
            className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-semibold">{med.name}</h3>
                <p className="text-sm text-gray-600">{med.dosage}</p>
              </div>
              <button
                onClick={() => handleDeleteMedication(med.id)}
                className="p-2 text-red-500 hover:text-red-700"
                title="Delete Medication"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>

            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Schedule:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {med.timings.map((timing, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 border rounded"
                  >
                    <span className="font-mono">
                      {formatTimeDisplay(timing.time)}
                    </span>
                    <span className="text-sm text-gray-600">
                      ({timing.relation} meal)
                    </span>
                    {timing.isCustom && (
                      <span className="text-xs text-gray-400 ml-auto">
                        Custom
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 text-sm text-gray-600">
              Duration: {med.days} day{med.days > 1 ? "s" : ""}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RenderAllMedications;