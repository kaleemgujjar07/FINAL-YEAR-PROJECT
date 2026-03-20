import { Form, Input, Select, DatePicker, Row, Col } from 'antd';
import dayjs from 'dayjs';
import useLanguage from '@/locale/useLanguage';
import SelectAsync from '@/components/SelectAsync';

export default function AttendanceForm({ current = null }) {
  const translate = useLanguage();

  return (
    <Row gutter={[12, 0]}>
      <Col className="gutter-row" span={12}>
        <Form.Item
          label={translate('employee')}
          name="employee"
          rules={[{ required: true }]}
        >
          <SelectAsync
            entity={'employee'}
            displayLabels={['name', 'surname']}
            searchFields={'name,surname'}
            withRedirect={true}
            urlToRedirect="/employee/create"
            redirectLabel={translate('add_new_employee')}
          />
        </Form.Item>
      </Col>
      <Col className="gutter-row" span={12}>
        <Form.Item
          label={translate('date')}
          name="date"
          rules={[{ required: true, type: 'object' }]}
          initialValue={dayjs()}
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>
      </Col>
      <Col className="gutter-row" span={8}>
        <Form.Item
          label={translate('status')}
          name="status"
          rules={[{ required: true }]}
          initialValue={'Present'}
        >
          <Select
            options={[
              { value: 'Present', label: translate('present') },
              { value: 'Absent', label: translate('absent') },
              { value: 'Half Day', label: translate('half_day') },
              { value: 'Leave', label: translate('leave') },
            ]}
          />
        </Form.Item>
      </Col>
      <Col className="gutter-row" span={8}>
        <Form.Item
          label={translate('check_in_time')}
          name="checkIn"
        >
          <Input placeholder="HH:mm" />
        </Form.Item>
      </Col>
      <Col className="gutter-row" span={8}>
        <Form.Item
          label={translate('check_out_time')}
          name="checkOut"
        >
          <Input placeholder="HH:mm" />
        </Form.Item>
      </Col>
      <Col className="gutter-row" span={24}>
        <Form.Item
          label={translate('notes')}
          name="notes"
        >
          <Input.TextArea />
        </Form.Item>
      </Col>
    </Row>
  );
}
