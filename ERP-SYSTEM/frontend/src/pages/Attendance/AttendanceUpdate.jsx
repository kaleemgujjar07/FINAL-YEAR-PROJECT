import useLanguage from '@/locale/useLanguage';
import UpdateAttendanceModule from '@/modules/AttendanceModule/UpdateAttendanceModule';

export default function AttendanceUpdate() {
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
  return <UpdateAttendanceModule config={configPage} />;
}
