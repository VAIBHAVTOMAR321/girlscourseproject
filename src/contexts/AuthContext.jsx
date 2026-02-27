import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  // Initialize state from session storage directly to avoid flicker
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const storedAccessToken = sessionStorage.getItem('accessToken');
    const storedRefreshToken = sessionStorage.getItem('refreshToken');
    return !!storedAccessToken && !!storedRefreshToken;
  });
  
  const [userRole, setUserRole] = useState(() => sessionStorage.getItem('userRole'));
  const [accessToken, setAccessToken] = useState(() => sessionStorage.getItem('accessToken'));
  const [refreshToken, setRefreshToken] = useState(() => sessionStorage.getItem('refreshToken'));
  const [uniqueId, setUniqueId] = useState(() => sessionStorage.getItem('uniqueId'));

  useEffect(() => {
    // Set axios default authorization header if token exists
    if (accessToken) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    }
  }, [accessToken]);

  const login = (responseData) => {
    const { access, refresh, role, unique_id } = responseData;
    setIsAuthenticated(true);
    setUserRole(role);
    setAccessToken(access);
    setRefreshToken(refresh);
    setUniqueId(unique_id);

    // Store tokens in session storage
    sessionStorage.setItem('accessToken', access);
    sessionStorage.setItem('refreshToken', refresh);
    sessionStorage.setItem('userRole', role);
    sessionStorage.setItem('uniqueId', unique_id);

    // Set axios default authorization header
    axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    setAccessToken(null);
    setRefreshToken(null);
    setUniqueId(null);

    // Remove tokens from session storage
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');
    sessionStorage.removeItem('userRole');
    sessionStorage.removeItem('uniqueId');

    // Remove axios authorization header
    delete axios.defaults.headers.common['Authorization'];
  };

  const refreshAccessToken = async () => {
    try {
      const response = await axios.post('https://brjobsedu.com/girls_course/girls_course_backend/api/refresh-token/', {
        refresh: refreshToken
      });

      const newAccessToken = response.data.access;
      setAccessToken(newAccessToken);
      sessionStorage.setItem('accessToken', newAccessToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
      
      return newAccessToken;
    } catch (error) {
      console.error('Refresh token failed:', error);
      logout();
      return null;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      userRole, 
      accessToken, 
      refreshToken,
      uniqueId,
      login, 
      logout,
      refreshAccessToken
    }}>
      {children}
    </AuthContext.Provider>
  );
};
