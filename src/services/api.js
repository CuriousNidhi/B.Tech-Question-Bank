import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log('401 error - clearing auth and redirecting to login');
      localStorage.removeItem('token');
      localStorage.removeItem('tokenExpiresAt');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getCurrentUser: () => api.get('/auth/me'),
  updateProfile: (userData) => api.put('/auth/profile', userData),
  changePassword: (passwordData) => api.put('/auth/change-password', passwordData),
  logout: () => api.post('/auth/logout'),
};

// Users API
export const usersAPI = {
  getAllUsers: (params) => api.get('/users', { params }),
  getUserById: (id) => api.get(`/users/${id}`),
  updateUser: (id, userData) => api.put(`/users/${id}`, userData),
  searchUsers: (query) => api.get('/users/search', { params: { q: query } }),
};

// Questions API
export const questionsAPI = {
  getAllQuestions: (params) => api.get('/questions', { params }),
  getQuestionById: (id) => api.get(`/questions/${id}`),
  createQuestion: (questionData) => {
    console.log('🚀 Creating question with data:', questionData);
    const formData = new FormData();
    
    // Add text fields
    Object.keys(questionData).forEach(key => {
      if (key !== 'file') {
        formData.append(key, questionData[key]);
        console.log(`📝 Added field: ${key} = ${questionData[key]}`);
      }
    });
    
    // Add file if present
    if (questionData.file) {
      formData.append('file', questionData.file);
      console.log('📎 Added file:', questionData.file.name, 'Size:', questionData.file.size, 'Type:', questionData.file.type);
    }
    
    console.log('📤 Sending FormData to server...');
    return api.post('/questions', formData, {
      headers: {
        // Don't set Content-Type - let browser set it with boundary
        // 'Content-Type': 'multipart/form-data',
      },
    });
  },
  updateQuestion: (id, questionData) => {
    console.log('🔄 Updating question with ID:', id, 'Data:', questionData);
    const formData = new FormData();
    
    // Add text fields
    Object.keys(questionData).forEach(key => {
      if (key !== 'file') {
        formData.append(key, questionData[key]);
      }
    });
    
    // Add file if present
    if (questionData.file) {
      formData.append('file', questionData.file);
      console.log('📎 Added file for update:', questionData.file.name);
    }
    
    return api.put(`/questions/${id}`, formData, {
      headers: {
        // Don't set Content-Type - let browser set it with boundary
        // 'Content-Type': 'multipart/form-data',
      },
    });
  },
  deleteQuestion: (id) => api.delete(`/questions/${id}`),
  downloadQuestion: (id) => api.get(`/questions/${id}/download`, { responseType: 'blob' }),
  verifyQuestion: (id) => api.patch(`/questions/${id}/verify`),
  getQuestionsByUser: (userId, params) => api.get(`/questions/user/${userId}`, { params }),
  getStats: () => api.get('/questions/stats/overview'),
};

export default api;
