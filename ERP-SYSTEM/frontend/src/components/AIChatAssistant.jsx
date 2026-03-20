import React, { useState } from 'react';
import { Button, Drawer, Input, List, Space, Typography, Tag } from 'antd';
import { MessageOutlined, SendOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Text } = Typography;

export default function AIChatAssistant() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'assistant', text: 'Hello! I am your Cognivio AI Assistant. How can I help you with your business data today?' }
  ]);
  const [loading, setLoading] = useState(false);

  const showDrawer = () => {
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
  };

  const handleSend = async () => {
    if (!message.trim()) return;

    const userMsg = { role: 'user', text: message };
    setChatHistory([...chatHistory, userMsg]);
    setMessage('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:8050/assistant/process', {
        message: message
      });

      const aiMsg = {
        role: 'assistant',
        text: response.data.suggestion,
        intent: response.data.intent,
        entities: response.data.entities
      };
      setChatHistory(prev => [...prev, aiMsg]);
    } catch (error) {
      setChatHistory(prev => [...prev, { role: 'assistant', text: 'Sorry, I am having trouble connecting to the AI service.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        type="primary"
        shape="circle"
        icon={<MessageOutlined />}
        size="large"
        style={{
          position: 'fixed',
          bottom: 30,
          right: 30,
          zIndex: 1000,
          height: 60,
          width: 60,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}
        onClick={showDrawer}
      />
      <Drawer
        title="Cognivio AI Assistant"
        placement="right"
        onClose={onClose}
        open={open}
        width={400}
      >
        <List
          itemLayout="horizontal"
          dataSource={chatHistory}
          style={{ height: 'calc(100vh - 200px)', overflowY: 'auto', marginBottom: 20 }}
          renderItem={(item) => (
            <List.Item style={{ border: 'none', justifyContent: item.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <div style={{
                maxWidth: '80%',
                padding: '10px 15px',
                borderRadius: '15px',
                backgroundColor: item.role === 'user' ? '#1890ff' : '#f0f2f5',
                color: item.role === 'user' ? 'white' : 'black'
              }}>
                <Text style={{ color: item.role === 'user' ? 'white' : 'black' }}>{item.text}</Text>
                {item.intent && (
                    <div style={{marginTop: 5}}>
                        <Tag color="blue">{item.intent}</Tag>
                    </div>
                )}
              </div>
            </List.Item>
          )}
        />
        <div style={{ position: 'absolute', bottom: 20, left: 20, right: 20 }}>
          <Space.Compact style={{ width: '100%' }}>
            <Input
              placeholder="Ask about sales, stock..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onPressEnter={handleSend}
              disabled={loading}
            />
            <Button type="primary" icon={<SendOutlined />} onClick={handleSend} loading={loading} />
          </Space.Compact>
        </div>
      </Drawer>
    </>
  );
}
