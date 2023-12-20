import { io } from "socket.io-client";
import Cookies from "js-cookie";

import { config } from "../config";
import { coolSocket } from "../THREE/Utils";
import { useRef } from "react";
// async function handleMessages() {
//   let channels: any[] = [];
//   let me: any = null;
//   const requestMe = async () => {
//     try {
//       const conversation_url = `${config.backend_url}/api/user/me`;
//       const response = await fetch(conversation_url, {
//         method: "GET",
//         credentials: "include",
//       });
//       if (response.ok) {
//         const result = await response.json();
//         console.log("result", result);
//         me = result;
//       } else {
//         console.error("Could not get Conversation:", response.status);
//       }
//     } catch (error) {
//       console.error("Error fetching Conversation:", error);
//     }
//   };
//   requestMe();
//   const requestConversation = async () => {
//     try {
//       const conversation_url = `${config.backend_url}/api/conversation/me`;
//       const response = await fetch(conversation_url, {
//         method: "GET",
//         credentials: "include",
//       });
//       if (response.ok) {
//         const result = await response.json();
//         channels = result;
//       } else {
//         console.error("Could not get Conversation:", response.status);
//       }
//     } catch (error) {
//       console.error("Error fetching Conversation:", error);
//     }
//   };
//   requestConversation();
//   function findChannelIn() {
//     channels.map((channel: any) => {
//       function test() {
//         channel.map((user: any) => {
//           if (user.db_id === me.db_id) {
//             chatSocket.emit("send_message", {
//               message: "",
//               conversation_id: channel.id,
//             });
//             console.log("GOT IT");
//             return;
//           }
//         });
//     }
//     test()
//     });
//   }
//   findChannelIn();
//   console.log("NOP DIDNT GET IT", channels, me);
// }

let accessToken = Cookies.get("access_token");
export const chatSocket = coolSocket(`${config.backend_url}/chat`, accessToken)
chatSocket.on("connect", () => {
  chatSocket.emit("auth")
})
