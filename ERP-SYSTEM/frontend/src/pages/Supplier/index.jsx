import CrudModule from '@/modules/CrudModule/CrudModule';
import SupplierForm from '@/forms/SupplierForm';
import useLanguage from '@/locale/useLanguage';

export default function Supplier() {
  const translate = useLanguage();
  const entity = 'supplier';
  const searchConfig = {
    displayLabels: ['name', 'company'],
    searchFields: 'name,company,email',
    outputValue: '_id',
  };
  const deleteModalLabels = ['name'];

  const readColumns = [
    { title: translate('name'), dataIndex: 'name' },
    { title: translate('company'), dataIndex: 'company' },
    { title: translate('email'), dataIndex: 'email' },
    { title: translate('phone'), dataIndex: 'phone' },
    { title: translate('address'), dataIndex: 'address' },
  ];

  const dataTableColumns = [
    { title: translate('name'), dataIndex: 'name' },
    { title: translate('company'), dataIndex: 'company' },
    { title: translate('email'), dataIndex: 'email' },
    { title: translate('phone'), dataIndex: 'phone' },
  ];

  const Labels = {
    PANEL_TITLE: 'Supplier',
    DATATABLE_TITLE: 'Suppliers List',
    ADD_NEW_ENTITY: 'Add New Supplier',
    ENTITY_NAME: 'supplier',
    CREATE_ENTITY: translate('save'),
    UPDATE_ENTITY: translate('update'),
  };

  const configPage = {
    entity,
    ...Labels,
  };

  const config = {
    ...configPage,
    readColumns,
    dataTableColumns,
    searchConfig,
    entityDisplayLabels: ['name'],
    deleteModalLabels,
  };

  return (
    <CrudModule
      createForm={<SupplierForm />}
      updateForm={<SupplierForm isUpdateForm={true} />}
      config={config}
    />
  );
}
