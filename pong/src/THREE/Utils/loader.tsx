import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";

export function	load_obj(group: THREE.Group, name: string, pos: [number, number, number] = [0, 0, 0],
	rot: [number, number, number] = [0, 0, 0])
{
	const	loader = new GLTFLoader();

	loader.load(name,
		(obj) =>
		{
			obj.scene.position.set(pos[0], pos[1], pos[2]);
			obj.scene.rotation.set(rot[0], rot[1], rot[2]);
			group.add(obj.scene);
		},
		(obj) => {console.log(obj.loaded + " loaded");},
		(err) => {console.log(err)});
}