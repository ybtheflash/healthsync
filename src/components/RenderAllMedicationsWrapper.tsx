"use client";

import dynamic from 'next/dynamic';

const RenderAllMedications = dynamic(
  () => import('@/components/getAllMedications'),
  { ssr: false }
);

const RenderAllMedicationsWrapper = () => {
  return <RenderAllMedications />;
};

export default RenderAllMedicationsWrapper;