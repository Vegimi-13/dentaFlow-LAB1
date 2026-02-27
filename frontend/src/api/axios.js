// import axios from "axios";

// const api = axios.create({
//   baseURL: "http://localhost:5001/api",
//   withCredentials: true, // Send cookies with requests
// });

// // Store access token in memory only
// let accessToken = null;

// // Function to set access token in memory
// export const setAccessToken = (token) => {
//   accessToken = token;
// };

// // Function to get access token from memory
// export const getAccessToken = () => {
//   return accessToken;
// };

// // Function to clear access token from memory
// export const clearAccessToken = () => {
//   accessToken = null;
// };

// // 🔐 Attach access token automatically
// api.interceptors.request.use(
//   (config) => {
//     if (accessToken) {
//       config.headers.Authorization = `Bearer ${accessToken}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error),
// );

// // 🔄 Auto-refresh token when expired
// api.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;

//     if (error.response?.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;

//       console.log("🔄 Token expired! Attempting to refresh...");

//       try {
//         // Try to refresh the access token using httpOnly cookie
//         const response = await axios.post(
//           "http://localhost:5001/api/auth/refresh",
//           {},
//           {
//             withCredentials: true, // Include cookies in refresh request
//           },
//         );

//         const { accessToken: newAccessToken } = response.data;
//         console.log("Token refreshed successfully!");

//         // Update access token in memory
//         setAccessToken(newAccessToken);

//         // Update the authorization header for the original request
//         originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

//         console.log("🔁 Retrying original request...");
//         // Retry the original request
//         return api(originalRequest);
//       } catch (refreshError) {
//         console.log(" Token refresh failed, redirecting to login");
//         // Refresh failed, clear token and redirect to login
//         clearAccessToken();
//         window.location.href = "/login";
//         return Promise.reject(refreshError);
//       }
//     }

//     return Promise.reject(error);
//   },
// );

// export default api;
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5001/api",
  withCredentials: true, // send cookies (refresh token)
});

// ==============================
// Access Token (memory only)
// ==============================

let accessToken = null;

export const setAccessToken = (token) => {
  accessToken = token;
};

export const getAccessToken = () => {
  return accessToken;
};

export const clearAccessToken = () => {
  accessToken = null;
};

// ==============================
// Attach access token to requests
// ==============================

api.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ==============================
// Auto refresh when token expires
// ==============================

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If no response (network error)
    if (!error.response) {
      return Promise.reject(error);
    }

    const isAuthRoute =
      originalRequest?.url?.includes("/auth/login") ||
      originalRequest?.url?.includes("/auth/refresh");

    // Only refresh if:
    // - 401
    // - not already retried
    // - not login or refresh route
    if (
      error.response.status === 401 &&
      !originalRequest._retry &&
      !isAuthRoute
    ) {
      originalRequest._retry = true;

      try {
        const response = await axios.post(
          "http://localhost:5001/api/auth/refresh",
          {},
          { withCredentials: true }
        );

        const newAccessToken = response.data.accessToken;

        // Save new access token in memory
        setAccessToken(newAccessToken);

        // Update original request header
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        // Retry original request
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed → logout
        clearAccessToken();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;