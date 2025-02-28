"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import AddMedicationForm from "@/components/AddMedicationForm";
import PageWrapper from "@/components/PageWrapper";

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

export default function EditMedicationPage({ params }: { params: { id: string } }) {
  const [medication, setMedication] = useState<Medication | null>(null);
  const [loading, setLoading] = useState(true);
  const id = params.id;

  useEffect(() => {
    if (id) {
      const fetchMedication = async () => {
        try {
          const docSnap = await getDoc(doc(db, "medications", id));
          if (docSnap.exists()) {
            const data = docSnap.data();
            setMedication({
              id: docSnap.id,
              name: data.name,
              dosage: data.dosage,
              timings: data.timings,
              startDate: data.startDate?.toDate() || new Date(),
              endDate: data.endDate?.toDate() || new Date(),
              days: data.days,
            });
          } else {
            setMedication(null);
          }
        } catch (error) {
          console.error("Error fetching medication:", error);
          setMedication(null);
        } finally {
          setLoading(false);
        }
      };

      fetchMedication();
    }
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!medication) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded text-center">
        Medication not found
      </div>
    );
  }

  return (
    <PageWrapper>
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-center">Edit Medication</h2>
        <AddMedicationForm medication={medication} />
      </div>
    </PageWrapper>
  );
}
