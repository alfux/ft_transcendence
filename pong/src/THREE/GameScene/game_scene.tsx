import * as THREE from 'three'
import { load_obj } from '../Utils/loader';

import { Ball } from './ball';
import { Obstacle } from './obstacle';
import { GameBoard } from './gameboard';
import { Vec3, distance, scalaire, norm } from '../Math';

import { keyboard } from '../Utils/keyboard';

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
    //console.log("before bounce");
    //console.log(ball.spin);
    tmp.set(
        tmp.x + Math.abs(obstacle.speed - ball.spin) * Math.sign(obstacle.speed) * obstacle.direction.x,
        tmp.y + Math.abs(obstacle.speed - ball.spin) * Math.sign(obstacle.speed) * obstacle.direction.y,
        tmp.z + Math.abs(obstacle.speed - ball.spin) * Math.sign(obstacle.speed) * obstacle.direction.z
    );
    //console.log("after bounce");
    //console.log(ball.spin);
    ball.spin = obstacle.speed + ball.spin / 2;
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



export function create_game_scene(renderer: THREE.Renderer) {

    const	scene = new THREE.Scene();
    const	camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    const	light = new THREE.DirectionalLight(0xffffff, 1.5);
    
    const	clock = new THREE.Clock();
    let     delta_time = clock.getDelta()
    
    const	game_parent = new THREE.Group();

    const	board = new GameBoard();
    let		start = false;
    board.ball.speed.set(10, 0, 0);

    function	updateRRacket()
    {
        const	limit = 7;
        let		move = 0;
        let		speed = 20;

        if (keyboard.ArrowDown?.keypress)
            move -= speed * delta_time
        if (keyboard.ArrowUp?.keypress) {
            move += speed * delta_time;
        }
    

        if (Math.abs(game_parent.children[0].children[2].position.y + move) <= limit)
        {
            board.right_racket.position.y += move;
            board.right_racket.speed = move;
        }
        else
        {
            board.right_racket.position.y = (move < 0) ? -limit : limit;
            board.right_racket.speed = 0;
        }
        game_parent.children[0].children[2].position.y = board.right_racket.position.y;
    }


    function	updateLRacket()
    {
        const	limit = 7;
        let		move = 0;
        let		speed = 20;

        if (keyboard.s?.keypress)
            move -= speed * delta_time
        if (keyboard.z?.keypress)
            move += speed * delta_time;
        if (Math.abs(game_parent.children[0].children[1].position.y + move) <= limit)
        {
            board.left_racket.position.y += move;
            board.left_racket.speed = -move;
        }
        else
        {
            board.left_racket.position.y = (move < 0) ? -limit : limit;
            board.left_racket.speed = 0;
        }
        game_parent.children[0].children[1].position.y = board.left_racket.position.y;
    }

    function	moveBall(t: boolean)
    {
        let	imp;

        game_parent.children[0].children[3].position.x += delta_time * board.ball.speed.x;
        game_parent.children[0].children[3].position.y += delta_time * board.ball.speed.y;
        board.ball.position.x = game_parent.children[0].children[3].position.x;
        board.ball.position.y = game_parent.children[0].children[3].position.y;
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


    function update() {
        delta_time = clock.getDelta()

        if (game_parent.children.length > 0)
        {
            updateRRacket();
            updateLRacket();
        }
        if (keyboard[" "]?.keydown) {
            start = !start
        }
        if (start)
            moveBall(true);
        renderer.render(scene, camera)
    }

    camera.position.set(0, -30, 40);
    camera.lookAt(0, 0, 0);
    light.position.set(0, 0, 2);
    load_obj(game_parent, "meshes/game.glb");
    scene.add(game_parent, light);

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
        }
    }
}