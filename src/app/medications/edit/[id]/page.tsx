"use client";

import { useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import AddMedicationForm from "@/components/AddMedicationForm";
import PageWrapper from "@/components/PageWrapper";
import { GetServerSideProps } from "next";

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

interface EditMedicationPageProps {
  medication: Medication | null;
}

export default function EditMedicationPage({ medication }: EditMedicationPageProps) {
  const [loading, setLoading] = useState(false);

  if (loading) {
    return null; // Let PageWrapper handle loading state
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

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params as { id: string };
  let medication: Medication | null = null;

  try {
    const docSnap = await getDoc(doc(db, "medications", id));
    if (docSnap.exists()) {
      const data = docSnap.data();
      medication = {
        id: docSnap.id,
        name: data.name,
        dosage: data.dosage,
        timings: data.timings,
        startDate: data.startDate?.toDate() || new Date(),
        endDate: data.endDate?.toDate() || new Date(),
        days: data.days,
      };
    }
  } catch (error) {
    console.error("Error fetching medication:", error);
  }

  return {
    props: {
      medication,
    },
  };
};