import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Set up axios defaults
axios.defaults.baseURL = API_BASE_URL;

// Add request interceptor to include token
axios.interceptors.request.use(
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

// Add response interceptor to handle token expiration
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const loginUser = async (email: string, password: string) => {
  try {
    const response = await axios.post('/api/auth/login', {
      email,
      password
    });

    return response.data;
  } catch (error: any) {
    if (error.response?.data?.error?.message) {
      throw new Error(error.response.data.error.message);
    }
    throw new Error('Login failed. Please try again.');
  }
};

export const registerUser = async (
  email: string,
  password: string,
  firstName: string,
  lastName: string
) => {
  try {
    const response = await axios.post('/api/auth/register', {
      email,
      password,
      firstName,
      lastName
    });

    return response.data;
  } catch (error: any) {
    if (error.response?.data?.error?.message) {
      throw new Error(error.response.data.error.message);
    }
    throw new Error('Registration failed. Please try again.');
  }
};

export const getCurrentUser = async () => {
  try {
    const response = await axios.get('/api/auth/profile');
    return response.data.user;
  } catch (error: any) {
    if (error.response?.data?.error?.message) {
      throw new Error(error.response.data.error.message);
    }
    throw new Error('Failed to get user profile.');
  }
};

export const logoutUser = async () => {
  try {
    await axios.post('/api/auth/logout');
  } catch (error) {
    console.error('Logout error:', error);
  }
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('token');
};
