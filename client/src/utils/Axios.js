import axios from "axios";
import SummaryApi, { baseURL } from "../common/SummaryApi";

// Create axios instance
const Axios = axios.create({
  baseURL: baseURL,
  withCredentials: true,
});

// 🔹 Request Interceptor → attach access token if present
Axios.interceptors.request.use(
  async (config) => {
    const accessToken = localStorage.getItem("accesstoken");

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// 🔹 Response Interceptor → handle 401 and refresh token
Axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 Unauthorized and retry not attempted yet
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refreshToken");

      if (refreshToken) {
        try {
          const newAccessToken = await refreshAccessToken(refreshToken);

          if (newAccessToken) {
            // Update the header and retry the request
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return Axios(originalRequest);
          }
        } catch (refreshError) {
          console.error("Refresh token failed:", refreshError);
          // Optionally: logout user or redirect to login
        }
      }
    }

    return Promise.reject(error);
  }
);

// 🔹 Helper function to get new access token
const refreshAccessToken = async (refreshToken) => {
  try {
    const response = await axios({
      baseURL: baseURL, // use plain axios to avoid interceptor loops
      ...SummaryApi.refreshToken,
      headers: {
        Authorization: `Bearer ${refreshToken}`,
      },
      withCredentials: true,
    });

    const accessToken = response.data?.data?.accessToken;
    if (accessToken) {
      localStorage.setItem("accesstoken", accessToken);
    }
    return accessToken;
  } catch (error) {
    console.error("Error refreshing token:", error);
    return null;
  }
};

export default Axios;
