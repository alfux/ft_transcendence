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
export const chatSocket = coolSocket(`${config.backend_url}/chat`, accessToken)
chatSocket.on("connect", () => {
    console.log("Chat Socket Connected To BackEnd")
  chatSocket.emit("auth", accessToken)
})