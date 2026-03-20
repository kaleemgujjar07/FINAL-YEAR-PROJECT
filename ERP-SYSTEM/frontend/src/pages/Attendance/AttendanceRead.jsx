import useLanguage from '@/locale/useLanguage';
import ReadAttendanceModule from '@/modules/AttendanceModule/ReadAttendanceModule';

export default function AttendanceRead() {
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
  return <ReadAttendanceModule config={configPage} />;
}
