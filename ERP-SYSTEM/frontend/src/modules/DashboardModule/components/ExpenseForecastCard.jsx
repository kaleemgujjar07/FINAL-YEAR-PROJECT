import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import useLanguage from '@/locale/useLanguage';
import { request } from '@/request';
import { Spin } from 'antd';

export default function ExpenseForecastCard() {
  const translate = useLanguage();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await request.get({ entity: 'stats/expense-forecast' });
        if (response.success) {
          const formattedData = response.labels.map((label, index) => {
            const actual = response.actual[index] || null;
            const forecastIndex = index - response.actual.length;
            const forecast = forecastIndex >= 0 ? response.forecast[forecastIndex] : (index === response.actual.length - 1 ? actual : null);
            
            return {
              name: label,
              current: actual,
              projected: forecast,
            };
          });
          setData(formattedData);
        }
      } catch (err) {
        console.error('Expense forecast fetch failed:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="whiteBox shadow pad20" style={{ height: '100%', minHeight: '400px' }}>
      <div style={{ padding: '0 20px 20px' }}>
        <h3 style={{ color: '#22075e', marginBottom: 5 }}>
          {translate('Expense Trend AI Projections')}
        </h3>
        <p style={{ color: '#888', margin: 0 }}>
          AI-powered analysis of upcoming business costs
        </p>
      </div>

      <div style={{ width: '100%', height: 320, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        {loading ? (
          <Spin size="large" />
        ) : (
          <ResponsiveContainer>
            <AreaChart
              data={data}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorExpCurrent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff4d4f" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#ff4d4f" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorExpProjected" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#faad14" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#faad14" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
              <Area type="monotone" dataKey="current" stroke="#ff4d4f" fillOpacity={1} fill="url(#colorExpCurrent)" name="Actual Expense" strokeWidth={3} />
              <Area type="monotone" dataKey="projected" stroke="#faad14" strokeDasharray="5 5" fillOpacity={1} fill="url(#colorExpProjected)" name="AI Projected" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
