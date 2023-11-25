import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import jwt, { jwtDecode } from 'jwt-decode';
import './App.css';

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [qrCodeUrl, setQRCodeUrl] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [showVerificationInput, setShowVerificationInput] = useState(false);

  useEffect(() => {
    const checkLoggedIn = async () => {
      const accessToken = Cookies.get('access_token');
      if (accessToken) {
        setLoggedIn(true);
        const check2FAStatusEndpoint = 'http://localhost:3001/2fa/status';

        try {
          const response = await fetch(check2FAStatusEndpoint, {
            method: 'GET',
            credentials: 'include',
          });

          if (response.ok) {
            const status = await response.text();
            setIs2FAEnabled(status === 'enabled');

            if (status === 'enabled') {
              setShowVerificationInput(true);
            }
          } else {
            console.error('Error checking 2FA status. Server responded with status:', response.status);
          }
        } catch (error) {
          console.error('Error checking 2FA status:', error);
        }
      }
    };

    checkLoggedIn();
  }, []);

  const handleLogin = async () => {
    const authEndpoint = 'http://localhost:3001/auth/login';

    if (is2FAEnabled && showVerificationInput) {
      handleVerifyCode();
    } else {
      window.location.href = authEndpoint;
    }
  };

  const handleLogout = async () => {
    const logoutEndPoint = 'http://localhost:3001/auth/logout';
    try {
      const response = await fetch(logoutEndPoint, {
        method: 'GET',
        credentials: 'include',
      });
      const content = await response.json();
      console.log('response', content);
    } catch (error) {
      console.error('Error during logout:', error);
    }
    window.location.reload();
  };

  const handleEnable2FA = async () => {
    const enable2FAEndpoint = 'http://localhost:3001/2fa/generate';
    try {
      const response = await fetch(enable2FAEndpoint, {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const qrCodeUrl = await response.text();
        setQRCodeUrl(qrCodeUrl);
        setShowVerificationInput(true);
      } else {
        console.error('Error enabling 2FA. Server responded with status:', response.status);
      }
    } catch (error) {
      console.error('Error enabling 2FA:', error);
    }
  };

  const handleVerifyCode = async () => {
    const verify2FAEndpoint = 'http://localhost:3001/2fa/enable';
    try {
      const response = await fetch(verify2FAEndpoint, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ verificationCode }),
      });

      if (response.ok) {
        setIs2FAEnabled(true);
        setShowVerificationInput(false);
      } else {
        console.error('Error verifying 2FA code. Server responded with status:', response.status);
      }
    } catch (error) {
      console.error('Error verifying 2FA code:', error);
    }
  };

  const handleDisable2FA = async () => {
    const disable2FAEndpoint = 'http://localhost:3001/2fa/disable';
    try {
      const response = await fetch(disable2FAEndpoint, {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        setIs2FAEnabled(false);
      } else {
        console.error('Error disabling 2FA. Server responded with status:', response.status);
      }
    } catch (error) {
      console.error('Error disabling 2FA:', error);
    }
  };

  const handleVerificationCodeChange = (event) => {
    setVerificationCode(event.target.value);
  };

  if (loggedIn) {
    const info = jwtDecode(Cookies.get('access_token'));
    return (
      <div className="App">
        <header className="App-header">
          <h1>OAuth Login App</h1>
          <button onClick={handleLogout}>Logout</button>
          {is2FAEnabled ? (
            <div>
              <button onClick={handleDisable2FA}>Disable 2FA</button>
              {is2FAEnabled && showVerificationInput && (
                <div>
                  <input
                    type="text"
                    placeholder="Enter verification code"
                    value={verificationCode}
                    onChange={handleVerificationCodeChange}
                  />
                  <button onClick={handleVerifyCode}>Verify Code</button>
                </div>
              )}
            </div>
          ) : (
            <div>
              <button onClick={handleEnable2FA}>Enable 2FA</button>
            </div>
          )}
          {qrCodeUrl && <img src={qrCodeUrl} alt="QR Code" />}
          <div>Welcome: {info.email}</div>
        </header>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>OAuth Login App</h1>
        <button onClick={handleLogin}>Login</button>
      </header>
    </div>
  );
}

export default App;
 