import { clamp } from "./math";

export class Vec3 {
	x: number;
	y: number;
	z: number;

	static zero() { return new Vec3(0, 0, 0) }
	static one() { return new Vec3(1, 1, 1) }

	constructor(x: number = 0, y: number = 0, z: number = 0) {
		this.x = x;
		this.y = y;
		this.z = z;
	}

	set(x: number, y: number, z: number) {
		this.x = x;
		this.y = y;
		this.z = z;
	}

	clamp(min: number, max: number) {
		this.x = clamp(this.x, min, max)
		this.y = clamp(this.y, min, max)
		this.z = clamp(this.z, min, max)
	}

	*[Symbol.iterator]() {
		yield this.x;
		yield this.y;
		yield this.z;
	}

	clone() {
		return new Vec3(this.x, this.y, this.z)
	}

};