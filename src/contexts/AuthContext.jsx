import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      const tokenExpiresAt = localStorage.getItem('tokenExpiresAt');
      const storedUser = localStorage.getItem('user');
      
      if (token && tokenExpiresAt) {
        const now = new Date().getTime();
        const expiresAt = parseInt(tokenExpiresAt);
        
        // Check if token is still valid
        if (now < expiresAt) {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Try to get fresh user data, fall back to stored data if server is unreachable
          try {
            const response = await api.get('/auth/me');
            setUser(response.data);
          } catch (serverError) {
            // If server request fails but token is still valid, use stored user data
            if (storedUser) {
              setUser(JSON.parse(storedUser));
              console.log('Using cached user data - server unreachable');
            }
          }
        } else {
          // Token expired, clear storage
          localStorage.removeItem('token');
          localStorage.removeItem('tokenExpiresAt');
          localStorage.removeItem('user');
          delete api.defaults.headers.common['Authorization'];
          toast.info('Your session has expired. Please log in again.');
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('tokenExpiresAt');
      localStorage.removeItem('user');
      delete api.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      console.log('🔐 Attempting login for:', email);
      console.log('🌐 API Base URL:', api.defaults.baseURL);
      
      const response = await api.post('/auth/login', { email, password });
      console.log('✅ Login response received:', response.status);
      const { token, user } = response.data;
      
      // Store token with expiration timestamp
      const expiresAt = new Date().getTime() + (24 * 60 * 60 * 1000); // 24 hours from now
      localStorage.setItem('token', token);
      localStorage.setItem('tokenExpiresAt', expiresAt.toString());
      localStorage.setItem('user', JSON.stringify(user));
      
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      
      console.log('✅ Login successful for user:', user.username, 'Role:', user.role);
      toast.success('Login successful! You will stay logged in for 24 hours.');
      // Return the logged-in user so callers can redirect based on role
      return { success: true, user };
    } catch (error) {
      console.error('❌ Login error:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      console.error('❌ Network error:', error.message);
      
      let message = 'Login failed';
      
      if (error.response) {
        // Server responded with error status
        message = error.response.data?.message || `Server error: ${error.response.status}`;
      } else if (error.request) {
        // Request was made but no response received
        message = 'Cannot connect to server. Please check if the backend is running on port 5000.';
        console.error('❌ No response from server. Backend might not be running.');
      } else {
        // Something else happened
        message = error.message || 'Unknown error occurred';
      }
      
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      const { token, user } = response.data;
      
      // Store token with expiration timestamp
      const expiresAt = new Date().getTime() + (24 * 60 * 60 * 1000); // 24 hours from now
      localStorage.setItem('token', token);
      localStorage.setItem('tokenExpiresAt', expiresAt.toString());
      localStorage.setItem('user', JSON.stringify(user));
      
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      
      toast.success('Registration successful! You will stay logged in for 24 hours.');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('tokenExpiresAt');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    toast.success('Logged out successfully');
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await api.put('/auth/profile', profileData);
      setUser(response.data.user);
      toast.success('Profile updated successfully!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Profile update failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
