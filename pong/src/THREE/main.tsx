import React, { useRef, useEffect, useState } from 'react'
import * as THREE from "three";
import io from "socket.io-client";
import jwt, { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';
import { initKeyboardHandlers } from './Utils'
import JwtPayload from './Utils/jwt.interface';
import { create_menu_scene } from "./MenuScene";
import { create_game_scene } from "./GameScene";

// import { Profile } from './ReactUI/Profile';
import Profile from '../components/profile/Profile'

import Login from '../components/login/Login'
import Settings from '../components/settings/Settings'
import { createRoot } from 'react-dom/client';
import { access } from 'fs';
import { fetchData } from './Utils/api';
export default function	THREE_App() {
	const	divRef = useRef<HTMLDivElement>(null);
	const [loginForm, setLoginForm] = useState('')
	const	[showProfile, setShowProfile] = useState(false)
	const accessToken = Cookies.get('access_token');
	const	[twofactor, setTwoFactor] = useState(false)
  const user = accessToken ? jwtDecode<JwtPayload>(accessToken) : null;
//logout || refresh token
	useEffect(()=>{
		console.log("here")
		if(user?.exp && user?.exp < Date.now() / 1000){
			// fetchData()
			alert("Token expired");
			document.cookie = `access_token=; expires=${Date.now.toString()}; path=/;`;
			window.location.reload();
		}
	},[loginForm])

	function get_token() {
		const urlParams = new URLSearchParams(window.location.search)
		const token = urlParams.get('code')
		if (token) {
		  localStorage.setItem('token', token)
		  const newURL = window.location.href.replace(window.location.search, '')
		  window.history.replaceState({}, document.title, newURL)
		}
	}

	useEffect(() =>
	{
		get_token()

		const	renderer = new THREE.WebGLRenderer();

		const	menu_scene = create_menu_scene(renderer, {toggleProfile:() => {setShowProfile((prev) => !prev)}})
		const	game_scene = create_game_scene(renderer)

		const	socket = io("http://10.18.202.182:3001", {transports: ["websocket"]});

		function	mainloop()
		{
			requestAnimationFrame(mainloop);
			setLoginForm(menu_scene.update())
			// game_scene.update()
			//loginForm !== "Play" && !accessToken ? setLoginForm(menu_scene.update()) : game_scene.update()
		}

		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.autoClear = false;

		if (divRef.current)
		{
			initKeyboardHandlers()
			divRef.current.appendChild(renderer.domElement);
		}
		mainloop();
		return (() => {
			divRef.current?.removeChild(renderer.domElement)

			menu_scene.clean()
			game_scene.clean()
			renderer.dispose()

		});
	}, []);

	useEffect(() => {
		const twoFactorStatus = async () =>{
			try {//fetch 2fa Status
			  const enable2FAEndpoint = 'http://localhost:3001/2fa/status';
			  const response = await fetch(enable2FAEndpoint, {
				  method: 'GET',
				  credentials: 'include',
			  });
			  
			  if (response.ok) {
				  await response.text() === "true"?setTwoFactor(true):setTwoFactor(false)
			  } else {
				  console.error('Could not get the status of 2fa:', response.status);
			  }
		  } catch (error) {
			  console.error('Error enabling 2FA:', error);
		  }
	  };


		console.log(loginForm)
		if (loginForm === "Login") {
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
		if (loginForm === "Settings" && accessToken) {
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
		if (loginForm === "Profile" && accessToken) {
			const newFormContainer = document.createElement('div');
			const root = createRoot(newFormContainer);
			root.render(<Profile/>);
			document.body.appendChild(newFormContainer);
			return () => {
				setTimeout(() => {
				root.unmount();
				document.body.removeChild(newFormContainer);
				});
		  	};
		}
		twoFactorStatus();
		console.log("TWOFACTOR",twofactor)
		if (loginForm === "Login" || loginForm === "Login" && accessToken && twofactor){}
	}, [loginForm]);
	

	return (
		<div ref={divRef}>
			<div>
      			<div className="video-background">
        			<video autoPlay loop muted playsInline className="filtered-video">
          			<source src={process.env.PUBLIC_URL + './background/neon_bg.mp4'} type="video/mp4" />
          			Your browser does not support the video tag.
        			</video>
        		<div className="glass-overlay"></div>
      		</div>
    	</div>
		</div>
	);
}
