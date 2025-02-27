// Import necessary components
import { Sidebar } from '@/components/ui/sidebar';
import AddMedicationForm from '../../components/AddMedicationForm';
import RenderAllMedications from '../../components/getAllMedications';

const MedicationsPage = () => {
  return (
    <Sidebar>
      <div>
        <AddMedicationForm />
        <RenderAllMedications />
      </div>
    </Sidebar>
  );
};

export default MedicationsPage;