export class Clock {
	private startTime: number;
	private deltaTime: number;
	private isRunning: boolean;
	private timeScale: number;

	constructor(autoStart: boolean = true) {
		this.startTime = 0;
		this.deltaTime = 0;
		this.isRunning = false;
		this.timeScale = 1;

		if (autoStart) {
			this.start();
		}
	}

	start() {
		if (!this.isRunning) {
			this.startTime = Date.now() - this.deltaTime / this.timeScale;
			this.isRunning = true;
		}
	}

	stop() {
		if (this.isRunning) {
			this.deltaTime = (Date.now() - this.startTime) * this.timeScale;
			this.isRunning = false;
		}
	}

	setScale(scale: number) {
		this.timeScale = scale;
	}

	getScale() {
		return this.timeScale;
	}

	getElapsedTime() {
		if (this.isRunning) {
			return (Date.now() - this.startTime) * this.timeScale;
		}
		return this.deltaTime;
	}

	getDelta() {
		const elapsedTime = this.getElapsedTime();
		this.startTime = Date.now() - elapsedTime / this.timeScale;
		return elapsedTime;
	}
}