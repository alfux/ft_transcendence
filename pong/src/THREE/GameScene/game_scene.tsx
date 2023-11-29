import * as THREE from 'three';
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js"
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js"
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js"
import { load_obj } from '../Utils/loader';

import { Ball } from './ball';
import { Obstacle } from './obstacle';
import { GameBoard } from './gameboard';
import { Vec3, distance, scalaire, norm, Mat3, rotz, rotx} from '../Math';

import { keyboard } from '../Utils/keyboard';
import { Socket } from 'socket.io-client';

function	impact(ball: Ball, obstacle: Obstacle)
{
	const	d = new Vec3(
		obstacle.direction.y,
		-obstacle.direction.x,
		(obstacle.direction.y * (obstacle.position.x - ball.position.x)
		- obstacle.direction.x * (obstacle.position.y - ball.position.y))
	);
	const	sol1 = new Vec3();
	const	sol2 = new Vec3();
	const	delta = new Vec3();

	if (d.x !== 0)
	{
		delta.z = 4 * d.x * d.x * ((d.x * d.x + d.y * d.y) * ball.radius - d.z * d.z);
		if (delta.z < 0)
			return (undefined);
		sol1.y = (2 * d.y * d.z + Math.sqrt(delta.z)) / (2 * (d.x * d.x + d.y * d.y));
		sol1.x = (d.z - d.y * sol1.y) / d.x;
		sol1.x += ball.position.x;
		sol1.y += ball.position.y;
		if (delta.z === 0)
			return ((distance(sol1, obstacle.position) > obstacle.radius) ? undefined : sol1);
		sol2.y = (2 * d.y * d.z - Math.sqrt(delta.z)) / (2 * (d.x * d.x + d.y * d.y));
		sol2.x = (d.z - d.y * sol2.y) / d.x;
		sol2.x += ball.position.x;
		sol2.y += ball.position.y;
		delta.x = distance(sol1, obstacle.position);
		delta.y = distance(sol2, obstacle.position);
		if (delta.x <= obstacle.radius && delta.y <= obstacle.radius)
		{
			sol1.x = (sol1.x + sol2.x) / 2;
			sol1.y = (sol1.y + sol2.y) / 2;
			return (sol1);
		}
		else if (delta.x <= obstacle.radius)
			return (sol1);
		else if (delta.y <= obstacle.radius)
			return (sol2);
		else
			return (undefined);
	}
	else if (d.y !== 0)
	{
		delta.z = 4 * d.y * d.y * ((d.x * d.x + d.y * d.y) * ball.radius - d.z * d.z);
		if (delta.z < 0)
			return (undefined);
		sol1.x = (2 * d.x * d.z + Math.sqrt(delta.z)) / (2 * (d.x * d.x + d.y * d.y));
		sol1.y = (d.z - d.x * sol1.x) / d.y;
		sol1.x += ball.position.x;
		sol1.y += ball.position.y;
		if (delta.z === 0)
			return ((distance(sol1, obstacle.position) > obstacle.radius) ? undefined : sol1);
		sol2.x = (2 * d.x * d.z - Math.sqrt(delta.z)) / (2 * (d.x * d.x + d.y * d.y));
		sol2.y = (d.z - d.x * sol2.x) / d.y;
		sol2.x += ball.position.x;
		sol2.y += ball.position.y;
		delta.x = distance(sol1, obstacle.position);
		delta.y = distance(sol2, obstacle.position);
		if (delta.x <= obstacle.radius && delta.y <= obstacle.radius)
		{
			sol1.x = (sol1.x + sol2.x) / 2;
			sol1.y = (sol1.y + sol2.y) / 2;
			return (sol1);
		}
		else if (delta.x <= obstacle.radius)
			return (sol1);
		else if (delta.y <= obstacle.radius)
			return (sol2);
		else
			return (undefined);
	}
	else
		return (undefined);

}

function    manageSpin(ball: Ball, obstacle: Obstacle, tmp: Vec3)
{
	const	way = new Vec3(
		Math.sign(obstacle.speed ? obstacle.speed : 1) * obstacle.direction.x,
		Math.sign(obstacle.speed ? obstacle.speed : 1) * obstacle.direction.y,
		Math.sign(obstacle.speed ? obstacle.speed : 1) * obstacle.direction.z
	);
	const	spin = scalaire(ball.speed, way) / norm(ball.speed);
    tmp.set(
        tmp.x + Math.abs(obstacle.speed - ball.spin) * Math.sign(-ball.spin ? -ball.spin : 1) * way.x,
        tmp.y + Math.abs(obstacle.speed - ball.spin) * Math.sign(-ball.spin ? -ball.spin : 1) * way.y,
        tmp.z + Math.abs(obstacle.speed - ball.spin) * Math.sign(-ball.spin ? -ball.spin : 1) * way.z
    );
    ball.spin = ((1 - spin) * obstacle.speed + ball.spin) / 2;
}


function	bounce(ball: Ball, obstacle: Obstacle, imp: Vec3)
{
	const	normal = new Vec3(ball.position.x - imp.x, ball.position.y - imp.y, ball.position.z - imp.z);
	const	nspeed = norm(ball.speed);
	let		tmp = new Vec3();
	let		n = norm(normal);

	normal.set(normal.x / n, normal.y / n, normal.z / n);
	n = scalaire(ball.speed, normal);
	if (n > 0)
		return ;
	normal.set(-normal.x * n, -normal.y * n, -normal.z * n);
	tmp.set(
		2 * normal.x + ball.speed.x,
		2 * normal.y + ball.speed.y,
		2 * normal.z + ball.speed.z
	);
	manageSpin(ball, obstacle, tmp);
	n = norm(tmp);
	ball.speed.set(nspeed * tmp.x / n, nspeed * tmp.y / n, nspeed * tmp.z / n);
}

export function create_game_scene(renderer: THREE.WebGLRenderer, composer: EffectComposer, socket: Socket)
{
	const	camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, -300, 300);
	camera.up.set(0, 0, 1);
    camera.lookAt(0, 0, 0);

	const	ambient = new THREE.AmbientLight(0xffffff, 1);
	ambient.position.set(0, 0, 2);
    
    const	game_parent = new THREE.Group();
    load_obj(game_parent, "meshes/game.glb");

    const	scene = new THREE.Scene();
    scene.add(game_parent, ambient);

	const	render_pass = new RenderPass(scene, camera);
	const	bloom_pass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 3, 0.1, 0.1);
    
    const	clock = new THREE.Clock();
    let     delta_time = clock.getDelta()

    const	board = new GameBoard();
    board.ball.speed.set(20, 0, 0);

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

	//const	canvas = document.getElementById("Canvas");
	//const	scorePrint = document.createElement("h1");
	let		s1 = 0;
	let		s2 = 0;
	//let		score = document.createTextNode(s1 + " : " + s2);
	//scorePrint.style.color = "white";
	//scorePrint.appendChild(score);
	//canvas?.appendChild(scorePrint);
	
	composer.addPass(render_pass);
	composer.addPass(bloom_pass);

	window.addEventListener("contextmenu", (event) => {return (event.preventDefault());});
	window.addEventListener("pointermove", (event) =>
	{
		if (event.buttons)
		{
			const	cpos = new Vec3(camera.position.x, camera.position.y, camera.position.z);
			const	tmp = rotx(cpos, -event.movementY / 1000);
			const	npos = rotz(tmp, -event.movementX / 1000);
			
			camera.position.set(npos.x, npos.y, npos.z);
			camera.lookAt(0, 0, 0);
		}
	});
	socket.on("start", handleStart);
	socket.on("player_pos", updateLRacket);

	function	handleStart() {
		start = true;
	}

	function	updateScore() {
		//scorePrint.removeChild(score);
		//score = document.createTextNode(s1 + " : " + s2);
		//scorePrint.appendChild(score);
	}

    function	updateRRacket() {
		socket.emit("player_input", keyboard);
    }

    function	updateLRacket(pos: {x: number, y: number})
    {
        board.left_racket.position.y = pos.y;
        game_parent.children[0].children[0].position.y = board.left_racket.position.y;
    }

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
    function update()
	{
		if (1 && camera.position.z > 30)
		{
			camera.position.z -= 2.5;
			camera.position.y += 2.5;
			scene.rotation.z += 2 * 2.5 * Math.PI / 270;
		}
		composer.render();
		renderer.render(main_stage, main_camera);
    }

    return {
        update:update,
        clean: () => {
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
