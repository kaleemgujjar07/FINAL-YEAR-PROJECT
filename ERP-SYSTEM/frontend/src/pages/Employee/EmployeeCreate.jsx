import useLanguage from '@/locale/useLanguage';
import CreateEmployeeModule from '@/modules/EmployeeModule/CreateEmployeeModule';

export default function EmployeeCreate() {
  const translate = useLanguage();

  const entity = 'employee';

  const Labels = {
    PANEL_TITLE: translate('employee'),
    DATATABLE_TITLE: translate('employees_list'),
    ADD_NEW_ENTITY: translate('add_new_employee'),
    ENTITY_NAME: translate('employee'),
  };

  const configPage = {
    entity,
    ...Labels,
  };
  return <CreateEmployeeModule config={configPage} />;
}
