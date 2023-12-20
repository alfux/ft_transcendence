import { useEffect } from "react"
import { ChatProps } from "../MiniChat"
import ChatDisplay from "../chatDisplay/ChatDisplay"
import ChatInput from "../chatInput/ChatInput"

const ChatBox: React.FC<ChatProps> = (props) => {

	return (
		<div className="chat-box">
			{props.isInChannel && <ChatDisplay {...props} />}
			{props.isInChannel && <ChatInput {...props} />}
		</div>
	)
}
export default ChatBox