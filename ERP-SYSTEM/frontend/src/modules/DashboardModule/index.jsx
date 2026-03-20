import { useEffect, useState } from 'react';

import { Tag, Row, Col } from 'antd';
import useLanguage from '@/locale/useLanguage';

import { useMoney } from '@/settings';

import { request } from '@/request';
import useFetch from '@/hooks/useFetch';
import useOnFetch from '@/hooks/useOnFetch';

import RecentTable from './components/RecentTable';

import SummaryCard from './components/SummaryCard';
import ChartCard from './components/ChartCard';
import BarChartCard from './components/BarChartCard';
import LineChartCard from './components/LineChartCard';
import AnalyticsCard from './components/AnalyticsCard';
import CustomerPreviewCard from './components/CustomerPreviewCard';

import { selectMoneyFormat } from '@/redux/settings/selectors';
import { useSelector } from 'react-redux';
import { Typography } from 'antd';
import { RocketOutlined } from '@ant-design/icons';
import AIInsights from './components/AIInsights';
import ExpenseForecastCard from './components/ExpenseForecastCard';
import PredictiveStockAlerts from './components/PredictiveStockAlerts';

const { Title } = Typography;

export default function DashboardModule() {
  const translate = useLanguage();
  const { moneyFormatter } = useMoney();
  const money_format_settings = useSelector(selectMoneyFormat);

  const getStatsData = async ({ entity, currency }) => {
    return await request.summary({
      entity,
      options: { currency },
    });
  };

  const {
    result: invoiceResult,
    isLoading: invoiceLoading,
    onFetch: fetchInvoicesStats,
  } = useOnFetch();

  const {
    result: employeeResult,
    isLoading: employeeLoading,
    onFetch: fetchEmployeesStats,
  } = useOnFetch();

  const {
    result: attendanceResult,
    isLoading: attendanceLoading,
    onFetch: fetchAttendanceStats,
  } = useOnFetch();

  const {
    result: expenseResult,
    isLoading: expenseLoading,
    onFetch: fetchExpensesStats,
  } = useOnFetch();

  const { result: clientResult, isLoading: clientLoading } = useFetch(() =>
    request.summary({ entity: 'client' })
  );

  useEffect(() => {
    const currency = money_format_settings.default_currency_code || null;

    if (currency) {
      fetchInvoicesStats(getStatsData({ entity: 'invoice', currency }));
      fetchEmployeesStats(getStatsData({ entity: 'employee' }));
      fetchAttendanceStats(getStatsData({ entity: 'attendance' }));
      fetchExpensesStats(getStatsData({ entity: 'expense', currency }));
    }
  }, [money_format_settings.default_currency_code]);

  const dataTableColumns = [
    {
      title: translate('number'),
      dataIndex: 'number',
    },
    {
      title: translate('Client'),
      dataIndex: ['client', 'name'],
    },

    {
      title: translate('Total'),
      dataIndex: 'total',
      onCell: () => {
        return {
          style: {
            textAlign: 'right',
            whiteSpace: 'nowrap',
            direction: 'ltr',
          },
        };
      },
      render: (total, record) => moneyFormatter({ amount: total, currency_code: record.currency }),
    },
    {
      title: translate('Status'),
      dataIndex: 'status',
    },
  ];

  const entityData = [
    {
      result: invoiceResult,
      isLoading: invoiceLoading,
      entity: 'invoice',
      title: translate('Invoices'),
      type: 'pie',
    },
    {
      result: employeeResult,
      isLoading: employeeLoading,
      entity: 'employee',
      title: translate('Employees'),
      type: 'bar',
    },
    {
      result: attendanceResult,
      isLoading: attendanceLoading,
      entity: 'attendance',
      title: translate('Attendance'),
      type: 'line',
    },
    {
      result: expenseResult,
      isLoading: expenseLoading,
      entity: 'expense',
      title: translate('Expenses'),
      type: 'bar',
    },
  ];

  const statisticCards = entityData.map((data, index) => {
    const { result, entity, isLoading, title, type } = data;

    if (type === 'bar') {
      return (
        <Col key={index} className="gutter-row" xs={{ span: 24 }} sm={{ span: 12 }}>
          <BarChartCard title={title} isLoading={isLoading} data={result?.performance} />
        </Col>
      );
    } else if (type === 'line') {
      return (
        <Col key={index} className="gutter-row" xs={{ span: 24 }} sm={{ span: 12 }}>
          <LineChartCard title={title} isLoading={isLoading} data={result?.performance} />
        </Col>
      );
    }
    
    return (
      <Col key={index} className="gutter-row" xs={{ span: 24 }} sm={{ span: 12 }}>
        <ChartCard title={title} isLoading={isLoading} data={result?.performance} />
      </Col>
    );
  });

  if (money_format_settings) {
    return (
      <>
        <Row gutter={[32, 32]}>
          <SummaryCard
            title={translate('Invoices')}
            prefix={translate('This month')}
            isLoading={invoiceLoading}
            data={invoiceResult?.total}
          />
          <SummaryCard
            title={translate('Employees')}
            prefix={translate('Total')}
            isLoading={employeeLoading}
            data={employeeResult?.countAllDocs}
            isMoney={false}
          />
          <SummaryCard
            title={translate('Attendance')}
            prefix={translate('Present Today')}
            isLoading={attendanceLoading}
            data={attendanceResult?.countFilter}
            isMoney={false}
          />
          <SummaryCard
            title={translate('Expenses')}
            prefix={translate('This month')}
            isLoading={expenseLoading}
            data={expenseResult?.total}
            isMoney={true}
          />
        </Row>
        <div className="space30"></div>
        
        <Title level={4} style={{ color: '#22075e', marginBottom: 20 }}>
          <RocketOutlined /> Cognivio Intelligence Dashboard
        </Title>
        
        <Row gutter={[32, 32]}>
          <Col className="gutter-row w-full" sm={{ span: 24 }} md={{ span: 24 }} lg={{ span: 12 }}>
             <AnalyticsCard />
          </Col>
          <Col className="gutter-row w-full" sm={{ span: 24 }} md={{ span: 24 }} lg={{ span: 12 }}>
             <ExpenseForecastCard />
          </Col>
        </Row>
        
        <div className="space30"></div>
        
        <Row gutter={[32, 32]}>
          <Col className="gutter-row w-full" sm={{ span: 24 }} lg={{ span: 16 }}>
            <AIInsights />
          </Col>
          <Col className="gutter-row w-full" sm={{ span: 24 }} lg={{ span: 8 }}>
            <PredictiveStockAlerts />
          </Col>
        </Row>

        <div className="space30"></div>
        <Row gutter={[32, 32]}>
          {statisticCards}
        </Row>
        <div className="space30"></div>
        <Row gutter={[32, 32]}>
          <Col className="gutter-row w-full" sm={{ span: 24 }} lg={{ span: 12 }}>
            <div className="whiteBox shadow pad20" style={{ height: '100%' }}>
              <h3 style={{ color: '#22075e', marginBottom: 5, padding: '0 20px 20px' }}>
                {translate('Recent Invoices')}
              </h3>

              <RecentTable entity={'invoice'} dataTableColumns={dataTableColumns} />
            </div>
          </Col>

          <Col className="gutter-row w-full" sm={{ span: 24 }} lg={{ span: 12 }}>
            <div className="whiteBox shadow pad20" style={{ height: '100%' }}>
              <h3 style={{ color: '#22075e', marginBottom: 5, padding: '0 20px 20px' }}>
                {translate('Recent Expenses')}
              </h3>
              <RecentTable entity={'expense'} dataTableColumns={[
                { title: translate('Title'), dataIndex: 'title' },
                { title: translate('Amount'), dataIndex: 'amount' },
                { title: translate('Status'), dataIndex: 'status' }
              ]} />
            </div>
          </Col>
        </Row>
      </>
    );
  } else {
    return <></>;
  }
}
