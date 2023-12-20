export class Keyboard {
	key: {
		[key: string]: boolean
	};

	constructor() {
		this.key = {};
		window.addEventListener("keydown", handleKeydown);
		window.addEventListener("keyup", handleKeyup);
	}
};

function handleKeydown(event: KeyboardEvent) {
	keyboard.key[event.key] = true;
}

function handleKeyup(event: KeyboardEvent) {
	keyboard.key[event.key] = false;
}

export const keyboard = new Keyboard();
