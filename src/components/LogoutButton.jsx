import React from 'react';
import { Button } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const LogoutButton = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Button variant="danger" onClick={handleLogout}>
      Logout
    </Button>
  );
};

export default LogoutButton;
