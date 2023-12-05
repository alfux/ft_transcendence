import './TwoFactorAuthenticate.css';
import Cookies from 'js-cookie';
import React, { useEffect, useState } from 'react';
import usePayload from '../../react_hooks/use_auth'
const TwoFactorAuthenticate: React.FC = () => {
  const [digits, setDigits] = useState<string>('');
  const [payload, updatePayload, handleUpdate] = usePayload();
	const requestNewToken = async () =>{
		try {//fetch 2fa Status
		  const enable2FAEndpoint = 'http://localhost:3001/api/auth/refresh';
		  console.log('Before fetch');
		  const response = await fetch(enable2FAEndpoint, {
			  method: 'GET',
			  credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
		  });
		  console.log('After fetch', response);

		  if (response.ok) {
      handleUpdate()
			console.log('new payload: ', payload)
		  } else {
			  console.error('Could not get the status of 2fa:', response.status);
		  }
	  } catch (error) {
		  console.error('Error enabling 2FA:', error);
	  }
};


  const handleInput = (currentInput: string, nextInput: string) => {
    const digit = document.getElementById(currentInput) as HTMLInputElement | null;
    if (digit && digit.value.length === digit.maxLength) {
      setDigits((prevDigits) => prevDigits + digit.value);

      if (nextInput) {
        const nextDigit = document.getElementById(nextInput) as HTMLInputElement | null;
        if (nextDigit) {
          nextDigit.focus();
        }
      }
    }
  };

  const handleSubmit = async () => {
    const verify2FAEndpoint = 'http://localhost:3001/api/2fa/authenticate';
    try {
      const verificationCode = digits;
      const response = await fetch(verify2FAEndpoint, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({verificationCode}),
      });
      if (response.ok) {
        alert("Logged")
        await requestNewToken();
        handleUpdate()
        window.location.reload();
      } else {
		alert("Wrong code")
        console.error('Error verifying 2FA code. Server responded with status:', response.status);
      }
    } catch (error) {
      console.error('Error verifying 2FA code:', error);
    }
  };

  useEffect(() => {
    if (digits.length === 6) {
      handleSubmit();
    }
  }, [digits, handleSubmit]);

  return (
    <div className="glass-container-twofactor">
      <h1 className='twoFactorValidate'>2FA</h1>
      <p>Scan QRCode</p>
      <p>Validate two-factor to enable</p>
      <form>
        <input type="number" maxLength={1} id="digit1" onInput={() => handleInput('digit1', 'digit2')} />
        <input type="number" maxLength={1} id="digit2" onInput={() => handleInput('digit2', 'digit3')} />
        <input type="number" maxLength={1} id="digit3" onInput={() => handleInput('digit3', 'digit4')} />
        <input type="number" maxLength={1} id="digit4" onInput={() => handleInput('digit4', 'digit5')} />
        <input type="number" maxLength={1} id="digit5" onInput={() => handleInput('digit5', 'digit6')} />
        <input type="number" maxLength={1} id="digit6" onInput={() => handleInput('digit6', '')} />
      </form>
    </div>
  );
};

export default TwoFactorAuthenticate;
