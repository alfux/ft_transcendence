import React, { useRef, useEffect, useState } from 'react'
import * as THREE from "three";
import io from "socket.io-client";

import { initKeyboardHandlers } from './Utils'

import { create_menu_scene } from "./MenuScene";
import { create_game_scene } from "./GameScene";

import { config } from '../config';

export default function THREE_App(props: {
	toggleProfile: () => void,
	toggleChat: () => void,
	children: React.ReactNode
}) {

	const divRef = useRef<HTMLDivElement>(null);

	const [showProfile, setShowProfile] = useState(false)

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
		get_token()
		const socket = io(`${config.backend_url}/game`, { transports: ["websocket"] });
		socket.emit("authentification", localStorage.getItem("token"))

		const	renderer = new THREE.WebGLRenderer();
		renderer.setSize(window.innerWidth, window.innerHeight);
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
			divRef.current?.removeChild(renderer.domElement);

			menu_scene.clean();
			game_scene.clean();
			renderer.dispose();
			buffer.dispose();
		});
	}, []);

	return (
		<div ref={divRef} id="Canvas">
			{props.children}
		</div>
	);
}
