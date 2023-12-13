import { io } from "socket.io-client";
import Cookies from 'js-cookie';

import { config } from "../config";
import { coolSocket } from "../THREE/Utils";

let accessToken = Cookies.get('access_token');
export const notifications = coolSocket(`${config.backend_url}/notifications`, accessToken)

export const chatSocket = coolSocket(`${config.backend_url}/chat`, accessToken)
notifications.on("connect", () => {
  notifications.emit("auth", accessToken)
})
  