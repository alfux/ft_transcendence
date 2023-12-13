import * as THREE from 'three';
import { loadObj } from '../Utils/loader';

import { Ball } from './ball';
import { Obstacle } from './obstacle';
import { GameBoard } from './gameboard';
import { Vec3, distance, scalaire, norm, Mat3, rotz, rotx } from '../Math';

import { keyboard } from '../Utils/keyboard';
import { Socket } from 'socket.io-client';

import { clock } from "../Utils/clock";
import { gameSocket } from '../../sockets';

export function create_game_scene(renderer: THREE.WebGLRenderer, target: THREE.WebGLRenderTarget) {
	const	camera = new THREE.PerspectiveCamera(45, 16 / 9, 0.1, 1000);
    camera.position.set(0, -30, 30);
	camera.up.set(0, 0, 1);
	camera.lookAt(0, 0, 0);

	const ambient = new THREE.AmbientLight(0xffffff, 1);
	ambient.position.set(0, 0, 2);

	const board = new GameBoard();
	const game_parent = new THREE.Group();
	loadObj(game_parent, "meshes/game.glb", (group) => {
		board.set({
			ball: group.getObjectByName("Ball"),
			lr: group.getObjectByName("LRacket"),
			rr: group.getObjectByName("RRacket")
		});
	});
	board.ball.speed.set(20, 0, 0);

	const scene = new THREE.Scene();
	scene.add(game_parent, ambient);

	const clock = new THREE.Clock();
	let delta_time = clock.getDelta()

	let start = false;

	window.addEventListener("pointermove", (event) => {
		if (event.buttons === 1) {
			const cpos = new Vec3(camera.position.x, camera.position.y, camera.position.z);
			const tmp = rotx(cpos, -event.movementY / 1000);
			const npos = rotz(tmp, -event.movementX / 1000);

			camera.position.set(npos.x, npos.y, npos.z);
			camera.lookAt(0, 0, 0);
		}
	});

	gameSocket.on("start", handleStart);
	gameSocket.on("player_pos", updateRackets);
	gameSocket.on("ball_pos", updateBallPos);
	gameSocket.on("finish", handleFinish);

	function handleStart() {
		start = true;
	}

	function	handleFinish() {
		start = false;
		if (board.right_racket.gameObject)
			board.right_racket.gameObject.position.y = 0;
		if (board.left_racket.gameObject)
			board.left_racket.gameObject.position.y = 0;
	}

	function updateRackets(positions: {
		you: Obstacle,
		opponent: Obstacle
	}) {
		board.right_racket.copy(positions.you)
			if (board.right_racket.gameObject)
				board.right_racket.gameObject.position.y = board.right_racket.position.y;
		board.left_racket.copy(positions.opponent)
			if (board.left_racket.gameObject)
				board.left_racket.gameObject.position.y = board.left_racket.position.y;
	}

	function updateBallPos(ball: Ball) {
		if (board.ball.gameObject) {
			ball.gameObject = board.ball.gameObject;
			board.ball = ball;
			board.ball.gameObject?.position.set(board.ball.position.x, board.ball.position.y, board.ball.position.z);
		}
	}


	function update() {
		if (Object.keys(keyboard.key).length !== 0) {
			gameSocket.emit("player_input", keyboard);
		}

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
		}
	}
}
