class	Keyboard
{
	[key: string]: {keydown:boolean, keypress:boolean};
};

export function initKeyboardHandlers() {
	window.addEventListener("keydown", handleKeydown);
	window.addEventListener("keyup", handleKeyup);
}

export function getActiveKeys(): { [key: string]: { keydown: boolean; keypress: boolean } } {
	const activeKeys: { [key: string]: { keydown: boolean; keypress: boolean } } = {};

	for (const key in keyboard) {
		if (keyboard[key].keydown || keyboard[key].keypress) {
			activeKeys[key] = { keydown: keyboard[key].keydown, keypress: keyboard[key].keypress };
		}
	}
	return activeKeys;
}

export const keyboard = new Keyboard()

function	removeKeyDowns() {
	for (const k in keyboard) {
		keyboard[k].keydown = false;
	}
}

function	handleKeydown(event: KeyboardEvent)
{
	keyboard[event.key] = {keydown:true, keypress:true};
	requestAnimationFrame(removeKeyDowns)
}

function	handleKeyup(event: KeyboardEvent)
{
	keyboard[event.key] = {keydown:false, keypress:false};
}