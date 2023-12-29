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
import { FetchError, backend_fetch } from '../components/backend_fetch';
import { createRoot } from 'react-dom/client';
import MiniChat from '../components/minichat/MiniChat';

export let accessToken = Cookies.get('access_token');

export default function THREE_App() {
	const divRef = useRef<HTMLDivElement>(null);

	const [loginForm, setLoginForm] = useState('')
	const [gameState, setGameState] = useState(false);
	const [isBroken, setIsBroken] = useState(false)
	let refreshStatus : boolean = false;
	let user = accessToken ? jwtDecode<JwtPayload>(accessToken) : null;
	const [payload, updatePayload, handleUpdate] = usePayload();
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
			accessToken = Cookies.get('access_token');
			user = accessToken ? jwtDecode<JwtPayload>(accessToken) : null;
			
		  } else {
			document.cookie = `access_token=; expires=${Date.now.toString()}; path=/;`;
			window.location.reload();
			console.error('Could not get new AccessToken:', response.status);
		  }
	  } catch (error) {
		document.cookie = `access_token=; expires=${Date.now.toString()}; path=/;`;
			window.location.reload();
		  console.error('Error fetching new refresh Token:', error);
	  }
};
	useEffect(() => {
		init_modules() //Pour les shaders, svp ne pas enlever

		let renderer: THREE.WebGLRenderer;
		try {
			renderer = new THREE.WebGLRenderer({ alpha: true });
		} catch {
			setIsBroken(true)
			return
		}
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.autoClear = false;

		const buffer = new THREE.WebGLRenderTarget(25 * 512, (9 / 16) * 25 * 512);
		const mousecaster = new THREE.Vector2(0, 0);
		const mousespeed = new THREE.Vector2(0, 0);

		const menu_scene = create_menu_scene(renderer, buffer.texture, payload, mousecaster, mousespeed, divRef.current);

		const game_scene = create_game_scene(renderer, buffer, mousecaster, mousespeed);

		function mainloop() {
			let option;

			clock.update();
			requestAnimationFrame(mainloop);
			game_scene.update();
			option = menu_scene.update();
			setLoginForm(option.option);
			setGameState(option.game);
		}

		function refreshUserToken() {
				// console.log("Refreshing...");
				if (accessToken){
					requestNewToken();
				}
		}
		
		setInterval(refreshUserToken, 5000);
		if (divRef.current)
			divRef.current!.appendChild(renderer.domElement);

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
		else{
			if (accessToken && payload?.authentication === LoggedStatus.Logged && loginForm === "Chat"){
				const newFormContainer = document.createElement('div');
				const root = createRoot(newFormContainer);
				root.render(<MiniChat width='75%' height='76%' bottom="8%" right="25%" />);
				document.body.appendChild(newFormContainer);
				return () => {
					const cleanupTimeout = setTimeout(() => {
					  root.unmount();
					  document.body.removeChild(newFormContainer);
					}, 100);
					return () => clearTimeout(cleanupTimeout);
				  };
			}
		}
	}, [loginForm == "Chat"])


	if (isBroken) {
		return <p style={{textAlign: 'center', fontFamily: 'monospace'}}>{'Good job ! You broke everything ! >:( Now please fix this by closing this tab and reopening a new one'}</p>
	}

	return (
		<div id="main-container">
			<div ref={divRef} id="Canvas" className="Canvas">
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
			</div>
			<div id="audio" />
		</div>
	);
}
