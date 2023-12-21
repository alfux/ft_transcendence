import * as THREE from 'three'
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
import { GlitchPass } from "three/examples/jsm/postprocessing/GlitchPass";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry"
import { FontLoader } from "three/examples/jsm/loaders/FontLoader";
import { config } from '../../config';

import { clamp } from '../Math';
import { Socket } from 'socket.io-client';
import { JwtPayload } from '../Utils/';
import { LoggedStatus } from '../Utils/jwt.interface';

import { createComponent } from "../Utils/createComponent";
import Score, { User } from "../../components/scorebar/ScoreBar";

import { clock } from "../Utils/clock";
import { gameSocket } from '../../sockets';

import ReactDOM from "react-dom/client";
import ReactAudioPlayer from "react-audio-player";

import { audioBank } from "../Audio"

export var	classic_mode = false;

let	time = 0;

enum MenuButtons {
  Login = "Login",
  Logout = "Logout",
  Play = "Play",
  Settings = "Settings",
  About = "About",
  Profile = "Profile",
  Chat = "Chat",
  Create = "Create",
  YouWin = "YouWin",
  YouLoose= "YouLoose",
  Null = "null",
};

enum MenuState {
	Unlogged,
	Logged,
	Winner,
	Looser,
	Endgame
};


export let	isLogged: boolean = false;

export function create_menu_scene(
	renderer: THREE.WebGLRenderer,
	game_texture: THREE.Texture,
	payload: JwtPayload | undefined,
	mousecast: THREE.Vector2,
	mousespeed: THREE.Vector2,
	divRef: HTMLDivElement | null,
) {
  const loader = new FontLoader();
  const font_params = { size: 0.4, height: 0.2 };
  const material_params = { color: 0x001010, side: THREE.DoubleSide };
  const theta = Math.PI / 6;
  let option: {option: string, game: boolean} = {option: "Login", game: false};
  loader.load("fonts/Games_Regular.json", (font) => {
    const neon_login = new THREE.MeshBasicMaterial(material_params);
    const tlogin = new TextGeometry("Sign in", { ...font_params, font: font });
    const llogin = new THREE.DirectionalLight(0xffbbbb, 0);
    llogin.position.set(0, 0, 1);
    llogin.target = sphere_mesh;
    llogin.name = "lLogin";
    llogin.layers.set(0);
    const login = new THREE.Mesh(tlogin, neon_login);
    login.position.set(-0.95, 0, 1);
    login.name = "Login";
    login.layers.set(0);

    const neon_logout = new THREE.MeshBasicMaterial(material_params);
    const tlogout = new TextGeometry("Logout", { ...font_params, font: font });
    const llogout = new THREE.DirectionalLight(0xffbbbb, 0);
    llogout.position.set(0, 0, 1);
    llogout.target = sphere_mesh;
    llogout.name = "lLogout";
    llogout.layers.set(1);
    const logout = new THREE.Mesh(tlogout, neon_logout);
    logout.position.set(-0.9, 0, 1);
    logout.name = "Logout";
    logout.layers.set(1);

    const neon_play = new THREE.MeshBasicMaterial(material_params);
    const tplay = new TextGeometry("Play", { ...font_params, font: font });
    const lplay = new THREE.DirectionalLight(0xffbbbb, 0);
    lplay.position.set(0, Math.cos(theta), Math.sin(theta));
    lplay.target = sphere_mesh;
    lplay.name = "lPlay";
    lplay.layers.set(1);
    const play = new THREE.Mesh(tplay, neon_play);
    play.position.set(-0.65, Math.cos(theta), Math.sin(theta));
    play.rotation.set(theta - Math.PI / 2, 0, 0);
    play.name = "Play";
    play.layers.set(1);

    const neon_settings = new THREE.MeshBasicMaterial(material_params);
    const tsettings = new TextGeometry("Settings", { ...font_params, font: font });
    const lsettings = new THREE.DirectionalLight(0xffbbbb, 0);
    lsettings.position.set(0, Math.cos(-theta), Math.sin(-theta));
    lsettings.target = sphere_mesh;
    lsettings.name = "lSettings";
    lsettings.layers.set(1);
    const settings = new THREE.Mesh(tsettings, neon_settings);
    settings.position.set(-1.23, Math.cos(-theta), Math.sin(-theta));
    settings.rotation.set(-theta - Math.PI / 2, 0, 0);
    settings.name = "Settings";
    settings.layers.set(1);

    //const neon_create = new THREE.MeshBasicMaterial(material_params);
    //const tcreate = new TextGeometry("Sign up", { ...font_params, font: font });
    //const lcreate = new THREE.DirectionalLight(0xffbbbb, 0);
    //lcreate.position.set(0, Math.cos(-theta), Math.sin(-theta));
    //lcreate.target = sphere_mesh;
    //lcreate.name = "lCreate";
    //lcreate.layers.set(0);
    //const create = new THREE.Mesh(tcreate, neon_create);
    //create.position.set(-1, Math.cos(-theta), Math.sin(-theta));
    //create.rotation.set(-theta - Math.PI / 2, 0, 0);
    //create.name = "Create";
    //create.layers.set(0);

    const neon_about = new THREE.MeshBasicMaterial(material_params);
    const tabout = new TextGeometry("About", { ...font_params, font: font });
    const labout = new THREE.DirectionalLight(0xffbbbb, 0);
    labout.position.set(0, 0, -1);
    labout.target = sphere_mesh;
    labout.name = "lAbout";
    labout.layers.set(0);
    const about = new THREE.Mesh(tabout, neon_about);
    about.position.set(-0.85, 0, -1);
    about.rotation.set(Math.PI, 0, 0);
    about.name = "About";
    about.layers.set(0);

    const neon_profile = new THREE.MeshBasicMaterial(material_params);
    const tprofile = new TextGeometry("Profile", { ...font_params, font: font });
    const lprofile = new THREE.DirectionalLight(0xffbbbb, 0);
    lprofile.position.set(0, Math.cos(-3 * theta), Math.sin(-3 * theta));
    lprofile.target = sphere_mesh;
    lprofile.name = "lProfile";
    lprofile.layers.set(1);
    const profile = new THREE.Mesh(tprofile, neon_profile);
    profile.position.set(-1.05, Math.cos(-3 * theta), Math.sin(-3 * theta));
    profile.rotation.set(-3 * theta - Math.PI / 2, 0, 0);
    profile.name = "Profile";
    profile.layers.set(1);

    const neon_chat = new THREE.MeshBasicMaterial(material_params);
    const tchat = new TextGeometry("Chat", { ...font_params, font: font });
    const lchat = new THREE.DirectionalLight(0xffbbbb, 0);
    lchat.position.set(0, Math.cos(5 * theta), Math.sin(5 * theta));
    lchat.target = sphere_mesh;
    lchat.name = "lChat";
    lchat.layers.set(1);
    const chat = new THREE.Mesh(tchat, neon_chat);
    chat.position.set(-0.65, Math.cos(5 * theta), Math.sin(5 * theta));
    chat.rotation.set(5 * theta - Math.PI / 2, 0, 0);
    chat.name = "Chat";
    chat.layers.set(1);

	const neon_youwin = new THREE.MeshBasicMaterial(material_params);
    const tyouwin = new TextGeometry("You win !", { ...font_params, font: font });
    const lyouwin = new THREE.DirectionalLight(0xffbbbb, 0);
    lyouwin.position.set(0, Math.cos(-3 * theta), Math.sin(-3 * theta));
    lyouwin.target = sphere_mesh;
    lyouwin.name = "lYouWin";
    lyouwin.layers.set(1);
    const youwin = new THREE.Mesh(tyouwin, neon_youwin);
    youwin.position.set(1.25, Math.cos(-3 * theta), Math.sin(-3 * theta));
    youwin.rotation.set(-3 * theta + Math.PI / 2, Math.PI, 0);
    youwin.name = "YouWin";
    youwin.layers.set(1);

	const neon_youloose = new THREE.MeshBasicMaterial(material_params);
    const tyouloose = new TextGeometry("You loose !", { ...font_params, font: font });
    const lyouloose = new THREE.DirectionalLight(0xffbbbb, 0);
    lyouloose.position.set(0, Math.cos(-3 * theta), Math.sin(-3 * theta));
    lyouloose.target = sphere_mesh;
    lyouloose.name = "lYouLoose";
    lyouloose.layers.set(1);
    const youloose = new THREE.Mesh(tyouloose, neon_youloose);
    youloose.position.set(1.6, Math.cos(-3 * theta), Math.sin(-3 * theta));
    youloose.rotation.set(-3 * theta + Math.PI / 2, Math.PI, 0);
    youloose.name = "YouLoose";
    youloose.layers.set(1);

    menu_parent.add(
		login, play, settings, about, profile, chat, logout, youwin, youloose,
		llogin, lplay, lsettings, labout, lprofile, lchat, llogout, lyouwin, lyouloose
	);
  }, (prog) => {
    console.log((prog.loaded) + " bytes loaded");
  }, (err) => {
    console.log(err);
  });

  if (payload?.authentication === LoggedStatus.Logged)
    isLogged = true;

  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 0, 20);

  const ambient = new THREE.AmbientLight(0xffffff, 0.5);

  const sphere_geometry = new THREE.SphereGeometry(1);
  const sphere_material = new THREE.MeshPhongMaterial({ color: 0x101015 });
  const sphere_mesh = new THREE.Mesh(sphere_geometry, sphere_material);
  sphere_mesh.name = "Sphere";

  let	scaling = 1.5;
  const menu_parent = new THREE.Group();
  menu_parent.add(sphere_mesh);
  menu_parent.position.set(0, 0, 1);
  menu_parent.name = "Menu";
  menu_parent.up.set(0, 1, 0);
  menu_parent.lookAt(0, 0, 20);
  if (!isLogged)
	scaling = 2.5;
  menu_parent.scale.set(scaling, scaling, scaling);
  const plane = new THREE.PlaneGeometry(25, (9 / 16) * 25);
  const texture = new THREE.MeshLambertMaterial({ map: game_texture, transparent: true, opacity: 0});
  const screen_plane = new THREE.Mesh(plane, texture);
  const	mouse_plane = new THREE.PlaneGeometry(500, 500);
  const	mouse_material = new THREE.MeshBasicMaterial({transparent: true, opacity: 0});
  const	mouse_mesh = new THREE.Mesh(mouse_plane, mouse_material);
  screen_plane.position.set(0, 0.35, -1);
  mouse_mesh.position.set(0, 0.35, -1);

  let general_scaling = Math.min(1680 * window.innerWidth / window.screen.width, (16 / 9) * 1050 * window.innerHeight / window.screen.height) / 1000;
  const scene = new THREE.Scene();
  scene.add(menu_parent, ambient, screen_plane, mouse_mesh);
  scene.scale.set(general_scaling, general_scaling, general_scaling);

  const composer = new EffectComposer(renderer);
  composer.setSize(window.innerWidth, window.innerHeight);
  composer.setPixelRatio(window.devicePixelRatio);

  const render_pass = new RenderPass(scene, camera);
  composer.addPass(render_pass);

  let bloom_pass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.55, 0.1, 0.1);
  composer.addPass(bloom_pass);

  const pointer = new THREE.Vector2();
  const raycaster = new THREE.Raycaster();

  let deltaY = 0;

  let current: {current: MenuButtons, section: number} = {current: MenuButtons.Null, section: 0};

  let menu_state = MenuState.Unlogged;
  
  let corr = 0.2 - 2 * Math.PI;

  let pop_trigger = true;

  const	cleanup: Array<() => void> = [];

  divRef?.addEventListener("wheel", handleWheel, { passive:true });
  divRef?.addEventListener("click", handleClick);
  window.addEventListener("resize", handleResize);
  window.addEventListener("pointermove", handleMove);
  window.addEventListener("popstate", handleBackward, {capture: true, passive: true});

	gameSocket.on("start", handleStart);
	gameSocket.on("finish", handleFinish);
	gameSocket.on("bounce", handleBounce);

	function	handleBackward(event: PopStateEvent) {
		if (option.game)
        	window.location.reload();
		menu_parent.rotation.x = event.state ? event.state.section : 0;
		pop_trigger = true;
	}

	function	handleBounce(rng: number) {
		let	i = 0;

		for (let key in audioBank?.bank) {
			if (i === rng) {
				audioBank?.play(key, 0.1);
				return ;
			}
			i++;
		}
	}

	const	fadeIn = {
		t:			0,
		duration:	3,
		start:		2,
		shape:		(t: number) => {return (Math.min(Math.pow(t, 2), 1));},
		hide:		new THREE.PlaneGeometry(25, (9 / 16) * 25),
		black:		new THREE.MeshBasicMaterial({color: 0x000000, transparent: true, opacity: 1}),
		mesh:		new THREE.Mesh(),
		glitch:		new GlitchPass(),
		root:		ReactDOM.createRoot(document.getElementById("audio") as HTMLElement),

		startAnimation() {
			this.mesh.geometry = this.hide;
			this.mesh.material = this.black;
			this.mesh.position.set(0, 0.35, -0.9);
			scene.add(this.mesh);
			this.waitForStart();
		},

		destructor() {
			this.hide.dispose();
			this.black.dispose();
			composer.removePass(this.glitch);
			this.glitch.dispose();
			scene.remove(this.mesh);
		},
		
		waitForStart() {
			if (this.t < this.start) {
				window.requestAnimationFrame(() => {
					this.waitForStart();
				});
				this.t += clock.deltaT;
			}
			else {
				composer.addPass(this.glitch);
				this.root.render(
					<ReactAudioPlayer className='audio' src="./game.mp3" volume={0.5} controls autoPlay={true} muted={false}/>
				);
				this.animate();
			}
		},

		animate() {
			if (this.t < this.duration) {
				window.requestAnimationFrame(() => {
					this.animate();
				});
			}
			else
				this.destructor();
			texture.opacity = this.shape((this.t - this.start) / (this.duration - this.start));
			this.black.opacity = 1 - texture.opacity;
			this.t += clock.deltaT;
		}
	};

	if (isLogged)
		fadeIn.startAnimation();

	function	updateT(t: number, max: number = 1) {
		t += clock.deltaT;
		if (t >= max)
			return (max);
		return (t);
	}

	function	handleStart(data: {opponent: User, you: User}) {
		option.game = true;
		t = 0;
		menu_parent.rotation.set(0, 0, 0);
		menu_parent.position.set(0, 0, 0);
		menu_parent.rotation.x = 2 * theta;
		cleanup.push(createComponent(Score, {user: data.you, you: true}));
		cleanup.push(createComponent(Score, {user: data.opponent, you: false}));
	}

	function	handleFinish(data: {winner: string, reason: string}) {
		option.game = false;
		unsetAll();
		if (data.winner === "you")
		{
			menu_parent.getObjectByName("YouWin")?.layers.set(0);
			menu_parent.getObjectByName("lYouWin")?.layers.set(0);
			menu_state = MenuState.Winner;
			endgame.animate(1.5);
		}
		else
		{
			menu_parent.getObjectByName("YouLoose")?.layers.set(0);
			menu_parent.getObjectByName("lYouLoose")?.layers.set(0);
			menu_state = MenuState.Looser;
			endgame.animate(1.5);
		}
		cleanup.forEach( (elem) => {
			elem();
		});
		cleanup.splice(0, cleanup.length);
	} 

	function	setLoggedMenu() {
		menu_parent.getObjectByName("Create")?.layers.set(1);
		menu_parent.getObjectByName("lCreate")?.layers.set(1);
		menu_parent.getObjectByName("Login")?.layers.set(1);
		menu_parent.getObjectByName("lLogin")?.layers.set(1);
		menu_parent.getObjectByName("Logout")?.layers.set(0);
		menu_parent.getObjectByName("lLogout")?.layers.set(0);
		menu_parent.getObjectByName("Profile")?.layers.set(0);
		menu_parent.getObjectByName("lProfile")?.layers.set(0);
		menu_parent.getObjectByName("About")?.layers.set(0);
    	menu_parent.getObjectByName("About")?.position.set(-0.85, Math.cos(7 * theta), Math.sin(7 * theta));
		menu_parent.getObjectByName("About")?.rotation.set(7 * theta - Math.PI / 2, 0, 0);
		menu_parent.getObjectByName("lAbout")?.layers.set(0);
    	menu_parent.getObjectByName("lAbout")?.position.set(0, Math.cos(7 * theta), Math.sin(7 * theta));
		menu_parent.getObjectByName("Settings")?.layers.set(0);
		menu_parent.getObjectByName("lSettings")?.layers.set(0);
		menu_parent.getObjectByName("Chat")?.layers.set(0);
		menu_parent.getObjectByName("lChat")?.layers.set(0);
		menu_parent.getObjectByName("Play")?.layers.set(0);
		menu_parent.getObjectByName("lPlay")?.layers.set(0);
		menu_parent.getObjectByName("YouWin")?.layers.set(1);
		menu_parent.getObjectByName("lYouWin")?.layers.set(1);
		menu_parent.getObjectByName("YouLoose")?.layers.set(1);
		menu_parent.getObjectByName("lYouLoose")?.layers.set(1);
		menu_state = MenuState.Logged;
		console.log("Set logged menu");
	}

	function	setUnloggedMenu() {
		menu_parent.getObjectByName("Create")?.layers.set(0);
		menu_parent.getObjectByName("lCreate")?.layers.set(0);
		menu_parent.getObjectByName("Login")?.layers.set(0);
		menu_parent.getObjectByName("lLogin")?.layers.set(0);
		menu_parent.getObjectByName("Logout")?.layers.set(1);
		menu_parent.getObjectByName("lLogout")?.layers.set(1);
		menu_parent.getObjectByName("Profile")?.layers.set(1);
		menu_parent.getObjectByName("lProfile")?.layers.set(1);
		menu_parent.getObjectByName("About")?.layers.set(0);
		menu_parent.getObjectByName("About")?.position.set(-0.85, 0, -1);
		menu_parent.getObjectByName("About")?.rotation.set(Math.PI, 0, 0);
		menu_parent.getObjectByName("lAbout")?.layers.set(0);
		menu_parent.getObjectByName("Settings")?.layers.set(1);
		menu_parent.getObjectByName("lSettings")?.layers.set(1);
		menu_parent.getObjectByName("Chat")?.layers.set(1);
		menu_parent.getObjectByName("lChat")?.layers.set(1);
		menu_parent.getObjectByName("Play")?.layers.set(1);
		menu_parent.getObjectByName("lPlay")?.layers.set(1);
		menu_parent.getObjectByName("YouWin")?.layers.set(1);
		menu_parent.getObjectByName("lYouWin")?.layers.set(1);
		menu_parent.getObjectByName("YouLoose")?.layers.set(1);
		menu_parent.getObjectByName("lYouLoose")?.layers.set(1);
		menu_state = MenuState.Unlogged;
		console.log("Set Unlogged menu");
	}

	function	unsetAll() {
		menu_parent.traverse((obj) => {
			if (obj.name !== "Sphere")
				obj.layers.set(1);
		});
	}

	class	EndgameAnimation {
		t:	number;

		constructor() {
			this.t = 0;
		}

		animate(duration: number) {
			if (this.t < duration) {
				requestAnimationFrame(() => {
					this.animate(duration);
				});
				if (this.t === 0)
					menu_parent.rotation.set(0, 0, 0);
				this.t = updateT(this.t, 3.5);
				if (this.t < duration)
					menu_parent.rotation.set(corr, fct(this.t / duration) * Math.PI, 0);
				else
					menu_parent.rotation.set(corr, Math.PI, 0);
			}
			else if (this.t < duration + 2.5)
			{
				requestAnimationFrame(() => {
					this.animate(duration);
				});
				menu_parent.rotation.set(corr, Math.PI, 0);
				this.t = updateT(this.t, duration + 2.5);
			}
			else
			{
				this.t = 0;
				requestAnimationFrame(() => {
					menu_parent.rotation.set(3 * theta, 0, 0);
					menu_state = MenuState.Endgame;
				});
			}
		}
	};

	const	endgame = new EndgameAnimation();

	function swapMenu() {
		if (menu_state === MenuState.Winner || menu_state === MenuState.Looser)
			return ;
		if (isLogged && menu_state !== MenuState.Logged && menu_parent.children.length > 1)
			setLoggedMenu();
		else if (!isLogged && menu_state !== MenuState.Unlogged && menu_parent.children.length > 1)
			setUnloggedMenu();
	}

  function handleResize(evenet: Event) {
    general_scaling = Math.min(1680 * window.innerWidth / window.screen.width, (16 / 9) * 1050 * window.innerHeight / window.screen.height) / 1000;
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

  function handleWheel(event: WheelEvent) {
	if (option.game)
		return ;
    const rot_speed = isLogged ? 0.01 : 0.02;

    deltaY = clamp(event.deltaY, -30, 30);

    let rot = (menu_parent.rotation.x - rot_speed * deltaY) % (2 * Math.PI);
    rot += (rot < 0) ? 2 * Math.PI : 0;
    menu_parent.rotation.x = rot;
  }

  function handleClick(event: MouseEvent) {
    const intersect = raycaster.intersectObjects(scene.children);

    if (intersect.length > 0 && (intersect[0].object.name === current.current
      || intersect[0].object.name === "Sphere")) {
      switch (current.current) {
        case MenuButtons.Logout:
          window.location.href = `${config.backend_url}/auth/login`;
          document.cookie = `access_token=; expires=${Date.now.toString()}; path=/;`;
          window.location.reload();
          break;
      }
    }
  }

  function handleMove(event: PointerEvent) {
    pointer.x = 2 * (event.clientX / window.innerWidth) - 1;
    pointer.y = -2 * (event.clientY / window.innerHeight) + 1;
    raycaster.setFromCamera(pointer, camera);

    const intersect = raycaster.intersectObjects(scene.children);
	const inter_plane = raycaster.intersectObject(mouse_mesh);
    if (intersect.length > 0 && current.current === "Logout"
      && (intersect[0].object.name === current.current
        || intersect[0].object.name === "Sphere"))
      document.body.style.cursor = "pointer";
    else
      document.body.style.cursor = "default";
	if (option.game) {
		mousecast.x = 2 * inter_plane[0]?.point.x / (general_scaling * 25);
		mousecast.y = 2 * inter_plane[0]?.point.y / (general_scaling * 25 * 9 / 16);
		mousespeed.x = event.movementX;
		mousespeed.y = event.movementY;
	}
  }

  function getCurrent(rot: number) {
	if (menu_state === MenuState.Winner)
		return ({current: MenuButtons.YouWin, section: 2 * theta});
	if (menu_state === MenuState.Looser)
		return ({current: MenuButtons.YouLoose, section: 2 * theta});
    if (isLogged) {
      if ((rot - corr) % (2 * Math.PI) <= theta)
        return ({current: MenuButtons.Logout, section: 0});
      if ((rot - corr) % (2 * Math.PI) <= 3 * theta)
        return ({current: MenuButtons.Play, section: 2 * theta});
      if ((rot - corr) % (2 * Math.PI) <= 5 * theta)
        return ({current: MenuButtons.Settings, section: 4 * theta});
      if ((rot - corr) % (2 * Math.PI) <= 7 * theta)
        return ({current: MenuButtons.Profile, section: 6* theta});
      if ((rot - corr) % (2 * Math.PI) <= 9 * theta)
        return ({current: MenuButtons.About, section: 8 * theta});
      if ((rot - corr) % (2 * Math.PI) <= 11 * theta)
        return ({current: MenuButtons.Chat, section: 10 * theta});
      return ({current: MenuButtons.Logout, section: 0});
    }
    if ((rot - corr) % (2 * Math.PI) <= Math.PI / 2)
      return ({current: MenuButtons.Login, section: 0});
    if ((rot - corr) % (2 * Math.PI) <= 3 * Math.PI / 2)
      return ({current: MenuButtons.About, section: (2 * Math.PI / 2)});
    return ({current: MenuButtons.Login, section: 0});
  }

  function centerMenu(group: THREE.Group, deltaY: number, phi: number) {
    const coef = 1;
    let rot;
    let distance = Math.abs(((group.rotation.x - corr) % phi) - phi / 2);

    if ((group.rotation.x - corr) % phi > phi / 2)
      rot = group.rotation.x + coef * (Math.pow((phi / 2) - distance, 2)) / (Math.pow(Math.abs(deltaY), 0.5) + 1);
    else
      rot = group.rotation.x - coef * (Math.pow((phi / 2) - distance, 2)) / (Math.pow(Math.abs(deltaY), 0.5) + 1);
    rot = rot % (2 * Math.PI);
    rot += (rot < 0) ? 2 * Math.PI : 0;
    group.rotation.x = rot;
  }

	let		t = 0;
	let		tilt_play: boolean;
	const	gamma = 1.2;
	const	_a = 2 - 4 * gamma;
	const	_b = (_a - 1) / (2 * _a);
	const	_c = -_a * Math.pow(_b, 2);
	const	fct = (t: number) => {
		return ( _a * Math.pow(t - _b, 2) + _c);
	};

	const	moveMenu = (t: number, x: number, y: number, phi: number, style: (t: number) => number = (t: number) => {return (t);}) => {
		menu_parent.position.x = x * style(t);
		menu_parent.position.y = y * style(t);
		menu_parent.rotation.z = t * phi;
		menu_parent.scale.x = scaling - (scaling - 1) * style(t);
		menu_parent.scale.y = scaling - (scaling - 1) * style(t);
		menu_parent.scale.z = scaling - (scaling - 1) * style(t);
	};

  function update() {
    const new_current = getCurrent(menu_parent.rotation.x);
    
    option.option = new_current.current;
	console.log(new_current.current);
	swapMenu();
    if (new_current.current === "Play" && t < 1) {
		tilt_play = true;
		if (t > 0.9)
			corr = 0.4 - 2 * Math.PI;
		moveMenu(t, 7, 3.2, Math.PI / 6, fct);
		t = updateT(t);
    } else if (new_current.current === "Chat" && t < 1) {
		tilt_play = false;
		if (t > 0.9)
			corr = 0.4 - 2 * Math.PI;
		moveMenu(t, 7, 3.2, -Math.PI/6, fct);
		t = updateT(t);
	} else if (new_current.current !== "Play" && new_current.current != "Chat" && t > 0) {
		if (t < 0.1)
			corr = 0.2 - 2 * Math.PI;
		moveMenu(t, 7, 3.2, (new_current.current === "YouWin" || new_current.current === "YouLoose") ? 0 : ((tilt_play) ? Math.PI / 6 : -Math.PI / 6), fct);
		t = -updateT(-t, 0);
	}
    if (menu_parent.children.length > 1 && (new_current.current !== current.current || current.current === null)) {
		if (!pop_trigger) {
	  		window.history.replaceState(current, "");
      		current = new_current;
	  		window.history.pushState(current, "");
		} else {
			pop_trigger = false;
			current = new_current;
		}
      menu_parent.traverse((obj) => {
        if (obj.name === current.current) {
          if (obj.name === "Logout" || obj.name === "YouLoose")
            ((obj as THREE.Mesh).material as THREE.MeshBasicMaterial).color.set(0xff41a7);
          else
            ((obj as THREE.Mesh).material as THREE.MeshBasicMaterial).color.set(0x41ffff);
        }
        else if (obj.name === "l" + current.current) {
          (obj as THREE.Light).color = new THREE.Color(0xffbbbb);
          (obj as THREE.Light).intensity = 10;
        }
        else if (obj instanceof THREE.Mesh && obj.name !== "Sphere")
          ((obj as THREE.Mesh).material as THREE.MeshBasicMaterial).color.set(0x001010);
        else if (obj instanceof THREE.DirectionalLight) {
          (obj as THREE.Light).color = new THREE.Color(0x41ffff);
          (obj as THREE.Light).intensity = 1;
        }
      });
    }

    if (Math.abs(menu_parent.rotation.x - corr) % (Math.PI / 3) > 0.02)
      centerMenu(menu_parent, deltaY, isLogged ? Math.PI / 3 : Math.PI);
	if (time > 0.007) {
		composer.render();
		time = 0;
	} else
		time += clock.deltaT;
    return (option);
  }

  return {
    update: update,
    clean: () => {

			gameSocket.off("start", handleStart);
			gameSocket.off("finish", handleFinish);
			gameSocket.off("bounce", handleBounce);

      divRef?.removeEventListener("wheel", handleWheel);
      divRef?.removeEventListener("click", handleClick);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("pointermove", handleMove);

      scene.traverse((obj: any) => {
        if (obj instanceof THREE.Mesh) {
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
