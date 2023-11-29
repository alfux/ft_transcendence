import { Vec3 } from '../Math'

export class	Ball
{
	position:	Vec3;
	speed:		Vec3;
	radius:		number;
	spin:		number;

	constructor(
		rad: number = 1,
		pos: [number, number, number] = [0, 0, 0],
		spd: [number, number, number] = [0, 0, 0],
		spn: number = 0
	)
	{
		this.radius = rad;
		this.position = new Vec3(pos[0], pos[1], pos[2]);
		this.speed = new Vec3(spd[0], spd[1], spd[2]);
		this.spin = spn;
	}

	setRadius(rad: number)
	{
		this.radius = rad;
	}

	setSpin(spn: number)
	{
		this.spin = spn;
	}
};