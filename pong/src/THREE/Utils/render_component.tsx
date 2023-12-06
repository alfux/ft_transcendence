import React, { useEffect, useState } from "react";
import jwt, { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';
import { createRoot } from 'react-dom/client';
import { JwtPayload, LoggedStatus } from '../Utils/jwt.interface';
import usePayload from '../../react_hooks/use_auth'
import Login from '../../components/login/Login'
import Settings from '../../components/settings/Settings'
import ProfileBar from '../../components/profilebar/ProfileBar';
import Profile from '../../components/profile/Profile';
import TwoFactorAuthenticate from '../../components/twofactorauthenticate/TwoFactorAuthenticate';
import MatchMaking from "../../components/matchmaking/matchMaking";
import Chat from "../../components/chat/Chat";
import MiniChat from "../../components/minichat/MiniChat";
import MiniChatButton from "../../components/minichat/ChatButton";
import createComponent from "./createComponent";


function RenderComponents(loginForm:string) {
  let accessToken = Cookies.get('access_token');
  let user = accessToken ? jwtDecode<JwtPayload>(accessToken) : null;
  const [payload, updatePayload, handleUpdate] = usePayload();
  useEffect(() => {
    const cleanup: (() => void)[] = [];
    handleUpdate()
    if (accessToken && payload?.authentication === LoggedStatus.Logged && loginForm !== "Profile" && loginForm !== "Play") {
      cleanup.push(createComponent(ProfileBar));
    }
    if (accessToken && payload?.authentication === LoggedStatus.Incomplete) {
      cleanup.push(createComponent(TwoFactorAuthenticate));
    }
    if (loginForm === "Profile" && accessToken && payload?.authentication === LoggedStatus.Logged) {
      cleanup.push(createComponent(Profile));
    }
    if (loginForm === "Settings" && accessToken && payload?.authentication === LoggedStatus.Logged) {
      cleanup.push(createComponent(Settings));
    }
    if (loginForm === "Login" && !accessToken) {
      cleanup.push(createComponent(Login));
    }
    if (accessToken && payload?.authentication === LoggedStatus.Logged && loginForm === "Play") {
      cleanup.push(createComponent(MatchMaking));
     }
     return ()=>{
      cleanup.forEach(cleanupFunction => cleanupFunction());
     };
  }, [loginForm])
  return null;
}

export default RenderComponents;
