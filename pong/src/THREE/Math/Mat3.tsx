import { Vec3 } from "../Math";

export class Mat3 {
	j0: Vec3;
	j1: Vec3;
	j2: Vec3;
	det: number;

	constructor(v0: Vec3, v1: Vec3, v2: Vec3) {
		this.j0 = v0;
		this.j1 = v1;
		this.j2 = v2;
		this.det = (
			this.j0.x * (this.j1.y * this.j2.z - this.j1.z * this.j2.y) -
			this.j0.y * (this.j1.x * this.j2.z - this.j1.z * this.j2.x) +
			this.j0.z * (this.j1.x * this.j2.y - this.j1.y * this.j2.x)
		);
	}

	xV(v: Vec3) {
		return (
			new Vec3(
				this.j0.x * v.x + this.j1.x * v.y + this.j2.x * v.z,
				this.j0.y * v.x + this.j1.y * v.y + this.j2.y * v.z,
				this.j0.z * v.x + this.j1.z * v.y + this.j2.z * v.z
			)
		);
	}

	xM(m: Mat3) {
		return (
			new Mat3(
				this.xV(m.j0),
				this.xV(m.j1),
				this.xV(m.j2)
			)
		);
	}

	inv() {
		if (!this.det)
			return (undefined);
		return (
			new Mat3(
				new Vec3(
					(this.j1.y * this.j2.z - this.j1.z * this.j2.y) / this.det,
					(this.j0.z * this.j2.y - this.j0.y * this.j2.z) / this.det,
					(this.j0.y * this.j1.z - this.j0.z * this.j1.y) / this.det
				),
				new Vec3(
					(this.j1.z * this.j2.x - this.j1.x * this.j2.z) / this.det,
					(this.j0.x * this.j2.z - this.j0.z * this.j2.x) / this.det,
					(this.j0.z * this.j1.x - this.j0.x * this.j1.z) / this.det
				),
				new Vec3(
					(this.j1.x * this.j2.y - this.j1.y * this.j2.x) / this.det,
					(this.j0.y * this.j2.x - this.j0.x * this.j2.y) / this.det,
					(this.j0.x * this.j1.y - this.j0.y * this.j1.x) / this.det
				)
			)
		);
	}
}
