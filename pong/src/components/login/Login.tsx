import './Login.css'
import Cookies from 'js-cookie';
import React, { useRef, useEffect, useState } from 'react'
import usePayload from '../../react_hooks/use_auth'


const accessToken = Cookies.get('accessToken')



const Login: React.FC = () => {
	const [twoFactor, setTwoFactor] = useState(false)
	const [logged, setLogged] = useState(false)
  const [payload, updatePayload, handleUpdate] = usePayload();
    const fetchData = async () => {
        try {
        	const authEndpoint = 'http://localhost:3001/api/auth/login'; //IP has been replaced by localhost
            handleUpdate();
			window.location.href = authEndpoint;
		}
        catch (error) {
			console.error('Error fetching data:', error);
        }
    }
  return (
    <div className="glass-container-login">
      <div className="navbar">
        {/* Login Form */}
          <form className="login-form">
            <label htmlFor="username">Username:</label>
            <input type="text" id="username" name="username" required />
            <label htmlFor="password">Password:</label>
            <input type="password" id="password" name="password" required />
            <button type="submit">Login</button>
          </form>
          {/* OAuth Login Button */}
          <button onClick={fetchData} className="oauth-button">Login with OAuth</button>
      </div>
    </div>
  );
};

export default Login;
