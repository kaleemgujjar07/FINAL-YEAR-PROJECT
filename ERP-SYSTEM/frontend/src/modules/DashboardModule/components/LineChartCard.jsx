import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Empty } from 'antd';
import useLanguage from '@/locale/useLanguage';

export default function LineChartCard({ title, data, isLoading }) {
  const translate = useLanguage();

  if (isLoading) return <div className="whiteBox shadow pad20" style={{ height: '350px' }}>Loading...</div>;

  const chartData = data?.map((item) => ({
    name: item.status || translate('Unknown'),
    value: item.count || item.percentage || 0,
  })).filter(item => item.value > 0);

  return (
    <div className="whiteBox shadow pad20" style={{ height: '100%', minHeight: '350px' }}>
      <div style={{ padding: '0 20px' }}>
        <h3 style={{ color: '#22075e', marginBottom: 5 }}>{translate(title)}</h3>
      </div>
      
      {chartData && chartData.length > 0 ? (
        <div style={{ width: '100%', height: 260 }}>
          <ResponsiveContainer>
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Line type="monotone" dataKey="value" stroke="#722ed1" strokeWidth={3} dot={{ r: 6, fill: '#722ed1', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div style={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Empty description={translate('No data available')} />
        </div>
      )}
    </div>
  );
}
