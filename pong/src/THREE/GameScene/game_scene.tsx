import * as THREE from 'three';
import { loadObj } from '../Utils/loader';

import { Ball } from './ball';
import { Obstacle } from './obstacle';
import { GameBoard } from './gameboard';
import { Vec3, distance, scalaire, norm, Mat3, rotz, rotx } from '../Math';

import { keyboard } from '../Utils/keyboard';
import { Socket } from 'socket.io-client';

export function create_game_scene(renderer: THREE.WebGLRenderer, target: THREE.WebGLRenderTarget, socket: Socket) {
	const camera = new THREE.PerspectiveCamera(45, 16 / 9, 0.1, 1000);
	camera.position.set(0, -30, 30);
	camera.up.set(0, 0, 1);
	camera.lookAt(0, 0, 0);

	const ambient = new THREE.AmbientLight(0xffffff, 1);
	ambient.position.set(0, 0, 2);

	const game_parent = new THREE.Group();
	loadObj(game_parent, "meshes/game.glb");

	const scene = new THREE.Scene();
	scene.add(game_parent, ambient);

	const clock = new THREE.Clock();
	let delta_time = clock.getDelta()

	const board = new GameBoard();
	board.ball.speed.set(20, 0, 0);

	let start = false;

	//const	canvas = document.getElementById("Canvas");
	//const	scorePrint = document.createElement("h1");
	let s1 = 0;
	let s2 = 0;
	//let		score = document.createTextNode(s1 + " : " + s2);
	//scorePrint.style.color = "white";
	//scorePrint.appendChild(score);
	//canvas?.appendChild(scorePrint);

	window.addEventListener("pointermove", (event) => {
		if (event.buttons === 1) {
			const cpos = new Vec3(camera.position.x, camera.position.y, camera.position.z);
			const tmp = rotx(cpos, -event.movementY / 1000);
			const npos = rotz(tmp, -event.movementX / 1000);

			camera.position.set(npos.x, npos.y, npos.z);
			camera.lookAt(0, 0, 0);
		}
	});
	socket.on("start", handleStart);
	socket.on("player_pos", updateRackets);
	socket.on("ball_pos", updateBallPos)

	function handleStart() {
		start = true;
	}

	function updateScore() {
		//scorePrint.removeChild(score);
		//score = document.createTextNode(s1 + " : " + s2);
		//scorePrint.appendChild(score);
	}

	function updateRackets(positions: {
		you: Obstacle,
		opponent: Obstacle
	}) {
		board.right_racket.copy(positions.you)
		if (board.right_racket.gameObject)
			board.right_racket.gameObject.position.y = board.right_racket.position.y;

		board.right_racket.copy(positions.opponent)
		board.left_racket = positions.opponent;
		if (board.left_racket.gameObject)
			board.left_racket.gameObject.position.y = board.left_racket.position.y;
	}

	function updateBallPos(ball: Ball) {
		if (board.ball.gameObject) {
			ball.gameObject = board.ball.gameObject
			board.ball = ball
		}
	}


	function update() {
		//if (1 && camera.position.z > 30)
		//{
		//	camera.position.z -= 2.5;
		//	camera.position.y += 2.5;
		//	scene.rotation.z += 2 * 2.5 * Math.PI / 270;
		//}
		renderer.setRenderTarget(target);
		renderer.clear();
		renderer.render(scene, camera);
		renderer.setRenderTarget(null);
	}

	return {
		update: update,
		clean: () => {
			scene.traverse((obj: any) => {
				if (obj instanceof THREE.Mesh) {
					obj.geometry.dispose();
					obj.material.dispose();
				}
			});
			//canvas?.removeChild(scorePrint);
		}
	}
}
