import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import axios from 'axios';

const AuthContext = createContext();

// Token configuration - times in milliseconds
// Access token expiry: 15 minutes
const ACCESS_TOKEN_EXPIRY_MS = 15 * 60 * 1000;
// Refresh token expiry: 7 days
const REFRESH_TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000;

// Create a separate axios instance for refresh token (without interceptors)
const refreshAxios = axios.create();

// Helper function to decode JWT
const decodeToken = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
};

// Helper function to check if token is expired
const isTokenExpired = (token) => {
  if (!token) return true;
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;
  
  // Add 60 second buffer to refresh before actual expiration
  const expirationTime = (decoded.exp * 1000) - 60000;
  return Date.now() >= expirationTime;
};

// Helper function to get token expiration info for debugging
export const getTokenExpirationInfo = (token) => {
  if (!token) return { expired: true, reason: 'No token' };
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return { expired: true, reason: 'Cannot decode token' };
  
  const expirationTime = decoded.exp * 1000;
  const now = Date.now();
  const timeLeft = expirationTime - now;
  
  return {
    expired: timeLeft < 60000, // Less than 60 seconds
    expiresAt: new Date(expirationTime).toISOString(),
    expiresIn: Math.floor(timeLeft / 1000) + 's',
    timeLeftMs: timeLeft
  };
};

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
  const [userRoleType, setUserRoleType] = useState(() => sessionStorage.getItem('userRoleType'));
  const [accessToken, setAccessToken] = useState(() => sessionStorage.getItem('accessToken'));
  const [refreshToken, setRefreshToken] = useState(() => sessionStorage.getItem('refreshToken'));
  const [uniqueId, setUniqueId] = useState(() => sessionStorage.getItem('uniqueId'));
  const [profilePhoto, setProfilePhoto] = useState(null);
  
  // Use refs to manage refresh state (non-state so it works properly in callbacks)
  const isRefreshingRef = useRef(false);
  const refreshQueueRef = useRef([]);
  const refreshTimeoutRef = useRef(null);
  const accessTokenRef = useRef(accessToken);
  const refreshTokenRef = useRef(refreshToken);

  // Update refs when tokens change
  useEffect(() => {
    accessTokenRef.current = accessToken;
  }, [accessToken]);

  useEffect(() => {
    refreshTokenRef.current = refreshToken;
  }, [refreshToken]);

  // Check if tokens are expired on mount or when they change
  useEffect(() => {
    if (accessToken && isTokenExpired(accessToken)) {
      if (refreshToken && !isTokenExpired(refreshToken)) {
        // Refresh token is still valid, try to refresh
        proactiveRefreshToken(refreshToken);
      } else if (refreshToken && isTokenExpired(refreshToken)) {
        // Both tokens are expired, logout
        logoutUser();
      }
    }
  }, []);

  // Proactive token refresh function
  const proactiveRefreshToken = async (currentRefreshToken) => {
    if (!currentRefreshToken || isRefreshingRef.current) {
      return null;
    }

    // Check if refresh token itself is expired
    const refreshExpInfo = getTokenExpirationInfo(currentRefreshToken);
    if (refreshExpInfo.expired) {
      logoutUser();
      return null;
    }
    
    try {
      isRefreshingRef.current = true;
      
      // Use refreshAxios (without interceptors) to avoid infinite loops
      const response = await refreshAxios.post('https://brjobsedu.com/girls_course/girls_course_backend/api/refresh-token/', {
        refresh: currentRefreshToken
      }, {
        timeout: 5000 // 5 second timeout
      });

      const newAccessToken = response.data.access;
      
      // Update state and storage
      setAccessToken(newAccessToken);
      accessTokenRef.current = newAccessToken;
      sessionStorage.setItem('accessToken', newAccessToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;

      // Process queued requests
      const queue = refreshQueueRef.current;
      refreshQueueRef.current = [];
      
      queue.forEach(callback => {
        try {
          callback(newAccessToken);
        } catch (err) {
          // Silently handle queued request errors
        }
      });

      isRefreshingRef.current = false;
      return newAccessToken;

    } catch (error) {
      isRefreshingRef.current = false;
      
      // If refresh fails, logout
      logoutUser();
      return null;
    }
  };

  // Logout function (separate from provider to use in effects)
  const logoutUser = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    setUserRoleType(null);
    setAccessToken(null);
    setRefreshToken(null);
    setUniqueId(null);
    accessTokenRef.current = null;
    refreshTokenRef.current = null;
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');
    sessionStorage.removeItem('userRole');
    sessionStorage.removeItem('userRoleType');
    sessionStorage.removeItem('uniqueId');
    delete axios.defaults.headers.common['Authorization'];
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }
  };

  // Set up token refresh scheduling and axios interceptors
  useEffect(() => {
    // Set axios default authorization header if token exists
    if (accessToken) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    }

    // Schedule proactive token refresh
    if (accessToken && refreshToken && !isTokenExpired(accessToken)) {
      const decoded = decodeToken(accessToken);
      if (decoded && decoded.exp) {
        // Refresh 60 seconds before expiration
        const timeUntilRefresh = (decoded.exp * 1000) - Date.now() - 60000;
        
        if (refreshTimeoutRef.current) {
          clearTimeout(refreshTimeoutRef.current);
        }
        
        if (timeUntilRefresh > 0) {
          refreshTimeoutRef.current = setTimeout(() => {
            proactiveRefreshToken(refreshTokenRef.current);
          }, timeUntilRefresh);
        } else if (timeUntilRefresh <= 0 && timeUntilRefresh > -60000) {
          // Token is expiring within next minute, refresh immediately
          proactiveRefreshToken(refreshTokenRef.current);
        }
      }
    }

    // Request interceptor
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        // Check if both tokens are expired
        if (accessTokenRef.current && isTokenExpired(accessTokenRef.current) && 
            refreshTokenRef.current && isTokenExpired(refreshTokenRef.current)) {
          logoutUser();
          return Promise.reject(new Error('Token session expired. Please login again.'));
        }

        // Always use the latest access token
        if (accessTokenRef.current) {
          config.headers['Authorization'] = `Bearer ${accessTokenRef.current}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - handles 401 errors with token refresh
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // If we get a 401 and haven't tried to refresh yet
        if (error.response?.status === 401 && !originalRequest._retry && refreshTokenRef.current) {
          originalRequest._retry = true;

          // Check if refresh token is also expired
          const refreshExpInfo = getTokenExpirationInfo(refreshTokenRef.current);
          if (refreshExpInfo.expired) {
            logoutUser();
            return Promise.reject(error);
          }

          if (!isRefreshingRef.current) {
            // Start refresh process
            const newToken = await proactiveRefreshToken(refreshTokenRef.current);
            
            if (newToken) {
              // Retry original request with new token
              originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
              return axios(originalRequest);
            } else {
              // Refresh failed, reject with 401
              return Promise.reject(error);
            }
          } else {
            // If already refreshing, queue the request
            return new Promise((resolve, reject) => {
              refreshQueueRef.current.push((token) => {
                originalRequest.headers['Authorization'] = `Bearer ${token}`;
                resolve(axios(originalRequest));
              });
            });
          }
        }

        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []);

  const login = (responseData) => {
    const { access, refresh, role, unique_id } = responseData;
    setIsAuthenticated(true);
    setUserRole(role);
    setUserRoleType(role); // Store the role type (admin, student, student-unpaid)
    setAccessToken(access);
    setRefreshToken(refresh);
    setUniqueId(unique_id);
    
    // Update refs immediately
    accessTokenRef.current = access;
    refreshTokenRef.current = refresh;

    // Store tokens in session storage
    sessionStorage.setItem('accessToken', access);
    sessionStorage.setItem('refreshToken', refresh);
    sessionStorage.setItem('userRole', role);
    sessionStorage.setItem('userRoleType', role);
    sessionStorage.setItem('uniqueId', unique_id);

    // Set axios default authorization header
    axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;
  };

  const logout = () => {
    logoutUser();
  };

  const refreshAccessToken = async () => {
    if (!refreshTokenRef.current) {
      return null;
    }
    
    return proactiveRefreshToken(refreshTokenRef.current);
  };

  const updateProfilePhoto = (photoUrl) => {
    setProfilePhoto(photoUrl);
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      userRole, 
      userRoleType,
      accessToken, 
      refreshToken,
      uniqueId,
      login, 
      logout,
      refreshAccessToken,
      profilePhoto,
      updateProfilePhoto
    }}>
      {children}
    </AuthContext.Provider>
  );
};
