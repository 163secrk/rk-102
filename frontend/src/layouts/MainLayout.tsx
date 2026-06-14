import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Dropdown, Avatar, Badge, Button } from 'tdesign-react';
import {
  DashboardIcon, UserIcon, SettingsIcon, CloseIcon,
  NotificationIcon, HelpCircleIcon, SearchIcon,
} from 'tdesign-icons-react';
import { useAuthStore } from '@/store/authStore';
import './MainLayout.less';

const { Header, Sider, Content } = Layout;

const menuIcons: Record<string, JSX.Element> = {
  '/dashboard': <DashboardIcon />,
  '/breeders': <UserIcon />,
  '/organisms': <span style={{ fontSize: '16px' }}>🌿</span>,
  '/pedigree': <span style={{ fontSize: '16px' }}>🌳</span>,
  '/trace': <span style={{ fontSize: '16px' }}>🔳</span>,
  '/health': <span style={{ fontSize: '16px' }}>💚</span>,
  '/ownership': <span style={{ fontSize: '16px' }}>🔄</span>,
  '/alerts': <span style={{ fontSize: '16px' }}>⏰</span>,
  '/settings': <SettingsIcon />,
};

export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const menuItems = [
    { value: '/dashboard', label: '控制台', icon: menuIcons['/dashboard'] },
    { value: '/breeders', label: '育种者认证', icon: menuIcons['/breeders'] },
    { value: '/organisms', label: '数字档案', icon: menuIcons['/organisms'] },
    { value: '/pedigree', label: '谱系树', icon: menuIcons['/pedigree'] },
    { value: '/trace', label: '溯源二维码', icon: menuIcons['/trace'] },
    { value: '/health', label: '健康日志', icon: menuIcons['/health'] },
    { value: '/ownership', label: '所有权转移', icon: menuIcons['/ownership'] },
    { value: '/alerts', label: '预警调度', icon: menuIcons['/alerts'] },
    { value: '/settings', label: '系统设置', icon: menuIcons['/settings'] },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <Layout className="main-layout">
      <Header className="main-header">
        <div className="header-left">
          <div className="logo-mini">
            <svg viewBox="0 0 64 64" width="28" height="28">
              <defs>
                <linearGradient id="hlogo" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#e8c547" />
                  <stop offset="100%" stopColor="#8b6914" />
                </linearGradient>
              </defs>
              <path d="M32 10 C22 22, 16 32, 32 54 C48 32, 42 22, 32 10 Z" fill="url(#hlogo)" />
              <circle cx="32" cy="34" r="4" fill="#0a0f1f" />
            </svg>
            <span className="gold-gradient-text logo-text">灵脉 SpiritLink</span>
          </div>
        </div>
        <div className="header-center">
          <div className="search-box">
            <SearchIcon size="18" />
            <input placeholder="搜索个体、谱系、档案..." />
          </div>
        </div>
        <div className="header-right">
          <Button theme="default" variant="text" icon={<HelpCircleIcon />} />
          <Badge count={3} dot>
            <Button theme="default" variant="text" icon={<NotificationIcon />} />
          </Badge>
          <Dropdown
            options={[
              { content: '个人中心', value: 'profile', prefixIcon: <UserIcon /> },
              { content: '系统设置', value: 'settings', prefixIcon: <SettingsIcon /> },
              { content: '退出登录', value: 'logout', prefixIcon: <CloseIcon />, theme: 'danger' },
            ]}
            onClick={(v) => {
              if (v.value === 'logout') handleLogout();
              if (v.value === 'settings') navigate('/settings');
            }}
          >
            <div className="user-menu">
              <Avatar size="small" image={user?.avatar}>
                {user?.nickname?.[0] || user?.username?.[0]}
              </Avatar>
              <div className="user-meta">
                <span className="user-name">{user?.nickname || user?.username}</span>
                <span className="user-role">{formatRole(user?.role)}</span>
              </div>
            </div>
          </Dropdown>
        </div>
      </Header>

      <Layout>
        <Sider className="main-sider" width={232}>
          <Menu
            value={location.pathname}
            theme="light"
            style={{ background: 'transparent', border: 'none' }}
            onChange={(v) => navigate(String(v))}
            options={menuItems}
          />
        </Sider>
        <Content className="main-content">
          <div className="content-inner fade-in-up">
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}

function formatRole(role?: string) {
  const map: Record<string, string> = {
    super_admin: '超级管理员',
    admin: '管理员',
    breeder: '育种者',
    owner: '所有者',
    verifier: '认证员',
    guest: '访客',
  };
  return map[role || 'guest'] || '访客';
}
