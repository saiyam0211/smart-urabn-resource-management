import axios from "axios";

// Create Axios instance with base API configuration
const api = axios.create({
  baseURL: "/api",
});

// Add authentication token to outgoing requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // Log request configuration errors
    console.error("Request configuration error:", error);
    return Promise.reject(error);
  }
);

// Manage response interceptors, including authentication errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle unauthorized access (401 status)
    if (error.response?.status === 401) {
      // Clear authentication-related local storage items
      localStorage.removeItem("token");
      localStorage.removeItem("userType");

      // Redirect to login page
      window.location.href = "/";
    }

    // Log other types of errors for debugging
    if (error.response) {
      // The request was made and the server responded with a status code
      console.error("Response Error:", {
        data: error.response.data,
        status: error.response.status,
        headers: error.response.headers,
      });
    } else if (error.request) {
      // The request was made but no response was received
      console.error("No Response Received:", error.request);
    } else {
      // Something happened in setting up the request
      console.error("Request Setup Error:", error.message);
    }

    return Promise.reject(error);
  }
);

export default api;
