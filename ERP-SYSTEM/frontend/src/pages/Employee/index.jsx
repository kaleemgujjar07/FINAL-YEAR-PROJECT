import dayjs from 'dayjs';
import { Tag } from 'antd';
import { tagColor } from '@/utils/statusTagColor';
import EmployeeDataTableModule from '@/modules/EmployeeModule/EmployeeDataTableModule';
import { useDate } from '@/settings';
import useLanguage from '@/locale/useLanguage';

export default function Employee() {
  const translate = useLanguage();
  const { dateFormat } = useDate();
  const entity = 'employee';

  const searchConfig = {
    entity: 'employee',
    displayLabels: ['name', 'surname'],
    searchFields: 'name,surname,email,phone',
  };
  const deleteModalLabels = ['name', 'surname'];
  const dataTableColumns = [
    {
      title: translate('Name'),
      dataIndex: 'name',
    },
    {
      title: translate('Surname'),
      dataIndex: 'surname',
    },
    {
      title: translate('Email'),
      dataIndex: 'email',
    },
    {
      title: translate('Department'),
      dataIndex: 'department',
    },
    {
      title: translate('Position'),
      dataIndex: 'position',
    },
    {
      title: translate('Status'),
      dataIndex: 'status',
    },
  ];

  const Labels = {
    PANEL_TITLE: translate('Employee'),
    DATATABLE_TITLE: translate('Employee List'),
    ADD_NEW_ENTITY: translate('Add New Employee'),
    ENTITY_NAME: translate('Employee'),
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
  return <EmployeeDataTableModule config={config} />;
}
