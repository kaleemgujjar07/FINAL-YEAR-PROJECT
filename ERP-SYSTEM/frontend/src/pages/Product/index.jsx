import { useState } from 'react';
import dayjs from 'dayjs';
import { Tag } from 'antd';
import useLanguage from '@/locale/useLanguage';
import { useMoney } from '@/settings';
import CrudModule from '@/modules/CrudModule/CrudModule';
import ProductForm from '@/forms/ProductForm';
import StockAnalysisCard from './StockAnalysisCard';

export default function Product() {
  const translate = useLanguage();
  const { moneyFormatter } = useMoney();

  const entity = 'product';
  const searchConfig = {
    displayLabels: ['name'],
    searchFields: 'name,category',
    outputValue: '_id',
  };

  const panelTitle = translate('Product');
  const dataTableTitle = translate('Products List');
  const entityDisplayLabels = ['name'];

  const readColumns = [
    {
      title: translate('Product Name'),
      dataIndex: 'name',
    },
    {
      title: translate('Category'),
      dataIndex: 'category',
    },
    {
      title: translate('Price'),
      dataIndex: 'price',
      render: (amount) => moneyFormatter({ amount }),
    },
    {
      title: translate('Stock Quantity'),
      dataIndex: 'quantity',
    },
    {
      title: translate('Description'),
      dataIndex: 'description',
    },
  ];

  const dataTableColumns = [
    {
      title: translate('Product Name'),
      dataIndex: 'name',
    },
    {
      title: translate('Category'),
      dataIndex: 'category',
    },
    {
      title: translate('Price'),
      dataIndex: 'price',
      render: (amount) => moneyFormatter({ amount }),
    },
    {
      title: translate('Stock Quantity'),
      dataIndex: 'quantity',
      render: (quantity) => {
        let color = quantity > 10 ? 'green' : quantity > 0 ? 'orange' : 'red';
        return <Tag color={color}>{quantity}</Tag>;
      },
    },
    {
      title: translate('Created'),
      dataIndex: 'created',
      render: (date) => dayjs(date).format('DD/MM/YYYY'),
    },
  ];

  const Labels = {
    PANEL_TITLE: panelTitle,
    DATATABLE_TITLE: dataTableTitle,
    ADD_NEW_ENTITY: translate('add_new_product'),
    ENTITY_NAME: translate('product'),
    CREATE_ENTITY: translate('save'),
    UPDATE_ENTITY: translate('update'),
    RECORD_ENTITY: translate('record_payment'),
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
    entityDisplayLabels,
    deleteModalLabels: ['name'],
  };

  return (
    <>
      <StockAnalysisCard />
      <CrudModule
        createForm={<ProductForm />}
        updateForm={<ProductForm isUpdateForm={true} />}
        config={config}
      />
    </>
  );
}
