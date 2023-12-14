import './Settings.css';
import { config } from '../../config';
import Cookies from 'js-cookie';
import React, { useState, useEffect, useRef} from 'react';
import jwt, { jwtDecode } from 'jwt-decode';
import {JwtPayload} from '../../THREE/Utils/jwt.interface';
import TwoFactorValidate from '../twofactorvalidate/TwoFactorValidate';
import usePayload from '../../react_hooks/use_auth'
const Settings: React.FC = () => {
  const inputRefs = useRef<Array<HTMLInputElement | null>>(Array(6).fill(null));
  const accessToken = Cookies.get('access_token');
  const user = accessToken ? jwtDecode<JwtPayload>(accessToken) : null;
  const [QRCode,setQRCodeUrl] = useState("")
  const [toogleStatus, setToggle] = useState<Boolean>(user?.isTwoFactorAuthEnable?true:false)
//   const [isTwoFactorEnabled, setTwoFactorEnabled] =  useState<any>(user?user?.isTwoFactorAuthEnable:false)
  const [payload, updatePayload, handleUpdate] = usePayload();
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
		console.log("This is the new refresh token: ", test)
	  } else {
		  console.error('Could not get new AccessToken:', response.status);
	  }
  } catch (error) {
	  console.error('Error fetching new refresh Token:', error);
  }
};

//handle Toogle click
const handleToggle = async () => {
	setToggle((toogleStatus) => {return (!toogleStatus);});
	await requestNewToken()
	//console.log("status of backend",await twoFactorStatus())
    if (!toogleStatus){//toogle on
		try {//fetch QRcode
			const enable2FAEndpoint = `${config.backend_url}/api/2fa/generate`;
			const response = await fetch(enable2FAEndpoint, {
			  method: 'GET',
			  credentials: 'include',
			});
	  
			if (response.ok) {
			  const qrCodeUrl = await response.text();
			  setQRCodeUrl(qrCodeUrl);
			  console.log("qrcode generated")
			} else {
			  console.error('Error enabling 2FA. Server responded with status:', response.status);
			}
		  } catch (error) {
			console.error('Error enabling 2FA:', error);
		  }
	}
	else{//toogle off
		console.log("off", toogleStatus)
		if(payload?.isTwoFactorAuthEnable){
			if (payload?.isTwoFactorAuthEnable){
			try {
				const disable2FAEndpoint = `${config.backend_url}/api/2fa/disable`;
				const response = await fetch(disable2FAEndpoint, {
					method: 'POST',
				    credentials: 'include',
				});
				//setTwoFactorEnabled(await twoFactorStatus())
				if (response.ok) {
					await requestNewToken()
					handleUpdate()
					console.log("2FA disabled")
				  } else {
				    console.error('Error disabling 2FA. Server responded with status:', response.status);
				  }
			} catch (error) {
				  console.error('Error disabling 2FA:', error);
			}
		}
		}
	}
    
  };
  return (
    <div className="glass-container-settings">
      <div className='settings'>
        <div className="switch-container">
          <span className="switchLabel">Enable/Disable 2FA</span>
          <label className="switchButton">
            <input type="checkbox" onChange={handleToggle} defaultChecked={payload?.isTwoFactorAuthEnable?true:false} />
            <span className="slider"></span>
          </label>
        </div>
		<div className="switch-container">
          <span className="switchLabel">Enable/Disable Bloom</span>
          <label className="switchButton">
            <input type="checkbox" onChange={handleToggle} defaultChecked={payload?.isTwoFactorAuthEnable?true:false} />
            <span className="slider"></span>
          </label>
        </div>
		<div className="switch-container">
          <span className="switchLabel">Test</span>
          <label className="switchButton">
            <input type="checkbox" onChange={handleToggle} defaultChecked={payload?.isTwoFactorAuthEnable?true:false} />
            <span className="slider"></span>
          </label>
        </div>
		<div className="switch-container">
          <span className="switchLabel">Testsgsdgsdgsdh</span>
          <label className="switchButton">
            <input type="checkbox" onChange={handleToggle} defaultChecked={payload?.isTwoFactorAuthEnable?true:false} />
            <span className="slider"></span>
          </label>
        </div>
      </div>
      {QRCode && toogleStatus && <img className="QRCode" src={QRCode}alt="QR Code" />}
      {QRCode && toogleStatus && <TwoFactorValidate/>}
    </div>
  );
  
};

export default Settings;
