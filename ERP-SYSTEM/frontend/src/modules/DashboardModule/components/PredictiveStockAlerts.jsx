import React, { useEffect, useState } from 'react';
import { Card, Table, Tag, Typography, Empty, Badge } from 'antd';
import { request } from '@/request';
import { AlertOutlined } from '@ant-design/icons';

const { Text } = Typography;

const PredictiveStockAlerts = () => {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAlerts = async () => {
            try {
                const response = await request.get({ entity: 'product/predictive-stock-alerts' });
                if (response.success) {
                    setAlerts(response.result);
                }
            } catch (err) {
                console.error('Failed to fetch stock alerts:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchAlerts();
    }, []);

    const columns = [
        {
            title: 'Product',
            dataIndex: 'productName',
            key: 'productName',
            render: (text) => <Text strong>{text}</Text>
        },
        {
            title: 'Current Stock',
            dataIndex: 'currentStock',
            key: 'currentStock',
            align: 'center'
        },
        {
            title: 'Days Left (Est.)',
            dataIndex: 'daysRemaining',
            key: 'daysRemaining',
            align: 'center',
            render: (days, record) => (
                <Tag color={record.severity === 'critical' ? 'red' : 'orange'}>
                    {days === 'N/A' ? 'Low Stock' : `${days} Days`}
                </Tag>
            )
        }
    ];

    return (
        <Card 
            title={
                <span>
                    <AlertOutlined style={{ marginRight: 8, color: '#ff4d4f' }} />
                    AI Predictive Stock Alerts
                </span>
            }
            className="whiteBox shadow"
            loading={loading}
            styles={{ body: { padding: 0 } }}
        >
            {alerts.length > 0 ? (
                <Table 
                    dataSource={alerts} 
                    columns={columns} 
                    pagination={false} 
                    size="small"
                    rowKey="productId"
                />
            ) : (
                <div style={{ padding: '40px 0' }}>
                    <Empty description="All stock levels are healthy!" />
                </div>
            )}
        </Card>
    );
};

export default PredictiveStockAlerts;
