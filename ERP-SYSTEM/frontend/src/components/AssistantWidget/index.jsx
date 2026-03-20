import React, { useState, useRef, useEffect } from 'react';
import { Button, Input, Avatar, List, Badge, Typography, Divider, Alert } from 'antd';
import { RobotOutlined, MessageOutlined, HomeOutlined, QuestionCircleOutlined, SendOutlined, CloseOutlined, RightOutlined, AudioOutlined, AudioMutedOutlined } from '@ant-design/icons';
import { request } from '@/request';

const { Title, Text } = Typography;

const AssistantWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('home'); // home, messages, help
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'ai', text: 'Hello! I am your Cognivio AI Assistant. How can I help you today? Try asking about sales, inventory, low stock, or HR.' },
  ]);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (activeTab === 'messages' && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, activeTab, isOpen]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setMessage(''); // Clear input
          setActiveTab('messages');
          handleSend(transcript);
        }
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, []);

  const startListening = () => {
    if (recognitionRef.current) {
      setIsListening(true);
      recognitionRef.current.start();
    } else {
      alert("Speech recognition not supported in this browser.");
    }
  };

  const handleSend = async (customMsg = null) => {
    const textToSend = typeof customMsg === 'string' ? customMsg : message;
    if (!textToSend.trim()) return;

    const userMsg = { role: 'user', text: textToSend };
    setChatHistory((prev) => [...prev, userMsg]);
    if (typeof customMsg !== 'string') setMessage('');
    setIsLoading(true);

    try {
      const response = await request.post({
        entity: 'assistant/query',
        jsonData: { message: userMsg.text },
      });

      if (response.success) {
        setChatHistory((prev) => [...prev, { role: 'ai', text: response.result }]);
      } else {
        setChatHistory((prev) => [...prev, { role: 'ai', text: 'I encountered an error processing that request.' }]);
      }
    } catch (err) {
      setChatHistory((prev) => [...prev, { role: 'ai', text: 'Service unavailable. Is the AI Service running?' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const topHeader = (
    <div style={{
      background: 'linear-gradient(135deg, #001e2b 0%, #004d40 100%)',
      padding: '24px',
      paddingBottom: '46px',
      color: 'white',
      borderTopLeftRadius: '16px',
      borderTopRightRadius: '16px',
      position: 'relative'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <RobotOutlined style={{ fontSize: 24, color: '#00ed64' }} />
          <strong style={{ fontSize: 18, fontFamily: 'sans-serif' }}>Cognivio AI</strong>
        </div>
        <div>
          <Button type="text" icon={<CloseOutlined style={{ color: 'white' }} />} size="small" onClick={() => setIsOpen(false)} />
        </div>
      </div>
      <div>
        <Title level={3} style={{ color: 'white', margin: 0, fontWeight: 700 }}>Hello Kaleem!</Title>
        <Title level={3} style={{ color: 'white', margin: 0, fontWeight: 700 }}>How can we help?</Title>
      </div>
    </div>
  );

  const homeTab = (
    <div style={{ flex: 1, padding: '0 16px 16px', marginTop: '-30px', position: 'relative', zIndex: 10, overflowY: 'auto', boxSizing: 'border-box' }}>
      <div style={{ background: 'white', borderRadius: '12px', padding: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <div style={{ color: '#00ed64', marginTop: 2 }}>
            <Badge status="success" />
          </div>
          <div>
            <div style={{ fontWeight: 600, color: '#001e2b' }}>System Status: All Good</div>
            <div style={{ fontSize: 12, color: '#687a86' }}>Updated Just Now</div>
          </div>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', padding: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
        <Input.Search 
            placeholder="Search for help..." 
            style={{ marginBottom: 16 }} 
            onSearch={(val) => {
               if(val) {
                 setMessage(val);
                 setActiveTab('messages');
                 setTimeout(() => handleSend(val), 100);
               }
            }}
        />
        
        <div 
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderTop: '1px solid #e8e8e8', cursor: 'pointer' }}
          onClick={() => setActiveTab('messages')}
        >
          <Text strong style={{ color: '#00684a' }}>Ask the AI Assistant</Text>
          <RightOutlined style={{ color: '#00684a' }} />
        </div>
      </div>
    </div>
  );

  const messagesTab = (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, background: '#f9f9fb', height: 0 }}>
      <div
        ref={scrollRef}
        style={{ flex: 1, overflowY: 'auto', padding: '16px', paddingBottom: '20px' }}
      >
        <List
          dataSource={chatHistory}
          renderItem={(item) => (
            <div style={{ display: 'flex', marginBottom: 16, justifyContent: item.role === 'ai' ? 'flex-start' : 'flex-end' }}>
              {item.role === 'ai' && (
                <Avatar icon={<RobotOutlined />} style={{ backgroundColor: '#001e2b', marginRight: 8, flexShrink: 0 }} />
              )}
              <div style={{ 
                maxWidth: '75%', 
                padding: '12px 16px', 
                borderRadius: '16px',
                borderBottomLeftRadius: item.role === 'ai' ? 4 : 16,
                borderBottomRightRadius: item.role === 'user' ? 4 : 16,
                background: item.role === 'ai' ? 'white' : '#001e2b',
                color: item.role === 'ai' ? '#001e2b' : 'white',
                boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
                fontSize: '14px',
                lineHeight: '1.5',
                whiteSpace: 'pre-line'
              }}>
                {item.text}
              </div>
            </div>
          )}
        />
        {isLoading && <div style={{ fontSize: '12px', color: '#888', marginLeft: 40 }}>AI is typing...</div>}
      </div>
      <div style={{ padding: '12px', background: 'white', borderTop: '1px solid #eee' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <Input
            placeholder={isListening ? "Listening..." : "Ask me anything..."}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onPressEnter={() => handleSend(null)}
            disabled={isLoading}
            style={{ borderRadius: '20px', background: isListening ? '#e6f7ff' : '#f5f5f5', border: 'none', padding: '8px 16px' }}
            suffix={
              <AudioOutlined 
                onClick={startListening} 
                style={{ 
                  fontSize: 18, 
                  color: isListening ? '#1890ff' : '#888', 
                  cursor: 'pointer',
                  animation: isListening ? 'pulse 1.5s infinite' : 'none'
                }} 
              />
            }
          />
          <Button 
            type="primary" 
            shape="circle" 
            icon={<SendOutlined />} 
            onClick={() => handleSend(null)} 
            loading={isLoading} 
            style={{ background: '#00ed64', borderColor: '#00ed64', color: '#001e2b' }}
          />
        </div>
      </div>
    </div>
  );

  const helpTab = (
    <div style={{ padding: '24px', textAlign: 'center', overflowY: 'auto', flex: 1, boxSizing: 'border-box' }}>
      <Title level={4}>How to use Cognivio AI</Title>
      <Text type="secondary">The AI Assistant uses Machine Learning to understand your questions about the ERP.</Text>
      <Divider />
      <div style={{ textAlign: 'left' }}>
        <Text strong>Click a question to try:</Text>
        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {["Show me sales revenue", "Which product has highest sales?", "What items are out of stock?", "Total utility bill paid", "Employee attendance summary"].map((q, idx) => (
            <div 
              key={idx} 
              style={{ 
                padding: '10px 14px', 
                background: '#e6f7ff', 
                border: '1px solid #91d5ff',
                borderRadius: '8px', 
                cursor: 'pointer',
                color: '#0050b3',
                fontSize: '13px',
                fontWeight: 500,
                transition: 'all 0.2s',
                textAlign: 'left'
              }}
              onClick={() => {
                setMessage(''); // clear pending typed string
                setActiveTab('messages');
                setTimeout(() => handleSend(q), 50);
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#bae7ff'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#e6f7ff'}
            >
              "{q}"
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ position: 'fixed', bottom: 30, right: 30, zIndex: 9999 }}>
      <style>
        {`
          @keyframes pulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.2); opacity: 0.7; }
            100% { transform: scale(1); opacity: 1; }
          }
        `}
      </style>
      {isOpen ? (
        <div style={{ 
          width: 380, 
          height: 600, 
          background: '#f9f9fb', 
          borderRadius: 16, 
          boxShadow: '0 12px 40px rgba(0,0,0,0.2)', 
          display: 'flex', 
          flexDirection: 'column', 
          overflow: 'hidden' 
        }}>
          <div style={{ height: 536, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {activeTab === 'home' && (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                {topHeader}
                {homeTab}
              </div>
            )}
            {activeTab === 'messages' && (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                 <div style={{ background: '#001e2b', padding: '16px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                   <div style={{ fontWeight: 600, fontSize: 16 }}>Cognivio AI Chat</div>
                   <Button type="text" icon={<CloseOutlined style={{ color: 'white' }} />} size="small" onClick={() => setIsOpen(false)} />
                 </div>
                 {messagesTab}
              </div>
            )}
            {activeTab === 'help' && (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                {topHeader}
                {helpTab}
              </div>
            )}
          </div>

          <div style={{ 
            height: 64, 
            background: 'white', 
            borderTop: '1px solid #e0e0e0', 
            display: 'flex', 
            justifyContent: 'space-around', 
            alignItems: 'center',
            padding: '0 10px',
            position: 'relative',
            zIndex: 20
          }}>
            <div 
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: activeTab === 'home' ? '#00684a' : '#888', cursor: 'pointer' }}
              onClick={() => setActiveTab('home')}
            >
              <HomeOutlined style={{ fontSize: 20, marginBottom: 4 }} />
              <span style={{ fontSize: 10, fontWeight: 600 }}>Home</span>
            </div>
            <div 
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: activeTab === 'messages' ? '#00684a' : '#888', cursor: 'pointer' }}
              onClick={() => setActiveTab('messages')}
            >
              <MessageOutlined style={{ fontSize: 20, marginBottom: 4 }} />
              <span style={{ fontSize: 10, fontWeight: 600 }}>Messages</span>
            </div>
            <div 
               style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: activeTab === 'help' ? '#00684a' : '#888', cursor: 'pointer' }}
               onClick={() => setActiveTab('help')}
            >
              <QuestionCircleOutlined style={{ fontSize: 20, marginBottom: 4 }} />
              <span style={{ fontSize: 10, fontWeight: 600 }}>Help</span>
            </div>
          </div>
        </div>
      ) : (
        <Badge dot color="#00ed64" style={{ width: 14, height: 14 }}>
            <Button
              type="primary"
              shape="circle"
              size="large"
              onClick={() => setIsOpen(true)}
              style={{ 
                width: 65, 
                height: 65, 
                background: '#001e2b', 
                borderColor: '#001e2b',
                boxShadow: '0 8px 24px rgba(0, 30, 43, 0.4)' 
              }}
            >
               <RobotOutlined style={{ fontSize: 30, color: '#00ed64' }} />
            </Button>
        </Badge>
      )}
    </div>
  );
};

export default AssistantWidget;
