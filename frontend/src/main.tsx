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
    <ConfigProvider globalConfig={darkTheme} designVariable={{
      '--td-brand-color': '#d4af37',
      '--td-brand-color-1': 'rgba(212, 175, 55, 0.05)',
      '--td-brand-color-2': 'rgba(212, 175, 55, 0.15)',
      '--td-brand-color-3': 'rgba(212, 175, 55, 0.25)',
      '--td-brand-color-4': 'rgba(212, 175, 55, 0.4)',
      '--td-brand-color-5': '#d4af37',
      '--td-brand-color-6': '#e8c547',
      '--td-brand-color-7': '#b8962e',
      '--td-brand-color-8': '#8b6914',
      '--td-brand-color-9': '#6b5010',
      '--td-brand-color-10': '#4a360c',
      '--td-text-color-primary': '#e2e8f0',
      '--td-text-color-secondary': '#94a3b8',
      '--td-text-color-placeholder': 'rgba(148, 163, 184, 0.6)',
      '--td-text-color-disabled': 'rgba(148, 163, 184, 0.35)',
      '--td-bg-color-container': 'rgba(30, 41, 59, 0.75)',
      '--td-bg-color-container-hover': 'rgba(51, 65, 85, 0.85)',
      '--td-bg-color-container-active': 'rgba(71, 85, 105, 0.9)',
      '--td-bg-color-container-select': 'rgba(212, 175, 55, 0.1)',
      '--td-bg-color-page': '#0a0f1f',
      '--td-bg-color-layout': '#0d1526',
      '--td-bg-color-mask': 'rgba(0, 0, 0, 0.6)',
      '--td-bg-color-popup': 'rgba(15, 23, 42, 0.95)',
      '--td-border-level-1-color': 'rgba(212, 175, 55, 0.15)',
      '--td-border-level-2-color': 'rgba(212, 175, 55, 0.25)',
      '--td-component-stroke': 'rgba(212, 175, 55, 0.2)',
      '--td-component-border': 'rgba(212, 175, 55, 0.2)',
      '--td-radius-default': '8px',
    }}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ConfigProvider>
  </React.StrictMode>,
);
