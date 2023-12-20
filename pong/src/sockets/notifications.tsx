import { io } from "socket.io-client";
import Cookies from 'js-cookie';

import { config } from "../config";
import { coolSocket } from "../THREE/Utils";

let accessToken = Cookies.get('access_token');
export const notificationsSocket = coolSocket(`${config.backend_url}/notifications`, accessToken)
notificationsSocket.on("connect", () => {
  notificationsSocket.emit("auth", accessToken)
})
