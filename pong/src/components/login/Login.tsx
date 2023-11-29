import './Login.css'
import Cookies from 'js-cookie';
import React, { useRef, useEffect, useState } from 'react'



const accessToken = Cookies.get('accessToken')



const Login: React.FC = () => {
	const [twoFactor, setTwoFactor] = useState(false)
	const [logged, setLogged] = useState(false)

	useEffect(()=>{
		const twoFactorStatus = async () =>{
			try {//fetch 2fa Status
			  const enable2FAEndpoint = 'http://localhost:3001/2fa/status';
			  const response = await fetch(enable2FAEndpoint, {
				  method: 'GET',
				  credentials: 'include',
			  });
			  
			  if (response.ok) {
				  await response.text() === "true"?setTwoFactor(true):setTwoFactor(false)
			  } else {
				  console.error('Could not get the status of 2fa:', response.status);
			  }
		  } catch (error) {
			  console.error('Error enabling 2FA:', error);
		  }
		}
		twoFactorStatus()
	},[logged])
    const fetchData = async () => {
        try {
            const authEndpoint = 'http://localhost:3001/auth/login';
			setLogged(true)
			window.location.href = authEndpoint;
			console.log('TEST')
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
		  {twoFactor && logged ? <div>AHFJSAHFJKHSAFKJHSAFKJHASKJFHASKJHFJKSAHFKSJA</div>:null}
      </div>
    </div>
  );
};

export default Login;
