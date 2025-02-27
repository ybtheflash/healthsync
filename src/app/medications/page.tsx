"use client"

import PageWrapper from '@/components/PageWrapper';
import AddMedicationForm from '@/components/AddMedicationForm';
import RenderAllMedications from '@/components/getAllMedications';

const MedicationsPage = () => {
  return (
    <PageWrapper>
      <div>
        <AddMedicationForm />
        <RenderAllMedications />
      </div>
    </PageWrapper>
  );
};

export default MedicationsPage;