import React, { useEffect } from "react";
import jwt, { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';
import { createRoot } from 'react-dom/client';
import JwtPayload from '../Utils/jwt.interface';
import usePayload from '../../react_hooks/use_auth'
import Login from '../../components/login/Login'
import Settings from '../../components/settings/Settings'
import ProfileBar from '../../components/profilebar/ProfileBar';
import Logout from '../../components/logout/Logout';
import Profile from '../../components/profile/Profile';
import TwoFactorAuthenticate from '../../components/twofactorauthenticate/TwoFactorAuthenticate';
// import { Profile } from "../ReactUI/Profile";

function RenderComponents(loginForm:string) {
  let accessToken = Cookies.get('access_token');
  let user = accessToken ? jwtDecode<JwtPayload>(accessToken) : null;
  const [payload, updatePayload, handleUpdate] = usePayload();
  useEffect(() => {
    if (accessToken && payload?.authentication === "Complete" && loginForm !== "Profile") {
      const newFormContainer = document.createElement('div');
      const root = createRoot(newFormContainer);
      root.render(<ProfileBar />);
      console.log("payload: ", payload?.authentication)
      document.body.appendChild(newFormContainer);
      return () => {
        setTimeout(() => {
          root.unmount();
          document.body.removeChild(newFormContainer);
        });
      };
    }
  }, [loginForm === "Profile"])

  useEffect(() => {
    handleUpdate()
    console.log("Payloader:", payload)
    if (loginForm === "Log" && !accessToken) {
      const newFormContainer = document.createElement('div');
      const root = createRoot(newFormContainer);
      root.render(<Login />);
      document.body.appendChild(newFormContainer);
      return () => {
        setTimeout(() => {
          root.unmount();
          document.body.removeChild(newFormContainer);
        });
      };
    }
    if (loginForm === "Settings" && accessToken && payload?.authentication === "Complete") {
      const newFormContainer = document.createElement('div');
      const root = createRoot(newFormContainer);
      root.render(<Settings />);
      document.body.appendChild(newFormContainer);
      return () => {
        setTimeout(() => {
          root.unmount();
          document.body.removeChild(newFormContainer);
        });
      };
    }
    if (loginForm === "Profile" && accessToken && payload?.authentication === "Complete") {
      const newFormContainer = document.createElement('div');
      const root = createRoot(newFormContainer);
      root.render(<Profile />);
      document.body.appendChild(newFormContainer);
      return () => {
        setTimeout(() => {
          root.unmount();
          document.body.removeChild(newFormContainer);
        });
      };
    }
    if (accessToken && payload?.authentication === "Incomplete") {
      const newFormContainer = document.createElement('div');
      const root = createRoot(newFormContainer);
      root.render(<TwoFactorAuthenticate />);
      document.body.appendChild(newFormContainer);
      return () => {
        setTimeout(() => {
          root.unmount();
          document.body.removeChild(newFormContainer);
        });
      };
    }
  }, [loginForm])
  

  return null;
}

export default RenderComponents;
