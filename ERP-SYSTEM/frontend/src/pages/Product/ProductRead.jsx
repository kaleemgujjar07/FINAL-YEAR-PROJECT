import { useMoney } from '@/settings';
import useLanguage from '@/locale/useLanguage';
import GenericReadItem from '@/modules/ErpPanelModule/GenericReadItem';

export default function ProductRead() {
  const translate = useLanguage();
  const { moneyFormatter } = useMoney();
  
  const entity = 'product';

  const Labels = {
    PANEL_TITLE: translate('product'),
    DATATABLE_TITLE: translate('product_list'),
    ADD_NEW_ENTITY: translate('add_new_product'),
    ENTITY_NAME: translate('product'),
  };

  const configPage = {
    entity,
    ...Labels,
  };

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

  const config = {
    ...configPage,
    readColumns,
    deleteModalLabels: ['name'],
  };

  return <GenericReadItem config={config} />;
}
