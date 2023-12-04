import { Vec3, Mat3 } from ".";

export function	scalaire(a: Vec3, b: Vec3)
{
	return (a.x * b.x + a.y * b.y + a.z * b.z);
}

export function	norm(a: Vec3)
{
	return (Math.sqrt(scalaire(a, a)));
}

export function	distance(a: Vec3, b: Vec3)
{
	return (norm(new Vec3(a.x - b.x, a.y - b.y, a.z - b.z)));
}

export function	rotz(vec: Vec3, theta: number)
{
	const	m = new Mat3(
		new Vec3(Math.cos(theta), Math.sin(theta), 0),
		new Vec3(-Math.sin(theta), Math.cos(theta), 0),
		new Vec3(0, 0, 1)
	);
	return (m.xV(vec));
}

export function	rotx(vec: Vec3, theta: number)
{
	const	m = new Mat3(
		new Vec3(1, 0, 0),
		new Vec3(0, Math.cos(theta), Math.sin(theta)),
		new Vec3(0, -Math.sin(theta), Math.cos(theta))
	);
	return (m.xV(vec));
}

export function clamp(v:number, min:number, max:number) {
	return Math.max(Math.min(v, max), min)
}
