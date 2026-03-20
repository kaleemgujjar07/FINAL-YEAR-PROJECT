import React from 'react';
import AssistantWidget from '@/components/AssistantWidget';

import { Layout } from 'antd';

const { Content } = Layout;

export default function DashboardLayout({ children }) {
  return (
    <div
      style={{
        marginLeft: 140,
      }}
    >
      {children}
      <AssistantWidget />
    </div>
  );
}
