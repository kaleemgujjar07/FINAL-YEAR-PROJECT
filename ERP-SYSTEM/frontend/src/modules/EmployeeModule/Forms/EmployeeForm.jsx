import { Form, Input, InputNumber, Select, DatePicker, Row, Col } from 'antd';
import dayjs from 'dayjs';
import useLanguage from '@/locale/useLanguage';

export default function EmployeeForm({ current = null }) {
  const translate = useLanguage();

  return (
    <Row gutter={[12, 0]}>
      <Col className="gutter-row" span={12}>
        <Form.Item
          label={translate('Name')}
          name="name"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
      </Col>
      <Col className="gutter-row" span={12}>
        <Form.Item
          label={translate('Surname')}
          name="surname"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
      </Col>
      <Col className="gutter-row" span={12}>
        <Form.Item
          label={translate('Email')}
          name="email"
          rules={[{ type: 'email' }]}
        >
          <Input />
        </Form.Item>
      </Col>
      <Col className="gutter-row" span={12}>
        <Form.Item
          label={translate('Phone')}
          name="phone"
        >
          <Input />
        </Form.Item>
      </Col>
      <Col className="gutter-row" span={12}>
        <Form.Item
          label={translate('Department')}
          name="department"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
      </Col>
      <Col className="gutter-row" span={12}>
        <Form.Item
          label={translate('Position')}
          name="position"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
      </Col>
      <Col className="gutter-row" span={8}>
        <Form.Item
          label={translate('Join Date')}
          name="joinDate"
          rules={[{ required: true, type: 'object' }]}
          initialValue={dayjs()}
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>
      </Col>
      <Col className="gutter-row" span={8}>
        <Form.Item
          label={translate('Salary')}
          name="salary"
          rules={[{ required: true }]}
        >
          <InputNumber style={{ width: '100%' }} />
        </Form.Item>
      </Col>
      <Col className="gutter-row" span={8}>
        <Form.Item
          label={translate('Status')}
          name="status"
          initialValue={'active'}
        >
          <Select
            options={[
              { value: 'active', label: translate('Active') },
              { value: 'inactive', label: translate('Inactive') },
              { value: 'on_leave', label: translate('On Leave') },
            ]}
          />
        </Form.Item>
      </Col>
      <Col className="gutter-row" span={24}>
        <Form.Item
          label={translate('Note')}
          name="notes"
        >
          <Input.TextArea />
        </Form.Item>
      </Col>
    </Row>
  );
}
