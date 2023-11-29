import React, { useRef, useEffect, useState } from 'react'
import * as THREE from "three";
import io from "socket.io-client";

import { initKeyboardHandlers } from './Utils'

import { create_menu_scene } from "./MenuScene";
import { create_game_scene } from "./GameScene";

import { config } from '../config';

export default function	THREE_App(props:{
	toggleProfile: () => void,
	toggleChat: () => void,
	children:React.ReactNode}) {
	const	divRef = useRef<HTMLDivElement>(null);

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
		const	composer_clock = new THREE.Clock()

		const	menu_scene = create_menu_scene(renderer, {toggleProfile:props.toggleProfile, toggleChat:props.toggleChat})
		//const	game_scene = create_game_scene(renderer)

		//const	socket = io(`${config.backend_url}/game`, {transports: ["websocket"]});

		function	mainloop()
		{
			requestAnimationFrame(mainloop);
			//game_scene.update()
			menu_scene.update()
		}

		renderer.setSize(window.innerWidth, window.innerHeight);
		window.addEventListener('resize', (event: UIEvent) => {
			renderer.setSize(window.innerWidth, window.innerHeight)
		}, false);
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
			//game_scene.clean()
			renderer.dispose()

		});
	}, []);

	return (
		<div ref={divRef}>
			{props.children}
		</div>
	);
}
