class	Keyboard
{
	[key: string]: {keydown:boolean, keypress:boolean};
};

export function initKeyboardHandlers() {
	window.addEventListener("keydown", handleKeydown);
	window.addEventListener("keyup", handleKeyup);
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