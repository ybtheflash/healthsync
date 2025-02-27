"use client";
import { useEffect, useState, use } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import AddMedicationForm from "@/components/AddMedicationForm";

export default function EditMedicationPage({ params }: { params: Promise<{ id: string }> }) {
  const [medication, setMedication] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const resolvedParams = use(params);

  useEffect(() => {
    const fetchMedication = async () => {
      try {
        const docSnap = await getDoc(doc(db, "medications", resolvedParams.id));
        if (docSnap.exists()) {
          setMedication({
            id: docSnap.id,
            ...docSnap.data(),
            startDate: docSnap.data().startDate.toDate(),
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMedication();
  }, [resolvedParams.id]);

  if (loading) return <div>Loading...</div>;
  if (!medication) return <div>Medication not found</div>;

  return <AddMedicationForm medication={medication} />;
}