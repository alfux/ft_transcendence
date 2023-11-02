// src/components/LoginForm.js
import React, { useState } from 'react';
import axios from 'axios'; // Import Axios

const LoginForm = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://localhost:3001/user/', {  // Replace with your backend URL
        firstName,
        lastName,
        email,
      });
      // Handle the API response here (e.g., show a success message or redirect).
    } catch (error) {
      console.error('Error:', error);
      // Handle errors (e.g., display an error message).
    }
  };
  
  

  return (
    <div>
      <h2>Login</h2>
      <input
        type="text"
        placeholder="First Name"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
      />
      <input
        type="text"
        placeholder="Last Name"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
};

export default LoginForm;
