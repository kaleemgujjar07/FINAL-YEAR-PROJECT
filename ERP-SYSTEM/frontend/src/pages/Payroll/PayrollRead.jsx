import useLanguage from '@/locale/useLanguage';
import ReadPayrollModule from '@/modules/PayrollModule/ReadPayrollModule';

export default function PayrollRead() {
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
  return <ReadPayrollModule config={configPage} />;
}
