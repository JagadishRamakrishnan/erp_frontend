// API Base Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://crm-be-giqy.onrender.com/api';
// const API_BASE_URL = 'http://localhost:5000/api';

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Helper function to handle API responses
const handleResponse = async (response, type = 'json') => {
  if (type === 'blob') {
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.message || 'Download failed');
    }
    return response.blob();
  }

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }
  
  return data;
};

// Helper function to make API calls
const apiCall = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const responseType = options.responseType || 'json';
  delete options.responseType;
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  return handleResponse(response, responseType);
};

export default apiCall;
