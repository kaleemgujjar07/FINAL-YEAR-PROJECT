import useLanguage from '@/locale/useLanguage';
import UpdatePayrollModule from '@/modules/PayrollModule/UpdatePayrollModule';

export default function PayrollUpdate() {
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
  return <UpdatePayrollModule config={configPage} />;
}
