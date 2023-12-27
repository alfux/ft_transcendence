import { private_chatSocket } from "../../../sockets";
import { ChatProps } from "../MiniChat";

const PrivateChatInput: React.FC<ChatProps> = (props) => {
	/*======================================================================
	===================Send a Message On Click TO the Selected Conversatio(Group)==========
	======================================================================== */
	const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key == "Enter") {
			e.preventDefault();

			console.log(props.friendConversation)
			if (props.friendConversation === undefined)
				return

			private_chatSocket.emit("send_message", {
				message: props.messageText,
				conversation_id: props.friendConversation!.id,
			});

			props.setMessageText("");
		}
	};

	return (
		<div className="message-input">
			<input
				className="message-input-text"
				type="text"
				placeholder="Private message ..."
				value={props.messageText}
				onKeyDown={handleKey}
				onChange={(e) => props.setMessageText(e.target.value)}
			/>
		</div>
	);
};
export default PrivateChatInput;
