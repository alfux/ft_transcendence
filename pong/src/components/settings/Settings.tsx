import './Settings.css';
import Cookies from 'js-cookie';
import React, { useState, useEffect, useRef} from 'react';
import jwt, { jwtDecode } from 'jwt-decode';
import JwtPayload from '../../THREE/Utils/jwt.interface';
import TwoFactorValidate from '../twofactorvalidate/TwoFactorValidate';

const Settings: React.FC = () => {
  const inputRefs = useRef<Array<HTMLInputElement | null>>(Array(6).fill(null));
  const [isTwoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [qCode, setQCode] = useState<string | null>(null);
  const accessToken = Cookies.get('access_token');
  const user = accessToken ? jwtDecode<JwtPayload>(accessToken) : null;
  const [QRCode,setQRCodeUrl] = useState("")
  const [twoFactorValidate, setTwoFactorValidate] = useState<Boolean>(user?user?.isTwoFactorAuthEnable:false)
  const handleToggle = async () => {
    console.log(isTwoFactorEnabled, twoFactorValidate)
    setTwoFactorEnabled((prevValue) => !prevValue);
    
    if (!isTwoFactorEnabled){
      console.log('disabling 2fa')
    }
    else{
      try {
        const enable2FAEndpoint = 'http://localhost:3001/2fa/generate';
        const response = await fetch(enable2FAEndpoint, {
          method: 'GET',
          credentials: 'include',
        });
  
        if (response.ok) {
          twoFactorValidate ? setTwoFactorValidate(false) : setTwoFactorValidate(true)
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
    //   try {
    //   const disable2FAEndpoint = 'http://localhost:3001/2fa/disable';
    //   const response = await fetch(disable2FAEndpoint, {
    //     method: 'POST',
    //     credentials: 'include',
    //   });
    //   const body = await response.text()
    //   console.log(body)
    //   if (response.ok) {
    //     console.log("disabled from backend")
    //   } else {
    //     console.error('Error disabling 2FA. Server responded with status:', response.status);
    //   }
    // } catch (error) {
    //   console.error('Error disabling 2FA:', error);
    // }
    // }
    
  };
  return (
    <div className="glass-container-settings">
      <div className='settings'>
        <h2>Settings</h2>
        <div className="switch-container">
          <span className="switch-label">Enable/Disable 2FA</span>
          <label className="switch">
            <input type="checkbox" onChange={handleToggle} defaultChecked={user?.isTwoFactorAuthEnable?true:false} />
            <span className="slider"></span>
          </label>
        </div>
      </div>
      {QRCode && !isTwoFactorEnabled && <img className="QRCode" src={QRCode}alt="QR Code" />}
      {QRCode && !isTwoFactorEnabled && <TwoFactorValidate/>}
    </div>
  );
  
};

export default Settings;
