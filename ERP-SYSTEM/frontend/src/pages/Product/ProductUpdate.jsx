import ErpPanelModule from '@/modules/ErpPanelModule';
import ProductForm from '@/forms/ProductForm';
import useLanguage from '@/locale/useLanguage';

export default function ProductUpdate() {
  const translate = useLanguage();
  const entity = 'product';

  const Labels = {
    PANEL_TITLE: translate('product'),
    DATATABLE_TITLE: translate('product_list'),
    ADD_NEW_ENTITY: translate('add_new_product'),
    ENTITY_NAME: translate('product'),
    CREATE_ENTITY: translate('save'),
    UPDATE_ENTITY: translate('update'),
  };

  const configPage = {
    entity,
    ...Labels,
  };

  const config = {
    ...configPage,
    deleteModalLabels: ['name'],
  };

  return (
    <ErpPanelModule
      config={config}
      UpdateForm={<ProductForm isUpdateForm={true} />}
    />
  );
}
