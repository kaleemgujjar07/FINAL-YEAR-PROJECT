import { useState } from 'react';
import { Button, Form, Input, InputNumber, Select, message } from 'antd';
import { RobotOutlined } from '@ant-design/icons';
import axios from 'axios';
import useLanguage from '@/locale/useLanguage';

export default function ProductForm({ isUpdateForm = false }) {
  const translate = useLanguage();
  const form = Form.useFormInstance();
  const [loadingAI, setLoadingAI] = useState(false);

  const handleAskAI = async () => {
    setLoadingAI(true);
    try {
      // In a real app we might pass the competitor price or demand factors.
      const res = await axios.post('http://localhost:8050/price-suggestion', {
        base_price: form.getFieldValue('price') || 100,
        demand: 'high',
        competitor_price: null
      });
      form.setFieldsValue({ price: res.data.suggested_price });
      message.success(`AI suggested an optimized price: $${res.data.suggested_price} (${res.data.logic})`);
    } catch (err) {
      message.error("AI service unreachable or failed.");
    }
    setLoadingAI(false);
  };

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
        label={translate('Price')}
        rules={[
          {
            required: true,
            message: 'Please input price!',
          },
        ]}
      >
        <div style={{ display: 'flex', gap: '10px' }}>
          <Form.Item name="price" noStyle>
            <InputNumber
              className="moneyInput"
              min={0}
              controls={false}
              style={{ width: '100%' }}
            />
          </Form.Item>
          <Button 
            type="dashed" 
            icon={<RobotOutlined />} 
            onClick={handleAskAI} 
            loading={loadingAI}
            style={{ borderColor: '#722ed1', color: '#722ed1' }}
          >
            Ask AI
          </Button>
        </div>
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
