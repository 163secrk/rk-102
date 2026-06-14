import { useEffect, ReactNode, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loading } from 'tdesign-react';
import { useAuthStore } from '@/store/authStore';

interface Props {
  children: ReactNode;
  roles?: string[];
}

export default function RequireAuth({ children, roles }: Props) {
  const { token, user, fetchProfile, initialized, setInitialized } = useAuthStore();
  const location = useLocation();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const init = async () => {
      if (token && !initialized) {
        await fetchProfile();
      }
      setInitialized(true);
      setChecking(false);
    };
    init();
  }, [token, initialized, fetchProfile, setInitialized]);

  if (checking) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
      }}>
        <Loading size="large" loading text="系统初始化中..." />
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
