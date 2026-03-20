import React from 'react';
import { Form, Input, InputNumber, Select, DatePicker } from 'antd';
import useLanguage from '@/locale/useLanguage';

export default function ExpenseForm({ isUpdateForm = false }) {
  const translate = useLanguage();
  return (
    <>
      <Form.Item
        name="title"
        label={translate('title')}
        rules={[{ required: true }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="amount"
        label={translate('amount')}
        rules={[{ required: true }]}
      >
        <InputNumber style={{ width: '100%' }} />
      </Form.Item>
      <Form.Item
        name="category"
        label={translate('category')}
        rules={[{ required: true }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="date"
        label={translate('date')}
        rules={[{ required: true }]}
      >
        <DatePicker style={{ width: '100%' }} />
      </Form.Item>
      <Form.Item
        name="status"
        label={translate('status')}
        initialValue="Pending"
      >
        <Select
          options={[
            { value: 'Pending', label: translate('pending') },
            { value: 'Approved', label: translate('accepted') },
            { value: 'Rejected', label: translate('declined') },
          ]}
        />
      </Form.Item>
      <Form.Item
        name="description"
        label={translate('description')}
      >
        <Input.TextArea />
      </Form.Item>
    </>
  );
}
