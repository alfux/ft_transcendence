class Keyboard {
	[key: string]: { keydown: boolean, keypress: boolean };
};

export function initKeyboardHandlers() {
	window.addEventListener("keydown", handleKeydown);
	window.addEventListener("keyup", handleKeyup);
	window.addEventListener("visibilitychange", handleVisibiltyChange);
	window.addEventListener("blur", handleVisibiltyChange);
}
export function cleanupKeyboardHandlers() {
	window.removeEventListener("keydown", handleKeydown);
	window.removeEventListener("keyup", handleKeyup);
	window.removeEventListener("visibilitychange", handleVisibiltyChange);
	window.removeEventListener("blur", handleVisibiltyChange);
}

export const keyboard = new Keyboard()

export function getActiveKeys(): { [key: string]: { keydown: boolean; keypress: boolean } } {
	const activeKeys: { [key: string]: { keydown: boolean; keypress: boolean } } = {};

	for (const key in keyboard) {
		if (keyboard[key].keydown || keyboard[key].keypress) {
			activeKeys[key] = { keydown: keyboard[key].keydown, keypress: keyboard[key].keypress };
		}
	}
	return activeKeys;
}


function removeKeyDowns() {
	for (const k in keyboard) {
		keyboard[k].keydown = false;
	}
}

function handleVisibiltyChange(event: Event) {
	console.log("clear")
	for (const k in keyboard) {
		keyboard[k].keydown = false;
		keyboard[k].keypress = false;
	}
}

function handleKeydown(event: KeyboardEvent) {
	keyboard[event.key] = { keydown: true, keypress: true };
	requestAnimationFrame(removeKeyDowns)
}

function handleKeyup(event: KeyboardEvent) {
	keyboard[event.key] = { keydown: false, keypress: false };
}