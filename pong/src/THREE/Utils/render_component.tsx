import React, { useEffect, useRef, useState } from "react";
import jwt, { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';
import { createRoot } from 'react-dom/client';
import { JwtPayload, LoggedStatus } from '../Utils/jwt.interface';
import usePayload from '../../react_hooks/use_auth'
import Login from '../../components/login/Login'
import About from '../../components/about/About'
import Settings from '../../components/settings/Settings'
import ProfileBar from '../../components/profilebar/ProfileBar';
import Profile from '../../components/profile/Profile';
import TwoFactorAuthenticate from '../../components/twofactorauthenticate/TwoFactorAuthenticate';
import MatchMaking from "../../components/matchmaking/matchMaking";
import MiniChat from "../../components/minichat/MiniChat";
import MiniChatButton from "../../components/minichat/ChatButton";
import { createComponent } from "./createComponent";
import ScoreBar from "../../components/scorebar/ScoreBar";
import Notifications from "../../components/notifications/Notifications";


export function RenderComponents(loginForm: { option: string, game: boolean }) {
	let accessToken = Cookies.get('access_token');
	let user = accessToken ? jwtDecode<JwtPayload>(accessToken) : null;
	const [payload, updatePayload, handleUpdate] = usePayload();
	const cleanup: (() => void)[] = [];

	useEffect(() => {
		const newFormContainer = document.createElement('div');
		const root = createRoot(newFormContainer);
		root.render(<Notifications />);
		document.body.appendChild(newFormContainer);
		return () => {
			setTimeout(() => {
				root.unmount();
				document.body.removeChild(newFormContainer);
			});
		};
	}, [])


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
		if (loginForm.option === "About") {
			cleanup.push(createComponent(About));
		}
		if (accessToken && payload?.authentication === LoggedStatus.Logged && loginForm.option === "Play") {
			cleanup.push(createComponent(MatchMaking));
		}
		if (accessToken && payload?.authentication === LoggedStatus.Logged && loginForm.option === "Chat") {
			const newFormContainer = document.createElement('div');
			const root = createRoot(newFormContainer);
			root.render(<MiniChat width='90%' height='60%' bottom="15%" right="20%" />);
			document.body.appendChild(newFormContainer);
			cleanup.push(() => {
				setTimeout(() => {
					root.unmount();
					document.body.removeChild(newFormContainer);
				});
			});
		}
		return () => {
			cleanup.forEach(cleanupFunction => cleanupFunction());
		};
	}, [loginForm.option, loginForm.game])
	return null;
}
