import * as REACT from "react";
import io from 'socket.io-client';
import { config } from '../../config';
import "./Chat.css"

import { chatSocket } from "../../sockets";

interface	Message {
  id: number;
  content: string;
  sender?: any;
  conversation?: any;
};

interface	Received {
	username: string,
	conversation_id: number,
	message: Message
};

interface	Sending {
	message: string,
	conversation_id: number
};

interface	Chat_Settings
{
	width:		number,
	height:	number
}

export default function	Chat(props: Chat_Settings = {width: window.innerWidth / 2, height: window.innerHeight / 2})
{
	const	[msgs, setMsgs] = REACT.useState<Array<JSX.Element> >([
		<li key={0} >Alexis: Bonjour !</li>,
		<li key={1} >Duarte: Bonjour !</li>,
		<li key={2} >Rémi: Bonjour !</li>,
		<li key={3} >Carlos: Bonjour !</li>,
	]);

	chatSocket.on("receive_message", handleReceive);

	function	handleReceive(new_msg: Received) {
		setMsgs((m) => {
			return ([...m, <li key={m.length}>{new_msg.username}: {new_msg.message.content}</li>]);
		});
	}
	return (
	<div id="Chat-App" className="Chat-Container" >
		<div id="Chat-Window" className="Chat-Style" style={{width: 3 * props.width / 4, height: props.height}}>
			<ol>{msgs}</ol>
			<div id="Message-Window" className="Chat-Style" style={{width: props.width / 4, height: props.height}}>
			</div>
		</div>
		<input />
		<button>Send</button>
	</div>
	);
}
