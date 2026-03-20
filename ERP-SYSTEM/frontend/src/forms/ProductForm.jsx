import { Button, Form, Input, InputNumber, Select } from 'antd';
import useLanguage from '@/locale/useLanguage';

export default function ProductForm({ isUpdateForm = false }) {
  const translate = useLanguage();

  return (
    <>
      <Form.Item
        name="name"
        label={translate('Product Name')}
        rules={[
          {
            required: true,
            message: 'Please input product name!',
          },
        ]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="category"
        label={translate('Category')}
        rules={[
          {
            required: true,
            message: 'Please select a category!',
          },
        ]}
      >
        <Select
          options={[
            { value: 'Electronics', label: 'Electronics' },
            { value: 'Clothing', label: 'Clothing' },
            { value: 'Food', label: 'Food' },
            { value: 'Services', label: 'Services' },
            { value: 'Other', label: 'Other' },
          ]}
        />
      </Form.Item>

      <Form.Item
        name="price"
        label={translate('Price')}
        rules={[
          {
            required: true,
            message: 'Please input price!',
          },
        ]}
      >
        <InputNumber
          className="moneyInput"
          min={0}
          controls={false}
          style={{ width: '100%' }}
        />
      </Form.Item>

      <Form.Item
        name="quantity"
        label={translate('Stock Quantity')}
        rules={[
          {
            required: true,
            message: 'Please input available quantity!',
          },
        ]}
      >
        <InputNumber
          min={0}
          style={{ width: '100%' }}
        />
      </Form.Item>

      <Form.Item
        name="description"
        label={translate('Description')}
      >
        <Input.TextArea rows={4} />
      </Form.Item>
    </>
  );
}
