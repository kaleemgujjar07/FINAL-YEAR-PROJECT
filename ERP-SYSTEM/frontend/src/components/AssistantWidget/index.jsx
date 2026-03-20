import React, { useState, useRef, useEffect } from 'react';
import { Button, Card, Input, Avatar, List, Space, Badge } from 'antd';
import { RobotOutlined, SendOutlined, CloseOutlined, MessageOutlined } from '@ant-design/icons';
import { request } from '@/request';

const AssistantWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'ai', text: 'Hello! I am your Cognivio AI Assistant. How can I help you today?' },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, isOpen]);

  const handleSend = async () => {
    if (!message.trim()) return;

    const userMsg = { role: 'user', text: message };
    setChatHistory((prev) => [...prev, userMsg]);
    setMessage('');
    setIsLoading(true);

    try {
      const response = await request.post({
        entity: 'assistant/query',
        jsonData: { message: userMsg.text },
      });

      if (response.success) {
        setChatHistory((prev) => [...prev, { role: 'ai', text: response.result }]);
      } else {
        setChatHistory((prev) => [...prev, { role: 'ai', text: 'I encountered an error. Please try again.' }]);
      }
    } catch (err) {
      setChatHistory((prev) => [...prev, { role: 'ai', text: 'I am currently offline. Please ensure the AI Service is running.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: 30, right: 30, zIndex: 9999 }}>
      {isOpen ? (
        <Card
          title={
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>
                <RobotOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                Cognivio AI Assistant
              </span>
              <Button type="text" icon={<CloseOutlined />} onClick={() => setIsOpen(false)} />
            </div>
          }
          style={{ width: 350, borderRadius: 15, boxShadow: '0 10px 25px rgba(0,0,0,0.15)', overflow: 'hidden' }}
          bodyStyle={{ padding: 0 }}
        >
          <div
            ref={scrollRef}
            style={{ height: 350, overflowY: 'auto', padding: '15px', background: '#f9f9f9' }}
          >
            <List
              dataSource={chatHistory}
              renderItem={(item) => (
                <List.Item style={{ border: 'none', padding: '8px 0', justifyContent: item.role === 'ai' ? 'flex-start' : 'flex-end' }}>
                  <div style={{ display: 'flex', flexDirection: item.role === 'ai' ? 'row' : 'row-reverse', alignItems: 'flex-start', maxWidth: '85%' }}>
                    <Avatar 
                        icon={item.role === 'ai' ? <RobotOutlined /> : null} 
                        style={{ backgroundColor: item.role === 'ai' ? '#1890ff' : '#87d068', flexShrink: 0 }}
                    >
                        {item.role === 'user' ? 'U' : ''}
                    </Avatar>
                    <div style={{ 
                      margin: item.role === 'ai' ? '0 0 0 10px' : '0 10px 0 0',
                      padding: '8px 12px',
                      borderRadius: '12px',
                      background: item.role === 'ai' ? '#fff' : '#1890ff',
                      color: item.role === 'ai' ? '#000' : '#fff',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                      fontSize: '13px'
                    }}>
                      {item.text}
                    </div>
                  </div>
                </List.Item>
              )}
            />
            {isLoading && <div style={{ fontSize: '11px', color: '#999', marginTop: 5 }}>AI is typing...</div>}
          </div>
          <div style={{ padding: '10px', borderTop: '1px solid #f0f0f0' }}>
            <Space.Compact style={{ width: '100%' }}>
              <Input
                placeholder="Ask me anything..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onPressEnter={handleSend}
                disabled={isLoading}
              />
              <Button type="primary" icon={<SendOutlined />} onClick={handleSend} loading={isLoading} />
            </Space.Compact>
          </div>
        </Card>
      ) : (
        <Badge dot color="blue">
            <Button
            type="primary"
            shape="circle"
            size="large"
            icon={<MessageOutlined style={{ fontSize: 24 }} />}
            onClick={() => setIsOpen(true)}
            style={{ width: 60, height: 60, boxShadow: '0 5px 15px rgba(24, 144, 255, 0.4)' }}
            />
        </Badge>
      )}
    </div>
  );
};

export default AssistantWidget;
