import React, { useRef, useEffect, useState } from 'react'
import * as THREE from "three";
import io from "socket.io-client";
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';

import { coolSocket, initKeyboardHandlers, JwtPayload } from './Utils'
import { create_menu_scene } from "./MenuScene";
import { create_game_scene } from "./GameScene";
import usePayload from '../react_hooks/use_auth'
import { createRoot } from 'react-dom/client';
import ProfileBar from '../components/profilebar/ProfileBar';
import RenderComponents from './Utils/render_component';

import { config } from '../config';
import { LoggedStatus } from './Utils/jwt.interface';
import MiniChatButton from '../components/minichat/ChatButton';
import createComponent from './Utils/createComponent';

const			accessToken = Cookies.get('access_token');
export const	socket = coolSocket(`${config.backend_url}/game`, accessToken);

export default function THREE_App(props: {
	toggleProfile: () => void,
	toggleChat: () => void,
	children: React.ReactNode
}) {
	const	divRef = useRef<HTMLDivElement>(null);
	const [loginForm, setLoginForm] = useState('')
	const	[showProfile, setShowProfile] = useState(false)
	let user = accessToken ? jwtDecode<JwtPayload>(accessToken) : null;
	const	[twofactor, setTwoFactor] = useState(user?.isTwoFactorAuthEnable)
	const [payload, updatePayload, handleUpdate] = usePayload();
	const [logged, setLogged] = useState(false)
	const cleanup: (() => void)[] = [];
	//Check if access token has expired remove token and reload page
	useEffect(()=>{
		console.log("What status are u: ",logged)
			setLogged(true)
		user = accessToken ? jwtDecode<JwtPayload>(accessToken) : null;
		if(user?.exp && user.exp < Date.now() / 1000){
			// fetchData()
			alert("Token expired");
			document.cookie = `access_token=; expires=${Date.now.toString()}; path=/;`;
			window.location.reload();
		}
	},[user && user.exp < Date.now() / 1000])

	useEffect(() => {
	  //const socket = io(`${config.backend_url}/game`,  { transports: ["websocket"] });

    const	renderer = new THREE.WebGLRenderer({alpha: true});
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.autoClear = false;
		
		const	buffer = new THREE.WebGLRenderTarget(25 * 512, (9 / 16) * 25 * 512);

		const game_scene = create_game_scene(renderer, buffer, socket);
		
		const	menu_scene = create_menu_scene(renderer, buffer.texture, payload, {
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
			const option = menu_scene.update()
			setLoginForm(option);
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
		handleUpdate()
	}, [loginForm]);
	RenderComponents(loginForm)
	useEffect(() =>{
		if(accessToken && payload?.authentication === LoggedStatus.Logged && loginForm != "Chat"){
			return createComponent(MiniChatButton);
		  }
	},[loginForm === "Chat"])
	
	return (
		<div ref={divRef} id="Canvas">
			<div>
      			<div className="video-background">
        			<video autoPlay loop muted playsInline className="filtered-video" id="background-video-scene">
          			<source src={process.env.PUBLIC_URL + './background/neon_bg.mp4'} type="video/mp4" />
          			Your browser does not support the video tag.
        			</video>
        			<div className="glass-overlay"></div>
      			</div>
    		</div>
    	</div>
	);
}
