interface	Bank {
	[key:string]:	AudioBuffer;
}

class	AudioBank {
	context:	AudioContext;
	bank:		Bank;

	constructor() {
		this.bank = {};
		try {
			this.context = new AudioContext();
		} catch(e) {
			console.log(e);
			window.location.reload();
			this.context = new AudioContext();
		}
	}

	load(id: string, url: string) {
		try {
			let	req = new XMLHttpRequest();

			req.open("GET", url, true);
			req.responseType = "arraybuffer";
			req.onload = () => {
				this.context.decodeAudioData(req.response, (buffer) => {
					this.bank[id] = buffer;
					console.log("SOUND LOADED");
				}, () => {console.log("ERROR LOADING SOUND", id, url)});
			};
			req.send();
		} catch(e) {
			console.log(e);
			window.location.reload();
		}
	}

	play(id: string, volume: number = 0, when: number = 0, offset: number = 0, duration: number | undefined = undefined) {
		let	source = this.context.createBufferSource();
		let	gain = this.context.createGain();

		gain.gain.value = volume;
		if (this.bank[id]) {
			source.buffer = this.bank[id];
			source.connect(gain);
			gain.connect(this.context.destination);
			source.start(when, offset, duration);
		}
		else {
			window.requestAnimationFrame(() => {
				this.play(id, when, offset, duration);
			});
		}
	}
};

export const	audioBank = new AudioBank();
audioBank.load("elec1", "./elec1.mp3");
audioBank.load("elec2", "./elec2.mp3");
audioBank.load("elec3", "./elec3.mp3");
audioBank.load("elec4", "./elec4.mp3");
audioBank.load("elec5", "./elec5.mp3");
