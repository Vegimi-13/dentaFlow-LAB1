import { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { setAccessToken, clearAccessToken } from "../api/axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Try to refresh token using httpOnly cookie
      const response = await fetch("http://localhost:5001/api/auth/refresh", {
        method: "POST",
        credentials: "include", // Include cookies
      });

      if (response.ok) {
        const data = await response.json();
        const decoded = jwtDecode(data.accessToken);
        setAccessToken(data.accessToken);
        setUser(decoded);
      }
    } catch (error) {
      console.log("No valid session found");
    } finally {
      setLoading(false);
    }
  };

  const login = (accessTokenValue) => {
    // Store access token in memory only (via axios module)
    setAccessToken(accessTokenValue);
    const decoded = jwtDecode(accessTokenValue);
    setUser(decoded);
  };

  const logout = async () => {
    try {
      // Call logout endpoint to clear httpOnly cookie
      await fetch("http://localhost:5001/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout request failed:", error);
    } finally {
      // Clear access token from memory and user state
      clearAccessToken();
      setUser(null);
    }
  };

  if (loading) {
    return <div>Loading...</div>; // Or your loading component
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
