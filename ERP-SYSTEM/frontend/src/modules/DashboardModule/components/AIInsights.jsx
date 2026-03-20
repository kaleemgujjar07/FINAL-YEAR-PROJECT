import React, { useEffect, useState } from 'react';
import { Card, Result, Typography, Space, Badge } from 'antd';
import { RocketOutlined, AlertOutlined, RiseOutlined, FallOutlined } from '@ant-design/icons';
import { request } from '@/request';

const { Text, Title } = Typography;

export default function AIInsights() {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const response = await request.get({ entity: 'stats/insights' });
        if (response.success) {
          setInsights(response.insights);
        }
      } catch (err) {
        console.error('Insights fetch failed:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchInsights();
  }, []);

  const getIcon = (color) => {
    switch (color) {
      case 'green': return <RiseOutlined style={{ fontSize: '32px', color: '#52c41a' }} />;
      case 'red': return <AlertOutlined style={{ fontSize: '32px', color: '#ff4d4f' }} />;
      case 'blue': return <RocketOutlined style={{ fontSize: '32px', color: '#1890ff' }} />;
      default: return <FallOutlined style={{ fontSize: '32px', color: '#8c8c8c' }} />;
    }
  };

  return (
    <div className="whiteBox shadow pad20" style={{ height: '100%' }}>
      <div style={{ padding: '0 20px 10px' }}>
        <h3 style={{ color: '#22075e', marginBottom: 0 }}>Cognivio AI Insights</h3>
        <p style={{ color: '#888' }}>Real-time business advisory</p>
      </div>
      
      {loading ? (
        <Card loading={true} bordered={false} />
      ) : (
        <Space direction="vertical" style={{ width: '100%', padding: '0 20px' }}>
          {insights.map((insight, index) => (
            <div key={index} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              padding: '15px', 
              borderRadius: '12px', 
              background: '#f9f9f9',
              borderLeft: `5px solid ${insight.color === 'green' ? '#52c41a' : insight.color === 'red' ? '#ff4d4f' : '#1890ff'}`
            }}>
              <div style={{ marginRight: '15px' }}>
                {getIcon(insight.color)}
              </div>
              <div>
                <Title level={5} style={{ margin: 0 }}>{insight.title}</Title>
                <Text type="secondary">{insight.text}</Text>
              </div>
            </div>
          ))}
          {insights.length === 0 && <Text>No new insights today. Systems are stable.</Text>}
        </Space>
      )}
    </div>
  );
}
