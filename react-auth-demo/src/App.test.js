import React from 'react';
import axios from 'axios';

function App() {
  const handleLogin = async () => {
    try {
      const response = await axios.get('/auth/login'); // use the proxy endpoint
      console.log('Login Successful!', response.data);
    } catch (error) {
      console.error('Login Failed!', error);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Login App</h1>
        <button onClick={handleLogin}>Login</button>
      </header>
    </div>
  );
}

export default App;
