import { io } from "socket.io-client";
import { config } from "../config";

export const notifications = io(`${config.backend_url}/notifications`, {transports: ["websocket"]})
console.log(notifications)