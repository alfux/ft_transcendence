import { Vec3 } from "../Math";
import { Ball } from "./ball";

export class	Obstacle
{
	position:	Vec3;
	direction:	Vec3;
	radius:		number;
	speed:		number;

	constructor(pos: [number, number, number] = [0, 0, 0], dir: [number, number, number] = [0, 0, 0], rad: number = 1, spd: number = 0)
	{
		this.position = new Vec3(pos[0], pos[1], pos[2]);
		this.direction = new Vec3(dir[0], dir[1], dir[2]);
		this.radius = rad;
		this.speed = spd;
	}

	setRadius(rad: number)
	{
		this.radius = rad;
	}

	setSpeed(spd: number)
	{
		this.speed = spd;
	}
}
