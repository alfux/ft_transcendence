import { io } from "socket.io-client";
import Cookies from 'js-cookie';
import { config } from "../config";
import { coolSocket } from "../THREE/Utils";
let accessToken = Cookies.get('access_token');
export const notifications = coolSocket(`${config.backend_url}/notifications`, accessToken)
notifications.on("connect", () => {
    console.log("Socket connected");
  });
  notifications.on("disconnect", (reason) => {
    console.log("Socket disconnected. Reason:", reason);
  });
  notifications.on("error", (error) => {
    console.error("Socket error:", error);
  });
  