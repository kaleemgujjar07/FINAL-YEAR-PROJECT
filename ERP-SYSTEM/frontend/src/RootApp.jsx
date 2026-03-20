import './style/app.css';

import { Suspense, lazy } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from '@/redux/store';
import PageLoader from '@/components/PageLoader';

const CognivioOs = lazy(() => import('./apps/CognivioOs'));

export default function RoutApp() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Provider store={store}>
        <Suspense fallback={<PageLoader />}>
          <CognivioOs />
        </Suspense>
      </Provider>
    </BrowserRouter>
  );
}
