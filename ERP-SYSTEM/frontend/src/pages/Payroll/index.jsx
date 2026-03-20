import React from 'react';
import useLanguage from '@/locale/useLanguage';
import { Tag } from 'antd';
import CrudModule from '@/modules/CrudModule/CrudModule';
import PayrollForm from '@/forms/PayrollForm';

export default function Payroll() {
  const translate = useLanguage();
  const entity = 'payroll';
  const searchConfig = {
    displayLabels: ['employee.name', 'month', 'year'],
    searchFields: 'month,status,notes',
    outputValue: '_id',
  };

  const deleteModalLabels = ['employee.name', 'month', 'year'];

  const readColumns = [
    {
      title: translate('Employee'),
      dataIndex: ['employee', 'name'],
    },
    {
      title: translate('Month'),
      dataIndex: 'month',
    },
    {
      title: translate('Year'),
      dataIndex: 'year',
    },
    {
      title: translate('Net Salary'),
      dataIndex: 'netSalary',
    },
    {
      title: translate('Status'),
      dataIndex: 'status',
    },
  ];
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
      title: translate('Month'),
      dataIndex: 'month',
    },
    {
      title: translate('Year'),
      dataIndex: 'year',
    },
    {
      title: translate('Net Salary'),
      dataIndex: 'netSalary',
    },
    {
      title: translate('Status'),
      dataIndex: 'status',
    },
  ];

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
  const config = {
    ...configPage,
    readColumns,
    dataTableColumns,
    searchConfig,
    deleteModalLabels,
  };
  return (
    <CrudModule
      createForm={<PayrollForm />}
      updateForm={<PayrollForm isUpdateForm={true} />}
      config={config}
    />
  );
}
