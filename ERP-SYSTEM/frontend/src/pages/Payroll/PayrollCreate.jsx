import useLanguage from '@/locale/useLanguage';
import CreateItemModule from '@/modules/PayrollModule/CreateItemModule';
import PayrollForm from '@/forms/PayrollForm';

export default function PayrollCreate() {
  const translate = useLanguage();

  const entity = 'payroll';

  const Labels = {
    PANEL_TITLE: translate('Payroll'),
    DATATABLE_TITLE: translate('Payroll List'),
    ADD_NEW_ENTITY: translate('Add New Payroll'),
    ENTITY_NAME: translate('Payroll'),
  };

  const configPage = {
    entity,
    ...Labels,
  };
  return <CreateItemModule config={configPage} CreateForm={PayrollForm} />;
}
