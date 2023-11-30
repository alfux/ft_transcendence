import * as THREE from 'three'
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry"
import { FontLoader } from "three/examples/jsm/loaders/FontLoader";
import { config } from '../../config';

import { clamp } from '../Math';
import { Socket } from 'socket.io-client';

enum MenuButtons {
	Logout = "Log",
	Play = "Play",
	Settings = "Settings",
	About = "About",
	Profile = "Profile",
	Chat = "Chat"
}

export function create_menu_scene(renderer: THREE.WebGLRenderer, game_texture: THREE.Texture, params: {
    toggleProfile:() => void
}, socket:Socket) {	
	const	loader = new FontLoader();
	const	font_params = {size: 0.4, height: 0.2};
    const	theta = Math.PI / 6;
	loader.load("fonts/Games_Regular.json", (font) => {
		const	neon_log = new THREE.MeshBasicMaterial({color: 0x41ffff});
		const	tlogin = new TextGeometry("Login", {...font_params, font: font});
		const	login = new THREE.Mesh(tlogin, neon_log);
		login.position.set(-0.73, 0, 1);
		login.name = "Log";
		
		const	tlogout = new TextGeometry("Logout", {...font_params, font: font});
		const	logout = new THREE.Mesh(tlogout, neon_log);
		logout.position.set(-0.9, 0, 1);
		logout.name = "Log";
		logout.layers.disable(0);

		
		const	neon_play = new THREE.MeshBasicMaterial({color: 0x41ffff});
		const	tplay = new TextGeometry("Play", {...font_params, font: font});
		const	play = new THREE.Mesh(tplay, neon_play);
		play.position.set(-0.65, Math.cos(theta), Math.sin(theta))
		play.rotation.set(theta - Math.PI / 2, 0, 0);
		play.name = "Play";
		
		const	neon_settings = new THREE.MeshBasicMaterial({color: 0x41ffff});
		const	tsettings = new TextGeometry("Settings", {...font_params, font: font});
		const	settings = new THREE.Mesh(tsettings, neon_settings);
		settings.position.set(-1.23, Math.cos(-theta), Math.sin(-theta));
		settings.rotation.set(-theta - Math.PI / 2, 0, 0);
		settings.name = "Settings";
		
		const	neon_about = new THREE.MeshBasicMaterial({color: 0x41ffff});
		const	tabout = new TextGeometry("About", {...font_params, font: font});
		const	about = new THREE.Mesh(tabout, neon_about);
		about.position.set(-0.85, Math.cos(-3 * theta), Math.sin(-3 * theta));
		about.rotation.set(-3 * theta - Math.PI / 2, 0, 0);
		about.name = "About";
		
		const	neon_profile = new THREE.MeshBasicMaterial({color: 0x41ffff});
		const	tprofile = new TextGeometry("Profile", {...font_params, font: font});
		const	profile = new THREE.Mesh(tprofile, neon_profile);
		profile.position.set(-1.05, Math.cos(7 * theta), Math.sin(7 * theta));
		profile.rotation.set(7 * theta - Math.PI / 2, 0, 0);
		profile.name = "Profile";
		
		const	neon_chat = new THREE.MeshBasicMaterial({color: 0x41ffff});
		const	tchat = new TextGeometry("Chat", {...font_params, font: font});
		const	chat = new THREE.Mesh(tchat, neon_chat);
		chat.position.set(-0.65, Math.cos(5 * theta), Math.sin(5 * theta));
		chat.rotation.set(5 * theta - Math.PI / 2, 0, 0);
		chat.name = "Chat";
		
		menu_parent.add(login, play, settings, about, profile, chat, logout)
	}, (prog) => {
		console.log((prog.loaded) + " bytes loaded");
	}, (err) => {
		console.log(err);
	});

	const	camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 20);

	const	ambient = new THREE.AmbientLight(0xffffff, 0.5);

    const	sphere_geometry = new THREE.SphereGeometry(1);
    const	sphere_material = new THREE.MeshBasicMaterial({color: 0x050505});
    const	sphere_mesh = new THREE.Mesh(sphere_geometry, sphere_material);
    sphere_mesh.name = "Sphere";

	const	scaling = 2;
    const	menu_parent = new THREE.Group();
	menu_parent.name = "Group";
    menu_parent.add(sphere_mesh);
    menu_parent.position.set(0, 0, 1);
    menu_parent.scale.set(scaling, scaling, scaling);
	menu_parent.up.set(0, 1, 0);
	menu_parent.lookAt(0, 0, 20);

	const	plane = new THREE.PlaneGeometry(window.innerWidth / 50, window.innerHeight / 50, 10, 10);
	const	texture = new THREE.MeshBasicMaterial({map: game_texture});
	const	screen_plane = new THREE.Mesh(plane, texture);
	screen_plane.position.set(0, 0, 0.5);

    const   scene = new THREE.Scene();
    scene.add(menu_parent, screen_plane, ambient);

	const	composer = new EffectComposer(renderer);
	composer.setSize(window.innerWidth, window.innerHeight);
	composer.setPixelRatio(window.devicePixelRatio);
	
	const	render_pass = new RenderPass(scene, camera);
	composer.addPass(render_pass);

	const	bloom_pass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 2, 0.1, 0.1);
	composer.addPass(bloom_pass);

    const   clock = new THREE.Clock()
    let     delta_time = clock.getDelta()
    
	let		deltaY = 0;

    let		current: MenuButtons | null = null;

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
                    console.log("AAAAAAAAA")
                    break
            }
			console.log("lickclick");
        }
    }
 
    window.addEventListener("wheel", handleWheel);
    window.addEventListener("click", handleClick);

	//A adapter en fonction de l'angle entre (0, 0, 1) et le vecteur normalisé ((0, 0, 20) - menu_parent.position)
	let corr = 0.2 - 2 * Math.PI;

    function	getCurrent(rot: number)
    {
        if ((rot - corr) % (2 * Math.PI) < theta)
            return MenuButtons.Logout;
        else if ((rot - corr) % (2 * Math.PI) < 3 * theta)
            return MenuButtons.Play;
        else if ((rot - corr) % (2 * Math.PI) < 5 * theta)
            return MenuButtons.Settings;
        else if ((rot - corr) % (2 * Math.PI) < 7 * theta)
            return MenuButtons.About;
        else if ((rot - corr) % (2 * Math.PI) < 9 * theta)
            return MenuButtons.Profile;
        else if ((rot - corr) % (2 * Math.PI) < 11 * theta)
            return MenuButtons.Chat;
        else
            return MenuButtons.Logout;
    }

    function	centerMenu(group: THREE.Group, deltaY: number)
    {
    	const	coef = 1;
    	let		rot;
    	let		distance = Math.abs(((group.rotation.x - corr) % (Math.PI / 3)) - Math.PI / 6);

    	if ((group.rotation.x - corr) % (Math.PI / 3) > Math.PI / 6)
    		rot = group.rotation.x + coef * (Math.pow((Math.PI / 6) - distance, 2)) / (Math.pow(Math.abs(deltaY), 0.5) + 1);
    	else
    		rot = group.rotation.x - coef * (Math.pow((Math.PI / 6) - distance, 2)) / (Math.pow(Math.abs(deltaY), 0.5) + 1);
    	rot = rot % (2 * Math.PI);
    	rot += (rot < 0) ? 2 * Math.PI : 0;
    	group.rotation.x = rot;
    }


	let		t = 0;

    function update() {
        delta_time = clock.getDelta();
		if (1 && t < Math.PI / 2)
		{
			//menu_parent.position.y = 4 * Math.sin(t);
			//menu_parent.scale.x = 2 - 2 * t / Math.PI;
			//menu_parent.scale.y = 2 - 2 * t / Math.PI;
			//menu_parent.scale.z = 2 - 2 * t / Math.PI;
			//t += 0.05;
			//menu_parent.lookAt(0, 0, 20);
		}

        const new_current = getCurrent(menu_parent.rotation.x)
        if (menu_parent.children.length > 1 && (new_current !== current || current === null)) {
            current = new_current
			console.log(current);
            menu_parent.traverse((obj) =>
            {
                if (obj.name === current)
                    ((obj as THREE.Mesh).material as THREE.MeshBasicMaterial).color.set(0xff41a7);
                else if (obj instanceof THREE.Mesh && obj.name !== "Sphere")
                    ((obj as THREE.Mesh).material as THREE.MeshBasicMaterial).color.set(0x41ffff);
            });
        }

        if ((menu_parent.rotation.x - corr) % (Math.PI / 3) > 0.01)
            centerMenu(menu_parent, deltaY);
		composer.render();
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
			bloom_pass.dispose();
			composer.dispose();
        }
    }
}
