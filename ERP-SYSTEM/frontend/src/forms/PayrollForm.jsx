import React from 'react';
import { Form, Input, InputNumber, Select, DatePicker, Row, Col } from 'antd';
import SelectAsync from '@/components/SelectAsync';
import useLanguage from '@/locale/useLanguage';

export default function PayrollForm({ isUpdateForm = false }) {
  const translate = useLanguage();
  return (
    <Row gutter={[12, 0]}>
      <Col className="gutter-row" span={12}>
        <Form.Item
          name="employee"
          label={translate('employee')}
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
          name="month"
          label={translate('month')}
          rules={[{ required: true }]}
        >
          <Select
            options={[
              { value: 'January', label: 'January' },
              { value: 'February', label: 'February' },
              { value: 'March', label: 'March' },
              { value: 'April', label: 'April' },
              { value: 'May', label: 'May' },
              { value: 'June', label: 'June' },
              { value: 'July', label: 'July' },
              { value: 'August', label: 'August' },
              { value: 'September', label: 'September' },
              { value: 'October', label: 'October' },
              { value: 'November', label: 'November' },
              { value: 'December', label: 'December' },
            ]}
          />
        </Form.Item>
      </Col>
      <Col className="gutter-row" span={12}>
        <Form.Item
          name="year"
          label={translate('year')}
          rules={[{ required: true }]}
        >
          <InputNumber style={{ width: '100%' }} />
        </Form.Item>
      </Col>
      <Col className="gutter-row" span={12}>
        <Form.Item
          name="basicSalary"
          label={translate('basic_salary')}
          rules={[{ required: true }]}
        >
          <InputNumber style={{ width: '100%' }} />
        </Form.Item>
      </Col>
      <Col className="gutter-row" span={12}>
        <Form.Item
          name="deductions"
          label={translate('deductions')}
        >
          <InputNumber style={{ width: '100%' }} />
        </Form.Item>
      </Col>
      <Col className="gutter-row" span={12}>
        <Form.Item
          name="netSalary"
          label={translate('net_salary')}
          rules={[{ required: true }]}
        >
          <InputNumber style={{ width: '100%' }} />
        </Form.Item>
      </Col>
      <Col className="gutter-row" span={12}>
        <Form.Item
          name="paymentDate"
          label={translate('payment_date')}
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>
      </Col>
      <Col className="gutter-row" span={12}>
        <Form.Item
          name="status"
          label={translate('status')}
          initialValue="Draft"
        >
          <Select
            options={[
              { value: 'Draft', label: translate('draft') },
              { value: 'Paid', label: translate('paid') },
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
