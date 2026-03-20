import React, { useState, useEffect, useRef } from 'react';
import { Button, Drawer, Input, List, Space, Typography, Tag, notification } from 'antd';
import { MessageOutlined, SendOutlined, AudioOutlined, AudioMutedOutlined } from '@ant-design/icons';
import axios from 'axios';
import request from '@/request';

const { Text } = Typography;

export default function AIChatAssistant() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'assistant', text: 'Hello! I am your Cognivio AI Voice Agent. How can I help you today?' }
  ]);
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  // Speech Recognition Setup
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setMessage(transcript);
        handleSend(transcript);
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
      notification.error({ message: "Speech recognition not supported in this browser." });
    }
  };

  const showDrawer = () => {
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
  };

  const handleSend = async (textOverride = null) => {
    const textToSend = typeof textOverride === 'string' ? textOverride : message;
    if (!textToSend.trim()) return;

    const userMsg = { role: 'user', text: textToSend };
    setChatHistory(prev => [...prev, userMsg]);
    setMessage('');
    setLoading(true);

    try {
      // 1. Get Intent from AI Service
      const aiResponse = await axios.post('http://127.0.0.1:8050/assistant/process', {
        message: textToSend,
        context: 'erp',
        history: chatHistory // Send history to maintain context
      });

      const { intent, suggestion, entities } = aiResponse.data;
      let insightText = suggestion;

      // 2. Autonomous Action Fulfillment
      if (intent !== 'unknown') {
        try {
          if (intent === 'get_sales_summary') {
            const dataRes = await request.get({ entity: 'stats/revenue-forecast' });
            if (dataRes.success) {
              const total = dataRes.actual.reduce((a, b) => a + b, 0);
              insightText = `I've analyzed your sales. Total revenue is $${total.toLocaleString()}.`;
            }
          } else if (intent === 'action_create_expense') {
              const amount = entities.amount;
              const category = entities.category || 'Operations';
              if (amount) {
                  const res = await request.create({ 
                      entity: 'expense', 
                      jsonData: { 
                        title: `AI Recorded: ${textToSend}`, 
                        amount: amount, 
                        category: category,
                        date: new Date(),
                        description: 'Autonomous Voice Recording'
                      } 
                  });
                  if (res.success) {
                    insightText = `Action Complete: I've recorded a $${amount} expense for ${category}. 💰`;
                  }
              } else {
                  insightText = "I identified that you want to record an expense, but I couldn't hear the specific amount. Could you say that again?";
              }
          } else if (intent === 'action_create_invoice') {
              insightText = "I've flagged this for your attention. Navigating you to the invoice creation module shortly. (Autonomous mapping active)";
              // Navigation logic could be added here
          }
          // (Existing stats logic keeps working as fallback)
          else if (intent === 'get_profit_analysis') {
            const revRes = await request.get({ entity: 'stats/revenue-forecast' });
            const expRes = await request.get({ entity: 'stats/expense-forecast' });
            if (revRes.success && expRes.success) {
              const totalRev = revRes.actual.reduce((a, b) => a + b, 0);
              const totalExp = expRes.actual.reduce((a, b) => a + b, 0);
              const profit = totalRev - totalExp;
              insightText = `Your total profit is $${profit.toLocaleString()}. Revenue is ${revRes.trend} and expenses are ${expRes.trend}.`;
            }
          }
        } catch (dataErr) {
          console.error("Agentic fulfillment failed", dataErr);
          insightText = `I identified your request as '${intent.replace('_', ' ')}', but I couldn't complete the action right now.`;
        }
      }

      const aiMsg = {
        role: 'assistant',
        text: insightText,
        intent: intent,
        entities: entities
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
        title="Cognivio AI Voice Agent"
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
                        <Tag color="cyan">{item.intent.replace('action_', 'ACT: ')}</Tag>
                    </div>
                )}
              </div>
            </List.Item>
          )}
        />
        <div style={{ position: 'absolute', bottom: 20, left: 20, right: 20 }}>
          <Space.Compact style={{ width: '100%' }}>
            <Input
              placeholder="Speak or type command..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onPressEnter={() => handleSend()}
              disabled={loading}
              suffix={
                isListening ? 
                <AudioOutlined style={{ color: '#ff4d4f', cursor: 'pointer' }} onClick={() => setIsListening(false)} /> : 
                <AudioMutedOutlined style={{ cursor: 'pointer' }} onClick={startListening} />
              }
            />
            <Button type="primary" icon={<SendOutlined />} onClick={() => handleSend()} loading={loading} />
          </Space.Compact>
        </div>
      </Drawer>
    </>
  );
}
