import { ErpContextProvider } from '@/context/erp';
import AssistantWidget from '@/components/AssistantWidget';

import { Layout } from 'antd';
import { useSelector } from 'react-redux';

const { Content } = Layout;

export default function ErpLayout({ children }) {
  return (
    <ErpContextProvider>
      <Content
        className="whiteBox shadow layoutPadding"
        style={{
          margin: '30px auto',
          width: '100%',
          maxWidth: '1100px',
          minHeight: '600px',
        }}
      >
        {children}
      </Content>
      <AssistantWidget />
    </ErpContextProvider>
  );
}
