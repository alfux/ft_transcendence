import { io } from "socket.io-client";
import Cookies from 'js-cookie';

import { config } from "../config";
import { coolSocket } from "../THREE/Utils";

let accessToken = Cookies.get('access_token');
export const private_chat = coolSocket(`${config.backend_url}/private_chat`, accessToken)
