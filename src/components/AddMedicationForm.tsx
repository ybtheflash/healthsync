"use client";

import React, { useState, useTransition, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { addDoc, collection, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

type TimingEntry = {
  time: string;
  relation: "before" | "after";
  isCustom: boolean;
};

interface Medication {
  id?: string;
  name: string;
  dosage: string;
  timings: TimingEntry[];
  startDate: Date;
  days: number;
}

interface Props {
  medication?: Medication;
}

const AddMedicationForm = ({ medication }: Props) => {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement | null>(null);
  const [isPending, startTransition] = useTransition();
  const [timings, setTimings] = useState<TimingEntry[]>(medication?.timings || []);
  const [customTime, setCustomTime] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const { authState } = useAuth();

  const presetTimes = ["morning", "noon", "evening", "night"] as const;

  useEffect(() => {
    if (medication) {
      setTimings(medication.timings);
    }
  }, [medication]);

  const handlePresetTimingChange = (time: string, checked: boolean) => {
    if (checked) {
      setTimings([...timings, { time, relation: "before", isCustom: false }]);
    } else {
      setTimings(timings.filter((t) => t.time !== time));
    }
  };

  const addCustomTime = () => {
    if (!customTime) {
      setFormError("Please select a valid time");
      return;
    }

    const timeExists = timings.some((t) => t.time === customTime && t.isCustom);
    if (timeExists) {
      setFormError("This time already exists");
      return;
    }

    setTimings([...timings, { time: customTime, relation: "before", isCustom: true }]);
    setCustomTime("");
    setFormError(null);
  };

  const handleRelationChange = (time: string, relation: "before" | "after") => {
    setTimings(timings.map((t) => (t.time === time ? { ...t, relation } : t)));
  };

  const removeTiming = (time: string) => {
    setTimings(timings.filter((t) => t.time !== time));
  };

  const formatTimeDisplay = (time: string) => {
    if (!time.includes(":")) return time;
    const [hours, minutes] = time.split(":");
    return `${hours.padStart(2, "0")}:${minutes}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const formData = new FormData(formRef.current as HTMLFormElement);

    if (!authState.user?.uid) {
      setFormError("User not authenticated");
      return;
    }

    if (timings.length === 0) {
      setFormError("Please select at least one timing");
      return;
    }

    startTransition(async () => {
      try {
        if (!authState.user) {
          throw new Error("User not authenticated");
        }

        const medicationData = {
          userId: authState.user.uid,
          name: formData.get("name") as string,
          dosage: formData.get("dosage") as string,
          timings: timings,
          startDate: new Date(formData.get("startDate") as string),
          days: Number(formData.get("days")),
          completed: false,
        };

        if (medication?.id) {
          // Update existing medication
          await updateDoc(doc(db, "medications", medication.id), medicationData);
        } else {
          // Create new medication
          await addDoc(collection(db, "medications"), medicationData);
        }

        // Clear the form
        formRef.current?.reset();
        setTimings([]);
        setCustomTime("");
        // Refresh medications list by triggering a reload of the current page
        router.refresh();
      } catch (error: unknown) {
        if (error instanceof Error) {
          setFormError(error.message || "Failed to save medication");
        } else {
          setFormError("Failed to save medication");
        }
      }
    });
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded shadow-md">
      {formError && (
        <div className="p-2 mb-4 bg-red-100 text-red-700 rounded">
          {formError}
        </div>
      )}

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
        <h2 className="text-xl font-bold">
          {medication ? "Edit Medication" : "Add New Medication"}
        </h2>

        {/* Medication Name */}
        <div>
          <label className="block text-sm font-medium">Medication Name</label>
          <input
            name="name"
            required
            className="w-full p-2 border rounded mt-1"
            placeholder="Paracetamol"
            defaultValue={medication?.name}
          />
        </div>

        {/* Dosage */}
        <div>
          <label className="block text-sm font-medium">Dosage</label>
          <input
            name="dosage"
            required
            className="w-full p-2 border rounded mt-1"
            placeholder="500 mg"
            defaultValue={medication?.dosage}
          />
        </div>

        {/* Schedule */}
        <div>
          <label className="block text-sm font-medium mb-2">Schedule</label>
          <div className="space-y-2">
            {presetTimes.map((time) => (
              <div key={time} className="flex items-center gap-3 p-2 border rounded">
                <input
                  type="checkbox"
                  checked={timings.some((t) => t.time === time)}
                  onChange={(e) => handlePresetTimingChange(time, e.target.checked)}
                  className="h-4 w-4"
                />
                <span className="capitalize flex-1">{time}</span>
                {timings.some((t) => t.time === time) && (
                  <div className="flex gap-2 items-center">
                    <select
                      value={timings.find((t) => t.time === time)?.relation || "before"}
                      onChange={(e) =>
                        handleRelationChange(time, e.target.value as "before" | "after")
                      }
                      className="p-1 border rounded"
                    >
                      <option value="before">Before Meal</option>
                      <option value="after">After Meal</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => removeTiming(time)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
            ))}

            {/* Custom Time Picker */}
            <div className="mt-4 space-y-2">
              <div className="flex gap-2 items-center">
                <input
                  type="time"
                  value={customTime}
                  onChange={(e) => setCustomTime(e.target.value)}
                  className="p-2 border rounded flex-1"
                  step="300"
                />
                <button
                  type="button"
                  onClick={addCustomTime}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded"
                >
                  Add Time
                </button>
              </div>

              {timings
                .filter((t) => t.isCustom)
                .map((timing) => (
                  <div
                    key={timing.time}
                    className="flex items-center gap-3 p-2 border rounded"
                  >
                    <span className="flex-1 font-mono">
                      {formatTimeDisplay(timing.time)}
                    </span>
                    <select
                      value={timing.relation}
                      onChange={(e) =>
                        handleRelationChange(
                          timing.time,
                          e.target.value as "before" | "after"
                        )
                      }
                      className="p-1 border rounded"
                    >
                      <option value="before">Before</option>
                      <option value="after">After</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => removeTiming(timing.time)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Start Date */}
        <div>
          <label className="block text-sm font-medium">Start Date</label>
          <input
            type="date"
            name="startDate"
            required
            className="w-full p-2 border rounded mt-1"
            defaultValue={medication?.startDate.toISOString().split("T")[0]}
          />
        </div>

        {/* Duration */}
        <div>
          <label className="block text-sm font-medium">Duration (days)</label>
          <input
            type="number"
            name="days"
            min="1"
            required
            className="w-full p-2 border rounded mt-1"
            defaultValue={medication?.days}
          />
        </div>

        {/* Submit Button with Loader */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full p-2 bg-blue-600 text-white rounded disabled:bg-blue-300 relative"
        >
          {isPending && (
            <span className="absolute left-4 top-1/2 -translate-y-1/2">
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </span>
          )}
          <span className={isPending ? "opacity-0" : "opacity-100"}>
            {medication ? "Update Medication" : "Add Medication"}
          </span>
          {isPending && <span className="ml-2">Saving...</span>}
        </button>
      </form>
    </div>
  );
};

export default AddMedicationForm;
