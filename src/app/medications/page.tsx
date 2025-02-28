import PageWrapper from '@/components/PageWrapper';
import dynamic from 'next/dynamic';

const RenderAllMedications = dynamic(
  () => import('@/components/getAllMedications'),
  { ssr: false }
);

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
