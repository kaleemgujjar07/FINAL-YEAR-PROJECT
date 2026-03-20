import { Form, Input } from 'antd';
import { validatePhoneNumber } from '@/utils/helpers';
import useLanguage from '@/locale/useLanguage';

export default function SupplierForm({ isUpdateForm = false }) {
  const translate = useLanguage();
  
  const validateEmptyString = (_, value) => {
    if (value && value.trim() === '') {
      return Promise.reject(new Error('Field cannot be empty'));
    }
    return Promise.resolve();
  };

  return (
    <>
      <Form.Item
        label={translate('name')}
        name="name"
        rules={[
          { required: true },
          { validator: validateEmptyString },
        ]}
      >
        <Input />
      </Form.Item>
      
      <Form.Item
        label={translate('company')}
        name="company"
        rules={[
          { validator: validateEmptyString },
        ]}
      >
        <Input />
      </Form.Item>
      
      <Form.Item
        name="phone"
        label={translate('Phone')}
        rules={[
          { required: true },
          { validator: validateEmptyString },
          { pattern: validatePhoneNumber, message: 'Please enter a valid phone number' },
        ]}
      >
        <Input />
      </Form.Item>
      
      <Form.Item
        name="email"
        label={translate('email')}
        rules={[
          { type: 'email' },
          { required: true },
          { validator: validateEmptyString },
        ]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        label={translate('address')}
        name="address"
      >
        <Input.TextArea />
      </Form.Item>
    </>
  );
}
