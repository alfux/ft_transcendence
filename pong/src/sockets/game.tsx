import { io } from "socket.io-client";
import Cookies from 'js-cookie';

import { config } from "../config";
import { coolSocket } from "../THREE/Utils";

let accessToken = Cookies.get('access_token');
export const gameSocket = coolSocket(`${config.backend_url}/game`, accessToken)
gameSocket.on("connect", () => {
	gameSocket.emit("auth")
})
