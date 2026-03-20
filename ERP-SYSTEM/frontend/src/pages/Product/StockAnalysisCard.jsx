import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import useFetch from '@/hooks/useFetch';
import { request } from '@/request';
import useLanguage from '@/locale/useLanguage';
import { Empty } from 'antd';

const COLORS = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#eb2f96'];

export default function StockAnalysisCard() {
  const translate = useLanguage();
  
  const { result, isLoading, isSuccess } = useFetch(() =>
    request.list({ entity: 'product', options: { items: 10 } })
  );

  if (isLoading) return <div className="whiteBox shadow pad20" style={{ height: '350px', marginBottom: '24px' }}>Loading...</div>;

  const data = result?.result || [];
  
  const chartData = data.map((item, index) => ({
    name: item.name,
    quantity: item.quantity,
    color: COLORS[index % COLORS.length]
  }));

  return (
    <div className="whiteBox shadow pad20" style={{ height: '100%', minHeight: '350px', marginBottom: '24px' }}>
      <div style={{ padding: '0 20px 20px' }}>
        <h3 style={{ color: '#22075e', marginBottom: 5 }}>
          {translate('Inventory Stock Analysis')}
        </h3>
        <p style={{ color: '#888', margin: 0 }}>Stock remaining for tracked inventory items</p>
      </div>

      {chartData && chartData.length > 0 ? (
        <div style={{ width: '100%', height: 260 }}>
          <ResponsiveContainer>
             <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                cursor={{ fill: 'rgba(0,0,0,0.05)' }}
              />
              <Legend verticalAlign="top" height={36}/>
              <Bar dataKey="quantity" name={translate('Stock Quantity')} radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
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
