import * as REACT from "react";
import io from 'socket.io-client';
import { config } from '../../config';
import "./Chat.css"

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

export default function	Chat(props: object = {})
{
	const	socket = io(`${config.backend_url}/chat`, { transports: ["websocket"] });
	const	[msgs, setMsgs] = REACT.useState<Array<JSX.Element> >([
		<li key={0} >Alexis: Bonjour !</li>,
		<li key={1} >Duarte: Bonjour !</li>,
		<li key={2} >Rémi: Bonjour !</li>,
		<li key={3} >Carlos: Bonjour !</li>,
	]);

	socket.on("receive_message", handleReceive);

	function	handleReceive(new_msg: Received) {
		setMsgs((m) => {
			return ([...m, <li key={m.length}>{new_msg.username}: {new_msg.message.content}</li>]);
		});
	}
	return (
	<div id="Chat-App" className="Chat-Style" >
		<div id="Chat-Window" className="Chat-Style" >
			<ol>{msgs}</ol>
		</div>
		<input />
		<button>Send</button>
	</div>
	);
}
