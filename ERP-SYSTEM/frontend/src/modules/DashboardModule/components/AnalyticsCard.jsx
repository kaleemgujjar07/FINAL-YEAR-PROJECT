import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import useLanguage from '@/locale/useLanguage';
import { request } from '@/request';
import { Spin } from 'antd';

export default function AnalyticsCard() {
  const translate = useLanguage();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await request.get({ entity: 'stats/revenue-forecast' });
        if (response.success) {
          // Combine Actual and Forecast into Recharts format
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
        console.error('Forecast fetch failed:', err);
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
          {translate('Cognivio Revenue Forecast')}
        </h3>
        <p style={{ color: '#888', margin: 0 }}>
          AI-powered projected sales based on historical trends
        </p>
      </div>

      <div style={{ width: '100%', height: 320, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        {loading ? (
          <Spin size="large" />
        ) : (
          <ResponsiveContainer minWidth={0}>
            <AreaChart
              data={data}
              margin={{
                top: 10,
                right: 30,
                left: 0,
                bottom: 0,
              }}
            >
              <defs>
                <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1890ff" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#1890ff" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorProjected" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#52c41a" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#52c41a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Area 
                type="monotone" 
                dataKey="current" 
                stroke="#1890ff" 
                fillOpacity={1} 
                fill="url(#colorCurrent)" 
                name="Actual Revenue" 
                strokeWidth={3}
              />
              <Area 
                type="monotone" 
                dataKey="projected" 
                stroke="#52c41a" 
                strokeDasharray="5 5"
                fillOpacity={1} 
                fill="url(#colorProjected)" 
                name="AI Prediction" 
                strokeWidth={3}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
