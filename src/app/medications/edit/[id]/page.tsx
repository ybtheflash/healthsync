"use client";
import { useEffect, useState, use } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import AddMedicationForm from "@/components/AddMedicationForm";

export default function EditMedicationPage({ params }: { params: Promise<{ id: string }> }) {
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
  
  const [medication, setMedication] = useState<Medication | null>(null);
  const [loading, setLoading] = useState(true);
  const resolvedParams = use(params);

  useEffect(() => {
    const fetchMedication = async () => {
      try {
        const docSnap = await getDoc(doc(db, "medications", resolvedParams.id));
        if (docSnap.exists()) {
          const data = docSnap.data();
          setMedication({
            id: docSnap.id,
            name: data.name,
            dosage: data.dosage,
            timings: data.timings,
            startDate: data.startDate.toDate(),
            endDate: data.endDate.toDate(),
            days: data.days,
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMedication();
  }, [resolvedParams.id]);

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  );
  if (!medication) return (
    <div className="p-4 bg-red-100 text-red-700 rounded text-center">
      Medication not found
    </div>
  );
  
  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-center">Edit Medication</h2>
      <AddMedicationForm medication={medication} />
    </div>
  );
}