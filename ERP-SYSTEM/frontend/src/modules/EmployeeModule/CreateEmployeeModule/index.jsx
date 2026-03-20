import { ErpLayout } from '@/layout';
import CreateItem from '@/modules/ErpPanelModule/CreateItem';
import EmployeeForm from '@/modules/EmployeeModule/Forms/EmployeeForm';

export default function CreateEmployeeModule({ config }) {
  return (
    <ErpLayout>
      <CreateItem config={config} CreateForm={EmployeeForm} />
    </ErpLayout>
  );
}
