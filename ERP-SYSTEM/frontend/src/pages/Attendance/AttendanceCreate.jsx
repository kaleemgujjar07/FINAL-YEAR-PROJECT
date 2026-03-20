import useLanguage from '@/locale/useLanguage';
import CreateItemModule from '@/modules/AttendanceModule/CreateItemModule';
import AttendanceForm from '@/modules/AttendanceModule/Forms/AttendanceForm';

export default function AttendanceCreate() {
  const translate = useLanguage();

  const entity = 'attendance';

  const Labels = {
    PANEL_TITLE: translate('Attendance'),
    DATATABLE_TITLE: translate('Attendance List'),
    ADD_NEW_ENTITY: translate('Add New Attendance'),
    ENTITY_NAME: translate('Attendance'),
  };

  const configPage = {
    entity,
    ...Labels,
  };
  return <CreateItemModule config={configPage} CreateForm={AttendanceForm} />;
}
