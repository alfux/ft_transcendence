import React, { useRef, useEffect, useState } from 'react'
import * as THREE from "three";
import io from "socket.io-client";

import { initKeyboardHandlers } from './Utils'

import { create_menu_scene } from "./MenuScene";
import { create_game_scene } from "./GameScene";

import { Profile } from './ReactUI/Profile';

export default function	THREE_App() {
	const	divRef = useRef<HTMLDivElement>(null);

	const	[showProfile, setShowProfile] = useState(false)

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
		//const	game_scene = create_game_scene(renderer)

		const	socket = io("http://10.18.202.182:3001", {transports: ["websocket"]});

		function	mainloop()
		{
			requestAnimationFrame(mainloop);
			//game_scene.update()
			menu_scene.update()
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
			//game_scene.clean()
			renderer.dispose()

		});
	}, []);

	return (
		<div ref={divRef}>
			{showProfile ? <Profile /> : null }
		</div>
	);
}
