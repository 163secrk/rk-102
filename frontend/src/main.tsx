import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'tdesign-react';
import zhConfig from 'tdesign-react/es/locale/zh_CN';
import App from './App';
import './styles/global.less';

const darkTheme = {
  ...zhConfig,
  classPrefix: 't',
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider globalConfig={darkTheme}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ConfigProvider>
  </React.StrictMode>,
);
