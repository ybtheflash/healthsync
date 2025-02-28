export const dynamic = 'force-dynamic';
import PageWrapper from '@/components/PageWrapper';
import ClientOnly from '@/components/ClientOnly';
import RenderAllMedications from '@/components/getAllMedications';

export default function MedicationsPage() {
  return (
    <PageWrapper>
      <ClientOnly fallback={<div>Loading medications...</div>}>
        <RenderAllMedications />
      </ClientOnly>
    </PageWrapper>
  );
}
