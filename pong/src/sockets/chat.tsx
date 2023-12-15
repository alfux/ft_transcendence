import { io } from "socket.io-client";
import Cookies from 'js-cookie';

import { config } from "../config";
import { coolSocket } from "../THREE/Utils";

let accessToken = Cookies.get('access_token');

export const chatSocket = coolSocket(`${config.backend_url}/chat`, accessToken)
chatSocket.on("connect", () => {
    console.log("Chat Socket Connected To BackEnd")
  chatSocket.emit("auth", accessToken)
})
  