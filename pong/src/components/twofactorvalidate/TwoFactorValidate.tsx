import './TwoFactorValidate.css';
import { config } from '../../config';
import Cookies from 'js-cookie';
import React, { useEffect, useState } from 'react';
import usePayload from '../../react_hooks/use_auth'
const TwoFactorValidate: React.FC = () => {

	const requestNewToken = async () =>{
		try {//fetch 2fa Status
		  const enable2FAEndpoint = `${config.backend_url}/api/auth/refresh`;
		  console.log('Before fetch');
		  const response = await fetch(enable2FAEndpoint, {
			  method: 'GET',
			  credentials: 'include',
		  });
		  console.log('After fetching', response);

		  if (response.ok) {
			const test = await response.json()
			console.log("leviosa: ", test)
		  } else {
			  console.error('Could not get new AccessToken:', response.status);
		  }
	  } catch (error) {
		  console.error('Error fetching new refresh Token:', error);
	  }
};

  const [digits, setDigits] = useState<string>('');
  const [payload, updatePayload, handleUpdate] = usePayload();
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
    const verify2FAEndpoint = `${config.backend_url}/api/2fa/enable`;
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
        //request new token
        requestNewToken()
				handleUpdate()
        setDigits('');
		    alert("2FA Enabled")
      } else {
		alert("Wrong code")
        console.error('Error verifying 2FA code. Server responded with status:', response.status);
      }
    } catch (error) {
      console.error('Error verifying 2FA code:', error);
    }
    try{
      //await requestNewToken()
      handleUpdate()
    }catch(error){
      console.log(error)
    }
  };

  useEffect(() => {
    if (digits.length === 6) {
      handleSubmit();
    }
  }, [digits]);

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

export default TwoFactorValidate;
