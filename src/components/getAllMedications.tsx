"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { collection, getDocs, orderBy, query, where, doc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Pen, Trash2, Plus, Clock, Calendar, X } from "lucide-react";
import AddMedicationForm from "./AddMedicationForm";

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

const RenderAllMedications: React.FC = () => {
  const router = useRouter();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const { authState } = useAuth();

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
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message || "Failed to load medications");
        } else {
          setError("Failed to load medications");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMedications();
  }, [authState.user?.uid]);

  const handleDeleteMedication = async (id: string) => {
    if (!authState.user?.uid) {
      setError("User not authenticated");
      return;
    }

    try {
      await deleteDoc(doc(db, "medications", id));
      setMedications((prev) => prev.filter((med) => med.id !== id));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete medication");
    }
  };

  const handleEditMedication = (id: string) => {
    router.push(`/medications/edit/${id}`);
  };

  const formatTimeDisplay = (time: string) => {
    if (!time.includes(":")) return time;
    const [hours, minutes] = time.split(":");
    return `${hours.padStart(2, "0")}:${minutes}`;
  };

  if (loading) {
    return <div>Loading...</div>; // You can replace this with a loading spinner or skeleton
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded">
        {error}
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Your Medications</h2>
          <p className="text-gray-600">Track and manage your daily medications</p>
        </div>

        {medications.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-xl border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No medications yet</h3>
            <p className="text-gray-600 mb-6">Start tracking your medications by adding your first one</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
            >
              <Plus className="h-5 w-5" />
              Add Your First Medication
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {medications.map((med) => (
              <div
                key={med.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 group"
              >
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                      {med.name}
                    </h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditMedication(med.id)}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors group/edit relative"
                        title="Edit Medication"
                      >
                        <Pen className="h-4 w-4" />
                        <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover/edit:opacity-100 transition-opacity whitespace-nowrap">
                          Edit
                        </span>
                      </button>
                      <button
                        onClick={() => handleDeleteMedication(med.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete Medication"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border border-blue-200">
                    {med.dosage}
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-700 mb-2">
                      <Clock className="h-4 w-4" />
                      <span className="font-medium">Daily Schedule</span>
                    </div>
                    <div className="grid gap-2">
                      {med.timings.map((timing, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between text-sm bg-white p-2 rounded border border-gray-100"
                        >
                          <span className="font-mono text-blue-600 font-medium">
                            {formatTimeDisplay(timing.time)}
                          </span>
                          <span className="text-gray-600 capitalize px-2 py-1 bg-gray-50 rounded text-xs">
                            {timing.relation} meal
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>{med.days} day{med.days > 1 ? "s" : ""}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={() => setShowAddForm(true)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 flex items-center justify-center transition-all hover:scale-105 z-40"
        aria-label="Add new medication"
        title="Add new medication"
      >
        <Plus className="h-6 w-6" />
      </button>

      {showAddForm && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto z-50">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800">Add New Medication</h3>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close modal"
                title="Close"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <AddMedicationForm />
          </div>
        </div>
      )}
    </>
  );
};

export default RenderAllMedications;
