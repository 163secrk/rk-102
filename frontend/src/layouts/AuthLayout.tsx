import { Outlet, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import './AuthLayout.less';

export default function AuthLayout() {
  const navigate = useNavigate();
  const { token } = useAuthStore();

  useEffect(() => {
    if (token) {
      navigate('/dashboard', { replace: true });
    }
  }, [token, navigate]);

  return (
    <div className="auth-layout">
      <div className="auth-bg-decoration">
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />
        <div className="bg-orb bg-orb-3" />
        <div className="grid-overlay" />
      </div>
      <div className="auth-container">
        <div className="auth-brand fade-in-up">
          <div className="logo-wrapper pulse-gold">
            <div className="logo-ring" />
            <div className="logo-inner">
              <svg viewBox="0 0 64 64" width="52" height="52">
                <defs>
                  <linearGradient id="glogo" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#e8c547" />
                    <stop offset="100%" stopColor="#8b6914" />
                  </linearGradient>
                </defs>
                <path d="M32 10 C22 22, 16 32, 32 54 C48 32, 42 22, 32 10 Z" fill="url(#glogo)" opacity="0.9" />
                <circle cx="32" cy="34" r="5" fill="#0a0f1f" stroke="url(#glogo)" strokeWidth="1.5" />
                <path d="M32 22 L32 15 M25 26 L19 22 M39 26 L45 22" stroke="url(#glogo)" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
          </div>
          <h1 className="brand-title">
            <span className="gold-gradient-text">灵脉 SpiritLink</span>
          </h1>
          <p className="brand-subtitle">珍稀绿植宠物谱系与溯源系统</p>
          <div className="brand-tags">
            <span className="tag">谱系追溯</span>
            <span className="tag">智能溯源</span>
            <span className="tag">数字档案</span>
            <span className="tag">确权存证</span>
          </div>
        </div>
        <div className="auth-form-wrapper fade-in-up">
          <Outlet />
        </div>
      </div>
      <footer className="auth-footer">
        <p>© {new Date().getFullYear()} SpiritLink · 灵脉 · 让每一株生命都有迹可循</p>
      </footer>
    </div>
  );
}
