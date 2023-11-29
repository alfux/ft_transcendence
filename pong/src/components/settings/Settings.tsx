import './Settings.css';
import Cookies from 'js-cookie';
import React, { useState, useEffect, useRef} from 'react';
import jwt, { jwtDecode } from 'jwt-decode';
import JwtPayload from '../../THREE/Utils/jwt.interface';
import TwoFactorValidate from '../twofactorvalidate/TwoFactorValidate';

const Settings: React.FC = () => {
  const inputRefs = useRef<Array<HTMLInputElement | null>>(Array(6).fill(null));
  const accessToken = Cookies.get('access_token');
  const user = accessToken ? jwtDecode<JwtPayload>(accessToken) : null;
  const [QRCode,setQRCodeUrl] = useState("")
  const [toogleStatus, setToggle] = useState<Boolean>(user?.isTwoFactorAuthEnable?true:false)
  const [isTwoFactorEnabled, setTwoFactorEnabled] =  useState<any>(user?user?.isTwoFactorAuthEnable:false)

	const twoFactorStatus = async () =>{
		try {//fetch 2fa Status
		  const enable2FAEndpoint = 'http://localhost:3001/2fa/status';
		  const response = await fetch(enable2FAEndpoint, {
			  method: 'GET',
			  credentials: 'include',
		  });
		  
		  if (response.ok) {
			  await response.text() === "true"?setTwoFactorEnabled(true):setTwoFactorEnabled(false)
		  } else {
			  console.error('Could not get the status of 2fa:', response.status);
		  }
	  } catch (error) {
		  console.error('Error enabling 2FA:', error);
	  }
};

//handle Toogle click
const handleToggle = async () => {
	setToggle((toogleStatus) => {return (!toogleStatus);});
	setTwoFactorEnabled(await twoFactorStatus())
	//console.log("status of backend",await twoFactorStatus())
    if (!toogleStatus){//toogle on
		try {//fetch QRcode
			const enable2FAEndpoint = 'http://localhost:3001/2fa/generate';
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
		if(isTwoFactorEnabled){
			if (isTwoFactorEnabled){
			try {
				const disable2FAEndpoint = 'http://localhost:3001/2fa/disable';
				const response = await fetch(disable2FAEndpoint, {
					method: 'POST',
				    credentials: 'include',
				});
				//setTwoFactorEnabled(await twoFactorStatus())
				if (response.ok) {
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
        <h2>Settings</h2>
        <div className="switch-container">
          <span className="switch-label">Enable/Disable 2FA</span>
          <label className="switch">
            <input type="checkbox" onChange={handleToggle} defaultChecked={isTwoFactorEnabled?true:false} />s
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
