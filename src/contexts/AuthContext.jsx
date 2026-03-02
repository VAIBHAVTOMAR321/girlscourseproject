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
              // Also check if a new refresh token is provided
              const newRefreshToken = response.data.refresh || refreshToken;
              
              setAccessToken(newAccessToken);
              setRefreshToken(newRefreshToken);
              sessionStorage.setItem('accessToken', newAccessToken);
              sessionStorage.setItem('refreshToken', newRefreshToken);
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
              // If refresh token is also expired or invalid, log out
              if (refreshError.response?.status === 401) {
                console.log('Refresh token expired, logging out');
                logout();
              }
              setIsRefreshing(false);
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

  // Check token expiration proactively
  const checkTokenExpiration = () => {
    if (!accessToken) return false;
    
    try {
      // Parse JWT token to get expiration time
      const tokenPayload = JSON.parse(atob(accessToken.split('.')[1]));
      const currentTime = Date.now() / 1000;
      
      // If token expires in the next 5 minutes, refresh it
      if (tokenPayload.exp < currentTime + 300) {
        refreshAccessToken();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error parsing token:', error);
      return false;
    }
  };

  const login = (responseData) => {
    const { access, refresh, role, unique_id } = responseData;
    setIsAuthenticated(true);
    setUserRole(role);
    setAccessToken(access);
    setRefreshToken(refresh);
    setUniqueId(uniqueId);

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
    setRefreshQueue([]);

    // Remove tokens from session storage
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');
    sessionStorage.removeItem('userRole');
    sessionStorage.removeItem('uniqueId');

    // Remove axios authorization header
    delete axios.defaults.headers.common['Authorization'];
  };

  const refreshAccessToken = async () => {
    if (!refreshToken) {
      logout();
      return null;
    }

    try {
      const response = await axios.post('https://brjobsedu.com/girls_course/girls_course_backend/api/refresh-token/', {
        refresh: refreshToken
      });

      const newAccessToken = response.data.access;
      // Also check if a new refresh token is provided
      const newRefreshToken = response.data.refresh || refreshToken;
      
      setAccessToken(newAccessToken);
      setRefreshToken(newRefreshToken);
      sessionStorage.setItem('accessToken', newAccessToken);
      sessionStorage.setItem('refreshToken', newRefreshToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
      
      return newAccessToken;
    } catch (error) {
      console.error('Refresh token failed:', error);
      // If refresh token is also expired or invalid, log out
      if (error.response?.status === 401) {
        console.log('Refresh token expired, logging out');
        logout();
      }
      return null;
    }
  };

  // API endpoints
  const apiEndpoints = {
    studentEnrollment: 'https://brjobsedu.com/girls_course/girls_course_backend/api/student-entrollment/',
    courseModule: 'https://brjobsedu.com/girls_course/girls_course_backend/api/course-module/'
  };

  // Check token expiration periodically
  useEffect(() => {
    if (!isAuthenticated || !accessToken) return;
    
    const interval = setInterval(() => {
      checkTokenExpiration();
    }, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, [isAuthenticated, accessToken]);

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
      checkTokenExpiration,
      apiEndpoints
    }}>
      {children}
    </AuthContext.Provider>
  );
};