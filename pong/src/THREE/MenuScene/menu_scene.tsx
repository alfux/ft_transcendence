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
	const	material_params = {color: 0x001616, side:THREE.DoubleSide};
    const	theta = Math.PI / 6;
	let option = "Log"
	loader.load("fonts/Games_Regular.json", (font) => {
		const	neon_log = new THREE.MeshBasicMaterial(material_params);
		const	tlogin = new TextGeometry("Login", {...font_params, font: font});
		const	llog = new THREE.DirectionalLight(0xffbbbb, 0);
		llog.position.set(0, 0, 1);
		llog.target = sphere_mesh;
		llog.name = "lLog";
		const	login = new THREE.Mesh(tlogin, neon_log);
		login.position.set(-0.73, 0, 1);
		login.name = "Log";
		
		const	tlogout = new TextGeometry("Logout", {...font_params, font: font});
		const	logout = new THREE.Mesh(tlogout, neon_log);
		logout.position.set(-0.9, 0, 1);
		logout.name = "Log";
		logout.layers.disable(0);

		
		const	neon_play = new THREE.MeshBasicMaterial(material_params);
		const	tplay = new TextGeometry("Play", {...font_params, font: font});
		const	lplay = new THREE.DirectionalLight(0xffbbbb, 0);
		lplay.position.set(0, Math.cos(theta), Math.sin(theta));
		lplay.target = sphere_mesh;
		lplay.name = "lPlay";
		const	play = new THREE.Mesh(tplay, neon_play);
		play.position.set(-0.65, Math.cos(theta), Math.sin(theta));
		play.rotation.set(theta - Math.PI / 2, 0, 0);
		play.name = "Play";
		
		const	neon_settings = new THREE.MeshBasicMaterial(material_params);
		const	tsettings = new TextGeometry("Settings", {...font_params, font: font});
		const	lsettings = new THREE.DirectionalLight(0xffbbbb, 0);
		lsettings.position.set(0, Math.cos(-theta), Math.sin(-theta));
		lsettings.target = sphere_mesh;
		lsettings.name = "lSettings";
		const	settings = new THREE.Mesh(tsettings, neon_settings);
		settings.position.set(-1.23, Math.cos(-theta), Math.sin(-theta));
		settings.rotation.set(-theta - Math.PI / 2, 0, 0);
		settings.name = "Settings";
		
		const	neon_about = new THREE.MeshBasicMaterial(material_params);
		const	tabout = new TextGeometry("About", {...font_params, font: font});
		const	labout = new THREE.DirectionalLight(0xffbbbb, 0);
		labout.position.set(0, Math.cos(-3 * theta), Math.sin(-3 * theta));
		labout.target = sphere_mesh;
		labout.name = "lAbout";
		const	about = new THREE.Mesh(tabout, neon_about);
		about.position.set(-0.85, Math.cos(-3 * theta), Math.sin(-3 * theta));
		about.rotation.set(-3 * theta - Math.PI / 2, 0, 0);
		about.name = "About";
		
		const	neon_profile = new THREE.MeshBasicMaterial(material_params);
		const	tprofile = new TextGeometry("Profile", {...font_params, font: font});
		const	lprofile = new THREE.DirectionalLight(0xffbbbb, 0);
		lprofile.position.set(0, Math.cos(7 * theta), Math.sin(7 * theta));
		lprofile.target = sphere_mesh;
		lprofile.name = "lProfile";
		const	profile = new THREE.Mesh(tprofile, neon_profile);
		profile.position.set(-1.05, Math.cos(7 * theta), Math.sin(7 * theta));
		profile.rotation.set(7 * theta - Math.PI / 2, 0, 0);
		profile.name = "Profile";
		
		const	neon_chat = new THREE.MeshBasicMaterial(material_params);
		const	tchat = new TextGeometry("Chat", {...font_params, font: font});
		const	lchat = new THREE.DirectionalLight(0xffbbbb, 0);
		lchat.position.set(0, Math.cos(5 * theta), Math.sin(5 * theta));
		lchat.target = sphere_mesh;
		lchat.name = "lChat";
		const	chat = new THREE.Mesh(tchat, neon_chat);
		chat.position.set(-0.65, Math.cos(5 * theta), Math.sin(5 * theta));
		chat.rotation.set(5 * theta - Math.PI / 2, 0, 0);
		chat.name = "Chat";
		
		menu_parent.add(login, play, settings, about, profile, chat, logout, llog, lplay, lsettings, labout, lprofile, lchat)
	}, (prog) => {
		console.log((prog.loaded) + " bytes loaded");
	}, (err) => {
		console.log(err);
	});

	const	camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 20);

	const	ambient = new THREE.AmbientLight(0xffffff, 0.5);

    const	sphere_geometry = new THREE.SphereGeometry(1);
    const	sphere_material = new THREE.MeshPhongMaterial({color: 0x101015});
    const	sphere_mesh = new THREE.Mesh(sphere_geometry, sphere_material);
    sphere_mesh.name = "Sphere";

	const	scaling = 1;
    const	menu_parent = new THREE.Group();
	menu_parent.name = "Group";
    menu_parent.add(sphere_mesh);
    menu_parent.position.set(0, 0, 1);
    menu_parent.scale.set(scaling, scaling, scaling);
	menu_parent.up.set(0, 1, 0);
	menu_parent.lookAt(0, 0, 20);
	console.log("height: ",window.innerHeight,"widht: ",window.innerWidth)
	const	plane = new THREE.PlaneGeometry(25, (9 / 16) * 25, 10, 10);
	const	texture = new THREE.MeshLambertMaterial({map: game_texture});
	texture.transparent = true;
	const	screen_plane = new THREE.Mesh(plane, texture);
	screen_plane.position.set(0, 0, -1);

	const	video_element: HTMLVideoElement = document.getElementById("background-video-scene") as HTMLVideoElement;
	const	video_background = new THREE.VideoTexture(video_element);

	let		general_scaling = Math.min(window.innerWidth, (1.6) * window.innerHeight) / 800;
    const   scene = new THREE.Scene();
	//scene.background = video_background;
	//scene.backgroundIntensity = 0.2;
    scene.add(menu_parent, ambient, screen_plane);
	scene.scale.set(general_scaling, general_scaling, general_scaling);

	const	composer = new EffectComposer(renderer);
	composer.setSize(window.innerWidth, window.innerHeight);
	composer.setPixelRatio(window.devicePixelRatio);
	
	const	render_pass = new RenderPass(scene, camera);
	composer.addPass(render_pass);

	let		bloom_pass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.55, 0.1, 0.1);
	composer.addPass(bloom_pass);

    const   clock = new THREE.Clock()
    let     delta_time = clock.getDelta()
    
	let		deltaY = 0;

    let		current: MenuButtons | null = null;
	let		start = false;
	
	//A adapter en fonction de l'angle entre (0, 0, 1) et le vecteur normalisé ((0, 0, 20) - menu_parent.position)
	let corr = 0.2 - 2 * Math.PI;


    window.addEventListener("wheel", handleWheel);
    window.addEventListener("click", handleClick);
	window.addEventListener("resize", handleResize);
	window.addEventListener("touchmove", handleTouch);

	function handleTouch(event: TouchEvent) {
		const rot_speed = 0.01;
	
		// Assuming only one touch for simplicity
		const deltaY = event.touches[0].clientY - event.touches[0].clientY * 0.50;
	
		let rot = (menu_parent.rotation.x - rot_speed * deltaY) % (2 * Math.PI);
		rot += rot < 0 ? 2 * Math.PI : 0;
		menu_parent.rotation.x = rot;
	
		option = getCurrent(menu_parent.rotation.x);
	}

	function	handleResize(evenet: Event) {
		general_scaling = Math.min(window.innerWidth, (1.6) * window.innerHeight) / 800;
		scene.scale.set(general_scaling, general_scaling, general_scaling);
		renderer.setSize(window.innerWidth, window.innerHeight);
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		composer.setSize(window.innerWidth, window.innerHeight);
		composer.removePass(bloom_pass);
		bloom_pass.dispose();
		bloom_pass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.50, 0.1, 0.1);
		composer.addPass(bloom_pass);
	}
    
	function	handleWheel(event: WheelEvent) {
        const rot_speed = 0.01

        deltaY = clamp(event.deltaY, -30, 30);

        let	rot = (menu_parent.rotation.x - rot_speed * deltaY) % (2 * Math.PI);
        rot += (rot < 0) ? 2 * Math.PI : 0;
        menu_parent.rotation.x = rot;
		option = getCurrent(menu_parent.rotation.x);
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
					start = true;
					corr = 0.4 - 2 * Math.PI;
                    socket.emit("search")
                    break
            }
			console.log("lickclick");
        }
    }

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
		if (start && t < Math.PI / 2)
		{
			menu_parent.position.y = 3.4 * Math.sin(t);
			menu_parent.scale.x = scaling - (scaling - 1) * 2 * t / Math.PI;
			menu_parent.scale.y = scaling - (scaling - 1) * 2 * t / Math.PI;
			menu_parent.scale.z = scaling - (scaling - 1) * 2 * t / Math.PI;
			t += 0.05;
			//menu_parent.lookAt(0, 0, 20);
		}

        const new_current = getCurrent(menu_parent.rotation.x)
        if (menu_parent.children.length > 1 && (new_current !== current || current === null)) {
            current = new_current
            menu_parent.traverse((obj) =>
            {
                if (obj.name === current)
					((obj as THREE.Mesh).material as THREE.MeshBasicMaterial).color.set(0x41ffff);
				else if (obj.name === "l" + current)
				{
					(obj as THREE.Light).color = new THREE.Color(0xffbbbb);;
					(obj as THREE.Light).intensity = 10;
				}
                else if (obj instanceof THREE.Mesh && obj.name !== "Sphere")
                    ((obj as THREE.Mesh).material as THREE.MeshBasicMaterial).color.set(0x001616);
				else if (obj instanceof THREE.DirectionalLight)
				{
					(obj as THREE.Light).color = new THREE.Color(0x41ffff);
					(obj as THREE.Light).intensity = 1;
				}
            });
        }

        if ((menu_parent.rotation.x - corr) % (Math.PI / 3) > 0.01)
            centerMenu(menu_parent, deltaY);
		composer.render();
		//renderer.render(scene,camera)
		return option;
    }

    return {
        update:update,
        clean: () => {

            window.removeEventListener("wheel", handleWheel);
            window.removeEventListener("click", handleClick);
			window.removeEventListener("resize", handleResize);

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
			video_background.dispose();
        }
    }
}
