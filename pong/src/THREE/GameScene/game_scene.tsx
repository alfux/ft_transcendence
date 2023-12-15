import * as THREE from 'three';
import { loadObj } from '../Utils/loader';

import { Ball } from './ball';
import { Obstacle } from './obstacle';
import { GameBoard } from './gameboard';
import { Vec3, rotz, rotx } from '../Math';
import { clock } from '../Utils';

import { keyboard } from '../Utils/keyboard';

import { gameSocket } from '../../sockets';
import { CustomLightingShader, spin_fragment, spin_vertex } from './shaders';

export function create_game_scene(renderer: THREE.WebGLRenderer, target: THREE.WebGLRenderTarget, mousecast: THREE.Vector2) {
	const camera = new THREE.PerspectiveCamera(45, 16 / 9, 0.1, 1000);
	//camera.position.set(0, -2, 2);
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

		const spin_geometry = new THREE.IcosahedronGeometry(1, 30)
		const spin_mat = new CustomLightingShader({
			vertexShader: spin_vertex,
			fragmentShader: spin_fragment,
			uniforms: {
			  time: { value: 0 },
			  spin: { value: board.ball.spin },
			  spin_height: { value: 1 },
        noise_freq: { value: 3 },
        spin_color: { value: new THREE.Vector3(1, 1, 1) },
        max_alpha: { value: 0.8 }
			},
      transparent:true,
      side: THREE.DoubleSide
			//wireframe: true
		  })

		const spin = new THREE.Mesh(spin_geometry, spin_mat)
    spin.position.set(0, 0, 0)
    spin.scale.set(0.9, 0.9, 0.9)
    spin.name = "spin_effect"
    board.ball.gameObject?.add(spin)

	});
	board.ball.speed.set(20, 0, 0);

	const	mouse_plane = new THREE.PlaneGeometry(32, 18, 1, 1);
	const	mouse_material = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.1});
	const	mouse_mesh = new THREE.Mesh(mouse_plane, mouse_material);
	const scene = new THREE.Scene();
	scene.add(game_parent, ambient, mouse_mesh);

	const	raycaster = new THREE.Raycaster();

	window.addEventListener("pointermove", handlePointer);

	gameSocket.on("player_pos", updateRackets);
	gameSocket.on("ball_pos", updateBallPos);

	function	handlePointer(event: PointerEvent) {
		raycaster.setFromCamera(mousecast, camera);
		const	intersect = raycaster.intersectObject(mouse_mesh);
		gameSocket.emit("pointer", {
			x: intersect[0]?.point.x,
			y: intersect[0]?.point.y
		});
		if (event.buttons === 1) {
			const cpos = new Vec3(camera.position.x, camera.position.y, camera.position.z);
			const tmp = rotx(cpos, -event.movementY / 1000);
			const npos = rotz(tmp, -event.movementX / 1000);

			camera.position.set(npos.x, npos.y, npos.z);
			camera.lookAt(0, 0, 0);
		}
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
      
      const spin_effect = board.ball.gameObject?.getObjectByName("spin_effect") as THREE.Mesh<THREE.IcosahedronGeometry, CustomLightingShader>
      spin_effect.material.uniforms.spin.value = board.ball.spin
		}
	}


	function update() {
		if (Object.keys(keyboard.key).length !== 0) {
			gameSocket.emit("player_input", keyboard);
		}

    const spin_effect = board.ball.gameObject?.getObjectByName("spin_effect") as THREE.Mesh<THREE.IcosahedronGeometry, CustomLightingShader>
    if (spin_effect)
      spin_effect.material.uniforms.time.value = clock.clock.getElapsedTime()

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
