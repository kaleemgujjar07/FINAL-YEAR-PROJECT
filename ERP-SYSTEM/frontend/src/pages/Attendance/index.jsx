import dayjs from 'dayjs';
import { Tag } from 'antd';
import useLanguage from '@/locale/useLanguage';
import AttendanceDataTableModule from '@/modules/AttendanceModule/AttendanceDataTableModule';
import { useDate } from '@/settings';

export default function Attendance() {
  const translate = useLanguage();
  const { dateFormat } = useDate();
  
  const searchConfig = {
    entity: 'employee',
    displayLabels: ['name', 'surname'],
    searchFields: 'name,surname',
  };

  const deleteModalLabels = ['employee.name', 'date'];
  
  const dataTableColumns = [
    {
      title: translate('Employee Name'),
      dataIndex: ['employee', 'name'],
    },
    {
      title: translate('Employee Surname'),
      dataIndex: ['employee', 'surname'],
    },
    {
      title: translate('Date'),
      dataIndex: 'date',
      render: (date) => {
        return dayjs(date).format(dateFormat);
      },
    },
    {
      title: translate('Check In'),
      dataIndex: 'checkIn',
    },
    {
      title: translate('Check Out'),
      dataIndex: 'checkOut',
    },
    {
      title: translate('Status'),
      dataIndex: 'status',
    },
  ];

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
  const config = {
    ...configPage,
    dataTableColumns,
    searchConfig,
    deleteModalLabels,
  };
  
  return <AttendanceDataTableModule config={config} />;
}
