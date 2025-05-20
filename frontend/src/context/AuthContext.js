import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    const loadUser = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          setLoading(false);
          return;
        }
        
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/api/auth/me`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        
        setUser(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error loading user:', err);
        localStorage.removeItem('token');
        setError('Failed to authenticate');
        setLoading(false);
      }
    };
    
    loadUser();
  }, []);
  
  // Register user
  const register = async (userData) => {
    try {
      setError(null);
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/auth/register`,
        userData
      );
      
      localStorage.setItem('token', response.data.token);
      setUser(response.data.user);
      
      return response.data;
    } catch (err) {
      console.error('Registration error:', err);
      setError(
        err.response && err.response.data.message
          ? err.response.data.message
          : 'Registration failed'
      );
      throw err;
    }
  };
  
  // Login user
  const login = async (email, password) => {
    try {
      setError(null);
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/auth/login`,
        { email, password }
      );
      
      localStorage.setItem('token', response.data.token);
      setUser(response.data.user);
      
      return response.data;
    } catch (err) {
      console.error('Login error:', err);
      setError(
        err.response && err.response.data.message
          ? err.response.data.message
          : 'Login failed'
      );
      throw err;
    }
  };
  
  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };
  
  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        isAuthenticated: !!user,
        register,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
