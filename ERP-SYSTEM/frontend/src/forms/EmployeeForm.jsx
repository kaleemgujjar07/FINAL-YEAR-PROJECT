import { Form, Input, Select, InputNumber, DatePicker, Row, Col } from 'antd';
import useLanguage from '@/locale/useLanguage';
import dayjs from 'dayjs';

export default function EmployeeForm() {
  const translate = useLanguage();

  return (
    <Row gutter={[12, 0]}>
      <Col className="gutter-row" span={12}>
        <Form.Item
          name="name"
          label={translate('first_name')}
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
      </Col>
      <Col className="gutter-row" span={12}>
        <Form.Item
          name="surname"
          label={translate('last_name')}
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
      </Col>
      <Col className="gutter-row" span={12}>
        <Form.Item
          name="email"
          label={translate('email')}
          rules={[{ type: 'email' }]}
        >
          <Input />
        </Form.Item>
      </Col>
      <Col className="gutter-row" span={12}>
        <Form.Item
          name="phone"
          label={translate('phone')}
        >
          <Input />
        </Form.Item>
      </Col>
      <Col className="gutter-row" span={12}>
        <Form.Item
          name="department"
          label={translate('department')}
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
      </Col>
      <Col className="gutter-row" span={12}>
        <Form.Item
          name="position"
          label={translate('position')}
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
      </Col>
      <Col className="gutter-row" span={12}>
        <Form.Item
          name="joinDate"
          label={translate('join_date')}
          rules={[{ required: true, type: 'object' }]}
          initialValue={dayjs()}
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>
      </Col>
      <Col className="gutter-row" span={12}>
        <Form.Item
          name="salary"
          label={translate('salary')}
          rules={[{ required: true }]}
        >
          <InputNumber style={{ width: '100%' }} />
        </Form.Item>
      </Col>
      <Col className="gutter-row" span={12}>
        <Form.Item
          name="status"
          label={translate('status')}
          initialValue="active"
        >
          <Select
            options={[
              { value: 'active', label: translate('active') },
              { value: 'inactive', label: translate('inactive') },
              { value: 'on_leave', label: translate('on_leave') },
            ]}
          />
        </Form.Item>
      </Col>
      <Col className="gutter-row" span={24}>
        <Form.Item
          name="notes"
          label={translate('notes')}
        >
          <Input.TextArea />
        </Form.Item>
      </Col>
    </Row>
  );
}
