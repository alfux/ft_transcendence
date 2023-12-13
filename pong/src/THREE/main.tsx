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

export const accessToken = Cookies.get('access_token');

export default function THREE_App() {
	const divRef = useRef<HTMLDivElement>(null);

	const [loginForm, setLoginForm] = useState('')
	const [gameState, setGameState] = useState(false);

	let user = accessToken ? jwtDecode<JwtPayload>(accessToken) : null;
	const [payload, updatePayload, handleUpdate] = usePayload();
	const [logged, setLogged] = useState(false)

	//Check if access token has expired remove token and reload page
	useEffect(() => {
		console.log("What status are u: ", logged)
		setLogged(true)
		user = accessToken ? jwtDecode<JwtPayload>(accessToken) : null;
		if (user?.exp && user.exp < Date.now() / 1000) {
			// fetchData()
			alert("Token expired");
			document.cookie = `access_token=; expires=${Date.now.toString()}; path=/;`;
			window.location.reload();
		}
	}, [user && user.exp < Date.now() / 1000])

	useEffect(() => {

		const renderer = new THREE.WebGLRenderer({ alpha: true });
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.autoClear = false;

		const buffer = new THREE.WebGLRenderTarget(25 * 512, (9 / 16) * 25 * 512);
		const game_scene = create_game_scene(renderer, buffer);

		const menu_scene = create_menu_scene(renderer, buffer.texture, payload);

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
