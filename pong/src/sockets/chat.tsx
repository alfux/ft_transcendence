import Cookies from "js-cookie";

import { config } from "../config";
import { coolSocket } from "../THREE/Utils";

let accessToken = Cookies.get("access_token");
export const chatSocket = coolSocket(`${config.backend_url}/chat`, accessToken)
chatSocket.on("connect", () => {
	chatSocket.emit("auth")
})
