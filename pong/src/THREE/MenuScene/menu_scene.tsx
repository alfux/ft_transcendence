import * as THREE from 'three'
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { config } from '../../config';
import { load_obj } from '../Utils';

import { clamp } from '../Math';
import { Socket } from 'socket.io-client';

enum MenuButtons {
	Logout = "Logout",
	Play = "Play",
	Settings = "Settings",
	About = "About",
	Profile = "Profile",
	Chat = "Chat"
}

export function create_menu_scene(renderer: THREE.Renderer, params: {
    toggleProfile:() => void
}, socket:Socket) {

	const	camera = new THREE.OrthographicCamera(
		-window.innerWidth / 200, window.innerWidth / 200,
		window.innerHeight / 200, -window.innerHeight / 200, 0.1, 10
	);
    camera.position.set(0, 0, 10);

	const	light = new THREE.DirectionalLight(0xffffff, 2);
    light.position.set(0, 0, 2);

    const	sphere_geometry = new THREE.SphereGeometry(1);
    const	sphere_material = new THREE.MeshStandardMaterial({color: 0xffffff});
    const	sphere_mesh = new THREE.Mesh(sphere_geometry, sphere_material);
    sphere_mesh.name = "Sphere";

	const	scaling = 0.5;
    const	theta = Math.PI / 6;
    const	menu_parent = new THREE.Group();
    menu_parent.add(sphere_mesh);
    menu_parent.position.set(4, 3, 0);
    load_obj(menu_parent, "meshes/Logout.glb", [0, 0, 1], [Math.PI / 2, 0, 0]);
    load_obj(menu_parent, "meshes/Play.glb", [0, Math.cos(theta), Math.sin(theta)], [theta, 0, 0]);
    load_obj(menu_parent, "meshes/Settings.glb", [0, Math.cos(-theta), Math.sin(-theta)], [-theta, 0, 0]);
    load_obj(menu_parent, "meshes/About.glb", [0, Math.cos(-3 * theta), Math.sin(-3 * theta)], [-3 * theta, 0, 0]);
    load_obj(menu_parent, "meshes/Profile.glb", [0, Math.cos(7 * theta), Math.sin(7 * theta)], [7 * theta, 0, 0]);
    load_obj(menu_parent, "meshes/Chat.glb", [0, Math.cos(5 * theta), Math.sin(5 * theta)], [5 * theta, 0, 0]);

    const   scene = new THREE.Scene();
    scene.add(menu_parent, light);

	const	render_pass = new RenderPass(scene, camera);

    const   clock = new THREE.Clock()
    let     delta_time = clock.getDelta()
    menu_parent.scale.set(scaling, scaling, scaling);
    
	let		deltaY = 0;

    let		current: MenuButtons = MenuButtons.Logout;

    function handleWheel(event: WheelEvent)
    {
        const rot_speed = 0.01

        deltaY = clamp(event.deltaY, -30, 30);

        let	rot = (menu_parent.rotation.x - rot_speed * deltaY) % (2 * Math.PI);
        rot += (rot < 0) ? 2 * Math.PI : 0;
        menu_parent.rotation.x = rot;
    }

    function handleClick(event: MouseEvent) {
        const	pointer = new THREE.Vector2();
        const   raycaster = new THREE.Raycaster()
        
        pointer.x = 2 * (event.clientX / window.innerWidth) - 1;
        pointer.y = -2 * (event.clientY / window.innerHeight) + 1;
        raycaster.setFromCamera(pointer, camera);

        const	intersect = raycaster.intersectObjects(scene.children);
        console.log(intersect)
        if (intersect.length > 0 && (intersect[0].object.name === current
            || intersect[0].object.name === "Sphere"))
        {
            switch (current) {
                case MenuButtons.Logout:
                    window.location.href = `${config.backend_url}/api/auth/login`;
                    break ;
                case MenuButtons.Profile:
                    params.toggleProfile();
                    break
                case MenuButtons.Play:
                    //Animation lancement
                    socket.emit("search")
                    break
            }
			console.log("lickclick");
        }
    }
 
    window.addEventListener("wheel", handleWheel);
    window.addEventListener("click", handleClick);

    function	getCurrent(rot: number)
    {
        const	theta = Math.PI / 6;

        if (rot < theta)
            return MenuButtons.Logout;
        else if (rot < 3 * theta)
            return MenuButtons.Play;
        else if (rot < 5 * theta)
            return MenuButtons.Settings;
        else if (rot < 7 * theta)
            return MenuButtons.About;
        else if (rot < 9 * theta)
            return MenuButtons.Profile;
        else if (rot < 11 * theta)
            return MenuButtons.Chat;
        else
            return MenuButtons.Logout;
    }

    function	centerMenu(group: THREE.Group, deltaY: number)
    {
    	const	coef = 1;
    	let		rot;
    	let		distance = Math.abs((group.rotation.x % (Math.PI / 3)) - Math.PI / 6);

    	if (group.rotation.x % (Math.PI / 3) > Math.PI / 6)
    		rot = group.rotation.x + coef * (Math.pow((Math.PI / 6) - distance, 2)) / (Math.pow(Math.abs(deltaY), 0.5) + 1);
    	else
    		rot = group.rotation.x - coef * (Math.pow((Math.PI / 6) - distance, 2)) / (Math.pow(Math.abs(deltaY), 0.5) + 1);
    	rot = rot % (2 * Math.PI);
    	rot += (rot < 0) ? 2 * Math.PI : 0;
    	group.rotation.x = rot;
    }

    function update() {
        delta_time = clock.getDelta();

        /*
        Update la couleur du texte actuellement sélectionné
        */
        const new_current = getCurrent(menu_parent.rotation.x)
        if (new_current !== current || current === null) {
            current = new_current
            menu_parent.traverse((obj) =>
            {
                if (obj.name === current)
                    ((obj as THREE.Mesh).material as THREE.MeshStandardMaterial).color.set(0xff0000);
                else if (obj instanceof THREE.Mesh && obj.name !== "Sphere")
                    ((obj as THREE.Mesh).material as THREE.MeshStandardMaterial).color.set(0x41a7ff);
            });
        }

        if (menu_parent.rotation.x % (Math.PI / 3) > 0.01)
            centerMenu(menu_parent, deltaY);
		renderer.render(scene, camera);
    }

    return {
        update:update,
        clean: () => {

            window.removeEventListener("wheel", handleWheel);
            window.removeEventListener("click", handleClick);

            scene.traverse((obj: any) =>
            {
                if (obj instanceof THREE.Mesh)
                {
                    obj.geometry.dispose();
                    obj.material.dispose();
                }
            });
			render_pass.dispose();
        }
    }
}
