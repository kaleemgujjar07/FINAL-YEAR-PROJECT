import React from 'react';
import useLanguage from '@/locale/useLanguage';
import { Tag } from 'antd';
import CrudModule from '@/modules/CrudModule/CrudModule';
import ExpenseForm from '@/forms/ExpenseForm';

export default function Expense() {
  const translate = useLanguage();
  const entity = 'expense';
  const searchConfig = {
    displayLabels: ['title', 'category'],
    searchFields: 'title,category',
    outputValue: '_id',
  };

  const deleteModalLabels = ['title', 'amount'];

  const readColumns = [
    {
      title: translate('Title'),
      dataIndex: 'title',
    },
    {
      title: translate('Amount'),
      dataIndex: 'amount',
    },
    {
      title: translate('Category'),
      dataIndex: 'category',
    },
    {
      title: translate('Status'),
      dataIndex: 'status',
    },
  ];
  const dataTableColumns = [
    {
      title: translate('Title'),
      dataIndex: 'title',
    },
    {
      title: translate('Amount'),
      dataIndex: 'amount',
    },
    {
      title: translate('Category'),
      dataIndex: 'category',
    },
    {
      title: translate('Status'),
      dataIndex: 'status',
    },
  ];

  const Labels = {
    PANEL_TITLE: translate('Expense'),
    DATATABLE_TITLE: translate('Expense List'),
    ADD_NEW_ENTITY: translate('Add New Expense'),
    ENTITY_NAME: translate('Expense'),
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
      createForm={<ExpenseForm />}
      updateForm={<ExpenseForm isUpdateForm={true} />}
      config={config}
    />
  );
}
