import { chatSocket, private_chatSocket } from "../../../sockets";
import { ChannelOptions, ChatProps } from "../MiniChat";

const ChatInput: React.FC<ChatProps> = (props) => {
	/*======================================================================
	===================Send a Message On Click TO the Selected Conversatio(Group)==========
	======================================================================== */
	const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key == "Enter") {
			e.preventDefault();
			const message = props.messageText;
			const conversation_id: number = props.selectedGroup!.id;
			chatSocket.emit("send_message", {
				message: message,
				conversation_id: conversation_id,
			});
			props.setMessageText("");
		}
	};

	return (
		<div className="message-input">
			<input
				className="message-input-text"
				type="text"
				placeholder="Message ..."
				value={props.messageText}
				onKeyDown={handleKey}
				onChange={(e) => props.setMessageText(e.target.value)}
			/>
		</div>
	);
};
export default ChatInput;
