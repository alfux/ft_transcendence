// src/Login.js
import React from 'react';
import axios from 'axios';

const Login = () => {
  const handleLogin = async () => {
    try {
      // Make a GET request to login
      const response = await fetch('http://localhost:3001/success', {
      headers: {
        'Content-Type': 'application/json',
        // Add other headers if needed
      },
      method: 'GET',
    });
      console.log('Login successful:', response.data);
      // You can handle the response as needed (e.g., update state, redirect, etc.)
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const handleLogout = async () => {
    try {
      // Make a GET request to logout
      const response = await fetch('http://localhost:3001/success');
      console.log('Logout successful:', response.data);
      // You can handle the response as needed (e.g., update state, redirect, etc.)
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div>
      <button onClick={handleLogin}>Login</button>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Login;
