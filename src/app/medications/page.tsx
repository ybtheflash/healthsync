"use client"

import PageWrapper from '@/components/PageWrapper';
import RenderAllMedications from '@/components/getAllMedications';

const MedicationsPage = () => {
  return (
    <PageWrapper>
      <div>
        <RenderAllMedications />
      </div>
    </PageWrapper>
  );
};

export default MedicationsPage;