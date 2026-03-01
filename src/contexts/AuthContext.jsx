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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshQueue, setRefreshQueue] = useState([]);

  useEffect(() => {
    // Set axios default authorization header if token exists
    if (accessToken) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    }

    // Request interceptor - handles refresh token queue
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        // If we're not refreshing and there's a token, set the auth header
        if (!isRefreshing && accessToken) {
          config.headers['Authorization'] = `Bearer ${accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - handles token refresh
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // If we get a 401 and haven't tried to refresh yet
        if (error.response?.status === 401 && !originalRequest._retry && refreshToken) {
          originalRequest._retry = true;

          if (!isRefreshing) {
            setIsRefreshing(true);
            
            try {
              // Attempt to refresh token
              const response = await axios.post('https://brjobsedu.com/girls_course/girls_course_backend/api/refresh-token/', {
                refresh: refreshToken
              });

              const newAccessToken = response.data.access;
              setAccessToken(newAccessToken);
              sessionStorage.setItem('accessToken', newAccessToken);
              axios.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;

              // Resolve all queued requests
              refreshQueue.forEach(callback => callback(newAccessToken));
              setRefreshQueue([]);
              setIsRefreshing(false);

              // Retry original request with new token
              originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
              return axios(originalRequest);

            } catch (refreshError) {
              console.error('Refresh token failed:', refreshError);
              logout();
              return Promise.reject(refreshError);
            }
          } else {
            // If already refreshing, queue the request
            return new Promise((resolve) => {
              setRefreshQueue(prev => [...prev, (token) => {
                originalRequest.headers['Authorization'] = `Bearer ${token}`;
                resolve(axios(originalRequest));
              }]);
            });
          }
        }

        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [accessToken, refreshToken, isRefreshing, refreshQueue]);

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

  // API endpoints
  const apiEndpoints = {
    studentEnrollment: 'https://brjobsedu.com/girls_course/girls_course_backend/api/student-entrollment/',
    courseModule: 'https://brjobsedu.com/girls_course/girls_course_backend/api/course-module/'
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
      refreshAccessToken,
      apiEndpoints
    }}>
      {children}
    </AuthContext.Provider>
  );
};
