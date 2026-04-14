import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardContent } from 'components/organisms/DashboardContent';
import { clearAuthenticatedSession } from 'lib/auth-session';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuthenticatedSession();
    navigate('/login', { replace: true });
  };

  return <DashboardContent onLogout={handleLogout} />;
};

export default DashboardPage;
