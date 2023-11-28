import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { Loader } from "three";

export function load(loader:Loader, options:{
	url: string,
	onLoad: (data: any) => void,
	onProgress?: (event: ProgressEvent) => void,
	onError?: (err: any) => void,
	cache?:boolean
}) {

	const old_load = options.onLoad
	options.onLoad = (e) => {
		console.log(`${options.url} loaded !`);
		old_load?.(e)
	}

	const old_prog = options.onProgress
	options.onProgress = (e: ProgressEvent<EventTarget>) => {
		if (e.lengthComputable) {
			console.log(`${options.url}${e.loaded / e.total * 100}% loaded`);
		}
		old_prog?.(e)
	}

	const old_err = options.onError
	options.onError = (e) => {
		console.log(`Error while loading ${options.url}:\n${e}`)
		old_err?.(e)
	}

	loader.load(options.url, options.onLoad, options.onProgress, options.onError)
}

export function	load_obj(group: THREE.Group, name: string, pos: [number, number, number] = [0, 0, 0],
	rot: [number, number, number] = [0, 0, 0])
{
	const	loader = new GLTFLoader();
	load(loader, {
		url:name,
		onLoad:(obj) =>
		{
			obj.scene.position.set(pos[0], pos[1], pos[2]);
			obj.scene.rotation.set(rot[0], rot[1], rot[2]);
			group.add(obj.scene);
		}})
}