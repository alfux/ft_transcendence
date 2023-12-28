import { useState } from "react";
import { private_chatSocket } from "../../../sockets";
import { ChatProps } from "../ChatProps.interface";

const PrivateChatInput: React.FC<ChatProps> = (props) => {

	const [textToSend, setTextToSend] = useState('')

	const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key == "Enter") {
			e.preventDefault();

			if (props.friendConversation === undefined)
				return

			private_chatSocket.emit("send_message", {
				message: textToSend,
				conversation_id: props.friendConversation!.id,
			});

			setTextToSend("");
		}
	};

	return (
		<div className="message-input">
			<input
				className="message-input-text"
				type="text"
				placeholder="Private message ..."
				value={textToSend}
				onKeyDown={handleKey}
				onChange={(e) => setTextToSend(e.target.value)}
			/>
		</div>
	);
};
export default PrivateChatInput;
