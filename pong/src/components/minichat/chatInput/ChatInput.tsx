import { useState } from "react";
import { chatSocket, private_chatSocket } from "../../../sockets";
import { ChannelOptions, ChatProps } from "../ChatProps.interface";

const ChatInput: React.FC<ChatProps> = (props) => {

	const [textToSend, setTextToSend] = useState('')

	const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key == "Enter") {
			e.preventDefault();

			if (props.selectedGroup === undefined)
				return

			chatSocket.emit("send_message", {
				message: textToSend,
				conversation_id: props.selectedGroup.id,
			});

			setTextToSend("");
		}
	};

	return (
		<div className="message-input">
			<input
				className="message-input-text"
				type="text"
				placeholder="Message ..."
				value={textToSend}
				onKeyDown={handleKey}
				onChange={(e) => setTextToSend(e.target.value)}
			/>
		</div>
	);
};
export default ChatInput;
