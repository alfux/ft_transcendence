import React, { useRef, useEffect, useState } from 'react'
import * as THREE from "three";
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';

import {
  LoggedStatus,
  JwtPayload,
  
  RenderComponents,
  createComponent,

  clock
} from './Utils'
import { create_menu_scene } from "./MenuScene";
import { create_game_scene } from "./GameScene";
import usePayload from '../react_hooks/use_auth'

import MiniChatButton from '../components/minichat/ChatButton';
import { init_modules } from './GameScene/shaders';
import { config } from '../config';

export const accessToken = Cookies.get('access_token');

export default function THREE_App() {
	const divRef = useRef<HTMLDivElement>(null);

	const [loginForm, setLoginForm] = useState('')
	const [gameState, setGameState] = useState(false);

	let user = accessToken ? jwtDecode<JwtPayload>(accessToken) : null;
	const [payload, updatePayload, handleUpdate] = usePayload();
	const [logged, setLogged] = useState(false)
	const requestNewToken = async () =>{
		try {
		  const url = `${config.backend_url}/api/auth/refresh`;
		  console.log('Before fetch');
		  const response = await fetch(url, {
			  method: 'GET',
			  credentials: 'include',
		  });
		  if (response.ok) {
			const test = await response.json()
			console.log("AccessTokenRefreshed: ", test)
			// alert(console.log("AccessTokenRefreshed"))
		  } else {
			// alert(console.log("AccessToken Didnt not refreshed"))
			console.error('Could not get new AccessToken:', response.status);
		  }
	  } catch (error) {
		document.cookie = `access_token=; expires=${Date.now.toString()}; path=/;`;
			window.location.reload();
		  console.error('Error fetching new refresh Token:', error);
	  }
};
	//Check if access token has expired remove token and reload page
	useEffect(() => {
		setLogged(true)
		user = accessToken ? jwtDecode<JwtPayload>(accessToken) : null;
		if (user?.exp && user.exp < Date.now() / 1000) {
			// alert("Token expired");
			requestNewToken();

		}
	}, [user && user.exp < Date.now() / 1000])

	useEffect(() => {
    init_modules() //Pour les shaders, svp ne pas enlever

		const renderer = new THREE.WebGLRenderer({ alpha: true });
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.autoClear = false;

		const buffer = new THREE.WebGLRenderTarget(25 * 512, (9 / 16) * 25 * 512);
		const	mousecaster = new THREE.Vector2(0, 0);
		const	mousespeed = new THREE.Vector2(0, 0);

		const menu_scene = create_menu_scene(renderer, buffer.texture, payload, mousecaster, mousespeed, divRef.current);

		const game_scene = create_game_scene(renderer, buffer, mousecaster, mousespeed);

		function mainloop() {
			requestAnimationFrame(mainloop);
			
      clock.update();
			
      game_scene.update();

			const option = menu_scene.update()
			setLoginForm(option.option);
			setGameState(option.game);
		}

		if (divRef.current)
			divRef.current.appendChild(renderer.domElement);
		
    mainloop();
    
		return (() => {
			menu_scene.clean()
			game_scene.clean()
			renderer.dispose()
			buffer.dispose();
			divRef.current?.removeChild(renderer.domElement)
		});
	}, []);

	useEffect(() => {
		handleUpdate()
	}, [loginForm, gameState]);

	RenderComponents({ option: loginForm, game: gameState })
	
  useEffect(() => {
		if (accessToken && payload?.authentication === LoggedStatus.Logged && loginForm != "Chat") {
			return createComponent(MiniChatButton);
		}
	}, [loginForm === "Chat"])
	return (
		<div ref={divRef} id="Canvas">
			<div>
				<div className="glow-content">
    				<div className="glow-line-rose"></div>
    				<div className="glow-line-blue"></div>
					<div className="glow-line-rose-two"></div>
    				<div className="glow-line-blue-two"></div>
					<div className="glow-line-rose-invert-one"></div>
    				<div className="glow-line-blue-invert-one"></div>
					<div className="glow-line-rose-invert-two"></div>
    				<div className="glow-line-blue-invert-two"></div>
				</div>
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
