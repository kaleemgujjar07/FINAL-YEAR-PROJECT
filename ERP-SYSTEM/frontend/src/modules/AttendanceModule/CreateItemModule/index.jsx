import { ErpLayout } from '@/layout';
import CreateItem from '@/modules/ErpPanelModule/CreateItem';

export default function CreateItemModule({ config, CreateForm }) {
  return (
    <ErpLayout>
      <CreateItem config={config} CreateForm={CreateForm} />
    </ErpLayout>
  );
}
