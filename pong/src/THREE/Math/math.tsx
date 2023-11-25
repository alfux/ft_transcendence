import { Vec3 } from "../Math";

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