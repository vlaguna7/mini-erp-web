import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface PDVLayoutProps {
  children: React.ReactNode;
  isInitializing: boolean;
}

export const PDVLayout: React.FC<PDVLayoutProps> = ({
  children,
  isInitializing,
}) => {
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = 'auto';
      document.documentElement.style.overflow = 'auto';
    };
  }, []);

  if (isInitializing) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          color: '#666',
          backgroundColor: '#f8fafc',
        }}
      >
        Carregando PDV...
      </div>
    );
  }

  if (!user) return <Navigate to="/login" />;

  return <div style={{ width: '100%', height: '100vh' }}>{children}</div>;
};
