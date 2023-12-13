import React, { useEffect, useRef, useState } from "react";
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
import MiniChat from "../../components/minichat/MiniChat";
import MiniChatButton from "../../components/minichat/ChatButton";
import createComponent from "./createComponent";
import ScoreBar from "../../components/scorebar/ScoreBar";
import Notifications from "../../components/notifications/Notifications";
import { notifications } from "../../sockets/notifications";



export function RenderComponents(loginForm: { option: string, game: boolean }) {
  let accessToken = Cookies.get('access_token');
  let user = accessToken ? jwtDecode<JwtPayload>(accessToken) : null;
  const [payload, updatePayload, handleUpdate] = usePayload();
  const cleanup: (() => void)[] = [];
  const [notificationData, setNotificationData] = useState<{ type: string; data: any } | null>(null);
  const [showNotifications, setShowNotifications] = useState(true);
  useEffect(() => {
    const handleFriendRequestRecv = (data: { req: any }) => {
      setNotificationData({ type: "friend_request_recv", data: data });
      setShowNotifications(true);
    };

    const handleFriendNew = (data: { req: any }) => {
      setNotificationData({ type: "friend_new", data: data });
      setShowNotifications(true);
    };
    const handleFriendRequestDenied = (data: { req: any }) => {
      setNotificationData({ type: "friend_request_denied", data: data });
      setShowNotifications(true);
    };

    notifications.on("friend_request_recv", handleFriendRequestRecv);
    notifications.on("friend_new", handleFriendNew);
    notifications.on("friend_request_denied", handleFriendRequestDenied);
  }, []);

  useEffect(() => {
    if (showNotifications) {
      const newFormContainer = document.createElement('div');
      const root = createRoot(newFormContainer);
      root.render(<Notifications notificationData={notificationData} />);
      document.body.appendChild(newFormContainer);
      return () => {
        setTimeout(() => {
          root.unmount();
          document.body.removeChild(newFormContainer);
        });
      };
    }
  }, [showNotifications, notificationData])

  useEffect(() => {
    const cleanup: (() => void)[] = [];
    handleUpdate();
    if (loginForm.game)
      return (() => { });
    if (accessToken && payload?.authentication === LoggedStatus.Logged && loginForm.option !== "Profile" && loginForm.option !== "Play") {
      cleanup.push(createComponent(ProfileBar));
    }
    if (accessToken && payload?.authentication === LoggedStatus.Incomplete) {
      cleanup.push(createComponent(TwoFactorAuthenticate));
    }
    if (loginForm.option === "Profile" && accessToken && payload?.authentication === LoggedStatus.Logged) {
      cleanup.push(createComponent(Profile));
    }
    if (loginForm.option === "Settings" && accessToken && payload?.authentication === LoggedStatus.Logged) {
      cleanup.push(createComponent(Settings));
    }
    if (loginForm.option === "Login" && !accessToken) {
      cleanup.push(createComponent(Login));
    }
    if (loginForm.option === "About" && accessToken && payload?.authentication === LoggedStatus.Logged) {
    }
    if (accessToken && payload?.authentication === LoggedStatus.Logged && loginForm.option === "Play") {
      cleanup.push(createComponent(MatchMaking));
    }
    if (accessToken && payload?.authentication === LoggedStatus.Logged && loginForm.option === "Game") {
      cleanup.push(createComponent(ScoreBar));
    }
    return () => {
      cleanup.forEach(cleanupFunction => cleanupFunction());
    };
  }, [loginForm.option, loginForm.game])
  return null;
}
