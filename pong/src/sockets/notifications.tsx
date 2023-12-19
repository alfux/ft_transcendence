import { io } from "socket.io-client";
import Cookies from 'js-cookie';

import { config } from "../config";
import { coolSocket } from "../THREE/Utils";

let accessToken = Cookies.get('access_token');
export const notifications = coolSocket(`${config.backend_url}/notifications`, accessToken)

notifications.on("connect", () => {
  console.log("Notification Socket Connected to Backend")
  notifications.emit("auth", accessToken)
})
