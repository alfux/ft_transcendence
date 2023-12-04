import * as THREE from 'three';
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer"
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass"
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass"
import { load_obj } from '../Utils/loader';

import { Ball } from './ball';
import { Obstacle } from './obstacle';
import { GameBoard } from './gameboard';
import { Vec3, rotz, rotx} from '../Math';

import { getActiveKeys } from '../Utils/keyboard';
import { CoolSocket } from '../Utils/socket';

export function create_game_scene(renderer: THREE.WebGLRenderer, target: THREE.WebGLRenderTarget, socket: CoolSocket)
{
	const	camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, -30, 30);
	camera.up.set(0, 0, 1);
    camera.lookAt(0, 0, 0);

	const	ambient = new THREE.AmbientLight(0xffffff, 1);
	ambient.position.set(0, 0, 2);
    
    const	board = new GameBoard();
    board.ball.speed.set(20, 0, 0);

    const	game_parent = new THREE.Group();
    load_obj(game_parent, "meshes/game.glb", [0,0,0], [0,0,0], (o) => {
		board.left_racket.gameObject = game_parent.children[0].children[0]
		board.right_racket.gameObject = game_parent.children[0].children[1]
		
		board.ball.gameObject = game_parent.children[0].children[2]

		//Peut etre l'inverse, je sais pas
		board.lower_border.gameObject = game_parent.children[0].children[3]
		board.upper_border.gameObject = game_parent.children[0].children[4]
	});

    const	scene = new THREE.Scene();
    scene.add(game_parent, ambient);

	const	render_pass = new RenderPass(scene, camera);
	const	bloom_pass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 3, 0.1, 0.1);
    
    const	clock = new THREE.Clock();
    let     delta_time = clock.getDelta()


	let		start = false;

	const	plane = new THREE.PlaneGeometry(window.innerWidth / 50, window.innerHeight / 50, 10, 10);
	const	texture = new THREE.MeshPhongMaterial({map: composer.readBuffer.texture});
	const	screen_plane = new THREE.Mesh(plane, texture);
	screen_plane.position.set(0, 0, 10);

	//const	main_camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
	const	main_camera = new THREE.OrthographicCamera(
		-window.innerWidth / 100, window.innerWidth / 100,
		window.innerHeight / 100, -window.innerHeight / 100, 0.1, 10
	);
	main_camera.position.set(0, 0, 20);
	main_camera.lookAt(0, 0, 0);

	const	main_ambient = new THREE.AmbientLight(0xffffff, 1);

	const	main_stage = new THREE.Scene();
	main_stage.background = new THREE.Color(0xffffff);
	main_stage.add(screen_plane, main_ambient);
	
	//composer.addPass(render_pass);
	//composer.addPass(bloom_pass);

	function contextMenuHandler(event: MouseEvent) {
		return (event.preventDefault());
	}
	function pointerMoveHandler(event: PointerEvent) {
		if (event.buttons)
		{
			const	cpos = new Vec3(camera.position.x, camera.position.y, camera.position.z);
			const	tmp = rotx(cpos, -event.movementY / 1000);
			const	npos = rotz(tmp, -event.movementX / 1000);
			
			camera.position.set(npos.x, npos.y, npos.z);
			camera.lookAt(0, 0, 0);
		}
	}

	window.addEventListener("contextmenu", contextMenuHandler);
	window.addEventListener("pointermove", pointerMoveHandler);
	socket.on("start", handleStart);
	socket.on("player_pos", updateRackets);
	socket.on("ball_pos", updateBallPos)

	function	handleStart() {
		//animation gamestart
		start = true
	}

	function	updateScore() {
		//scorePrint.removeChild(score);
		//score = document.createTextNode(s1 + " : " + s2);
		//scorePrint.appendChild(score);
	}

    function	updateRackets(positions: {
		you: Obstacle,
		opponent: Obstacle
	})
    {
        board.right_racket.copy(positions.you)
		if (board.right_racket.gameObject)
			board.right_racket.gameObject.position.y = board.right_racket.position.y;
	
		board.right_racket.copy(positions.opponent)
        board.left_racket = positions.opponent;
		if (board.left_racket.gameObject)
        	board.left_racket.gameObject.position.y = board.left_racket.position.y;
    }

	function updateBallPos(ball:Ball) {
		if (board.ball.gameObject) {
			ball.gameObject = board.ball.gameObject
			board.ball = ball
		}
	}
/*
    function	moveBall(t: boolean)
    {
        let	imp;

        game_parent.children[0].children[2].position.x += delta_time * board.ball.speed.x;
        game_parent.children[0].children[2].position.y += delta_time * board.ball.speed.y;
		if (game_parent.children[0].children[2].position.x > 16)
		{
			++s1;
			updateScore();
			game_parent.children[0].children[2].position.set(0, 0, 0);
		}
		else if (game_parent.children[0].children[2].position.x < -16)
		{
			++s2;
			updateScore();
			game_parent.children[0].children[2].position.set(0, 0, 0);
		}
        board.ball.position.x = game_parent.children[0].children[2].position.x;
        board.ball.position.y = game_parent.children[0].children[2].position.y;
        imp = impact(board.ball, board.upper_border);
        if (imp !== undefined)
            bounce(board.ball, board.upper_border, imp);
        imp = impact(board.ball, board.lower_border);
        if (imp !== undefined)
            bounce(board.ball, board.lower_border, imp);
        imp = impact(board.ball, board.left_racket);
        if (imp !== undefined)
            bounce(board.ball, board.left_racket, imp);
        imp = impact(board.ball, board.right_racket);
        if (imp !== undefined)
            bounce(board.ball, board.right_racket, imp);
    }
	let	rota = 0;
	*/
    function update()
	{
		const active_keys = getActiveKeys()
		if (Object.keys(active_keys).length !== 0) {
			console.log(active_keys)
			socket.emit("player_input", active_keys);
		}

		if (board.ball.gameObject)
			board.ball.gameObject.position.set(board.ball.position.x, board.ball.position.y, board.ball.position.z)

		renderer.setRenderTarget(target);
		renderer.clear();
		renderer.render(scene, camera);
		renderer.setRenderTarget(null);
    }

    return {
        update:update,
        clean: () => {

			window.removeEventListener("contextmenu", contextMenuHandler);
			window.removeEventListener("pointermove", pointerMoveHandler);
			socket.off("start", handleStart)
			socket.off("player_pos", updateRackets)

            scene.traverse((obj: any) =>
            {
                if (obj instanceof THREE.Mesh)
                {
                    obj.geometry.dispose();
                    obj.material.dispose();
                }
            });
			render_pass.dispose();
			bloom_pass.dispose();
			//canvas?.removeChild(scorePrint);
        }
    }
}
