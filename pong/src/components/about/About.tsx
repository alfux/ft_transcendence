import './About.css';
import { config } from '../../config';
import Cookies from 'js-cookie';
import React, { useState, useEffect, useRef} from 'react';
import jwt, { jwtDecode } from 'jwt-decode';
import {JwtPayload} from '../../THREE/Utils/jwt.interface';
import TwoFactorValidate from '../twofactorvalidate/TwoFactorValidate';
import usePayload from '../../react_hooks/use_auth'
const About: React.FC = () => {
  const inputRefs = useRef<Array<HTMLInputElement | null>>(Array(6).fill(null));
  const accessToken = Cookies.get('access_token');
  const user = accessToken ? jwtDecode<JwtPayload>(accessToken) : null;
  const [QRCode,setQRCodeUrl] = useState("")
  const [toogleStatus, setToggle] = useState<Boolean>(user?.isTwoFactorAuthEnable?true:false)
//   const [isTwoFactorEnabled, setTwoFactorEnabled] =  useState<any>(user?user?.isTwoFactorAuthEnable:false)
  const [payload, updatePayload, handleUpdate] = usePayload();
  
  function changePfP(event: any) {
    if (!data)
      return

    const file = event.target.files[0]
    const reader = new FileReader();

    const sendFile = async (image_b64: string) => {
      try {
        const response = await fetch(`${config.backend_url}/api/user/me`, {
          method: 'PATCH',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            image: `data:image/png;base64,${image_b64}`
          }),
        });

        if (response.ok) {
          console.log('File uploaded successfully.');
          const result = await response.json()
          setData(result)
        } else {
          console.error('Failed to upload file.');
        }
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    }

    reader.onload = () => {
      const res = reader.result as string
      const base64String = res.split(',')[1]
      sendFile(base64String)
    };
    
  return (
    <div className="profile-box">
        {data != null ? (
          <div>
            <input
              type="file"
              id="fileInput"
              style={{ display: 'none' }}
              onChange={changePfP}
            />
            <label htmlFor="fileInput">
              <img className="profile-photo" src={data.image} />
            </label>
          </div>
        ) : <h2>nop</h2>}
    </div>
  );
  
};

export default About;