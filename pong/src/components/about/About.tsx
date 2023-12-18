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
  
  return (
    <div className="glass-container-settings">
      
    </div>
  );
  
};

export default About;
