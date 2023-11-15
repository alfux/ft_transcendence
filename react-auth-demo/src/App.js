import React from 'react';
import Cookies from 'js-cookie';
function App() {
  const handleLogin = () => {
    // Replace the URL with your actual authentication endpoint
    const authEndpoint = 'http://localhost:3001/auth/login';
    window.location.href = authEndpoint;
  };

  const handleLogout = async () => {
    // Replace the URL with your actual logout endpoint
    const logoutEndPoint = 'http://localhost:3001/auth/logout';
    try {
      const response = await fetch(logoutEndPoint ,{
        method: 'GET',
        credentials:'include',
        
      });
      const content = await response.json();
     console.log('response', content);
     window.location.reload();

    } catch (error) {
      console.log('error');
    }
  };

  const handleAboutMe = async () => {
    // Replace the URL with your actual about me content endpoint
    const aboutMeEndpoint = 'http://localhost:3001/test';

    try {
      const accessToken = Cookies.get('access_token')
      console.log(accessToken)
      const response = await fetch(aboutMeEndpoint,{
        method: 'GET',
        credentials:'include',
        
      });
      const content = await response.text();
      console.log(content)

    } catch (error) {
      console.error('Error fetching about me content:', error);
    }
  };
  const accessToken = Cookies.get('access_token')
  if (accessToken){
    return (
      <div className="App">
        <header className="App-header">
          <h1>OAuth Login App</h1>
          <button onClick={handleLogout}>Logout</button>
          <button onClick={handleAboutMe}>About Me</button>
        </header>
      </div>
    );
  }
  return (
    <div className="App">
      <header className="App-header">
        <h1>OAuth Login App</h1>
        <button onClick={handleLogin}>Login</button>
        <button onClick={handleAboutMe}>About Me</button>
      </header>
    </div>
  );
}

export default App;
