import React, { useRef, useEffect, useState } from 'react'
import * as THREE from "three";
import io from "socket.io-client";
import jwt, { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';
import { initKeyboardHandlers } from './Utils'
import JwtPayload from './Utils/jwt.interface';
import { create_menu_scene } from "./MenuScene";
import { create_game_scene } from "./GameScene";
import { config } from '../config';
import usePayload from '../react_hooks/use_auth'
// import { Profile } from './ReactUI/Profile';
import Profile from '../components/profile/Profile'

import Login from '../components/login/Login'
import Settings from '../components/settings/Settings'
import { createRoot } from 'react-dom/client';
import { access } from 'fs';
import { fetchData } from './Utils/api';
import TwoFactorAuthenticate from '../components/twofactorauthenticate/TwoFactorAuthenticate';
import Logout from '../components/logout/Logout';
import ProfileBar from '../components/profilebar/ProfileBar';
export default function THREE_App(props: {
	toggleProfile: () => void,
	toggleChat: () => void,
	children: React.ReactNode
}) {
	const	divRef = useRef<HTMLDivElement>(null);
	const [loginForm, setLoginForm] = useState('')
	const	[showProfile, setShowProfile] = useState(false)
	let accessToken = Cookies.get('access_token');
	let user = accessToken ? jwtDecode<JwtPayload>(accessToken) : null;
	const	[twofactor, setTwoFactor] = useState(user?.isTwoFactorAuthEnable)
	const [payload, updatePayload,handleUpdate] = usePayload();
	const [logged,setLogged] = useState(false)
	
//logout || refresh token
	// useEffect(()=>{
	// 	console.log("What status are u: ",logged)
	// 		setLogged(true)
	// 	user = accessToken ? jwtDecode<JwtPayload>(accessToken) : null;
	// 	if(user?.exp && user?.exp < Date.now() / 1000){
	// 		// fetchData()
	// 		alert("Token expired");
	// 		// document.cookie = `access_token=; expires=${Date.now.toString()}; path=/;`;
	// 		// window.location.reload();
	// 	}
	// },[loginForm])

	function get_token() {
		const urlParams = new URLSearchParams(window.location.search)
		const token = urlParams.get('code')
		if (token) {
			localStorage.setItem('token', token)
			const newURL = window.location.href.replace(window.location.search, '')
			window.history.replaceState({}, document.title, newURL)
		}
	}

	useEffect(() => {
		get_token();
		const socket = io(`${config.backend_url}/game`, { transports: ["websocket"] });
		socket.emit("authentification", localStorage.getItem("token"))

		const	renderer = new THREE.WebGLRenderer();
		renderer.setSize(window.innerWidth / 2, window.innerHeight / 2);
		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.autoClear = false;
		
		const	buffer = new THREE.WebGLRenderTarget(25 * 512, (9 / 16) * 25 * 512);

		const game_scene = create_game_scene(renderer, buffer, socket);
		
		const	menu_scene = create_menu_scene(renderer, buffer.texture, {
			toggleProfile: () => {
				setShowProfile((prev) => {
					console.log(prev);
					return !prev
				})
			},
		}, socket);


		function mainloop() {
			requestAnimationFrame(mainloop);
			game_scene.update();
			menu_scene.update();
			//			console.log(showProfile);
		}


		if (divRef.current) {
			initKeyboardHandlers();
			divRef.current.appendChild(renderer.domElement);
		}
		mainloop();
		return (() => {
			divRef.current?.removeChild(renderer.domElement)

			menu_scene.clean()
			game_scene.clean()
			renderer.dispose()
			buffer.dispose();
		});
	}, []);

	useEffect(() => {
		if (accessToken && payload?.authentication == "Complete" && loginForm != "Profile"){
			const newFormContainer = document.createElement('div');
			const root = createRoot(newFormContainer);
			root.render(<ProfileBar/>);
			console.log("payload: ", payload?.authentication)
			document.body.appendChild(newFormContainer);
			return () => {
				setTimeout(() => {
				root.unmount();
				document.body.removeChild(newFormContainer);
				});
		  	};
		}
	},[loginForm === "Profile"]);

	useEffect(() => {
		handleUpdate()
		console.log("Payload:", payload)
		console.log(loginForm)
		if (loginForm === "Login" && !accessToken) {
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
			root.render(<Settings/>);
			document.body.appendChild(newFormContainer);
			return () => {
				setTimeout(() => {
				root.unmount();
				document.body.removeChild(newFormContainer);
				});
		  	};
		}

		// if (loginForm === "Logout" && accessToken && payload?.authentication === "Complete") {
		// 	const newFormContainer = document.createElement('div');
		// 	const root = createRoot(newFormContainer);
		// 	root.render(<Logout/>);
		// 	document.body.appendChild(newFormContainer);
		// 	return () => {
		// 		setTimeout(() => {
		// 		root.unmount();
		// 		document.body.removeChild(newFormContainer);
		// 		});
		//   	};
		// }
		if (accessToken && payload?.isTwoFactorAuthEnable && payload.authentication === "Incomplete"){
			const newFormContainer = document.createElement('div');
			const root = createRoot(newFormContainer);
			root.render(<TwoFactorAuthenticate/>);
			document.body.appendChild(newFormContainer);
			return () => {
				setTimeout(() => {
				root.unmount();
				document.body.removeChild(newFormContainer);
				});
		  	};
		}
		//loginForm === "Profile" && 
		if (loginForm === "Profile" && accessToken && payload?.authentication === "Complete") {
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
	}, [loginForm]);
	

	return (
		<div ref={divRef} id="Canvas">
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
