import { useEffect } from "react"
import { ChannelOptions, ChatProps } from "../ChatProps.interface"
import ChatDisplay from "../chatDisplay/ChatDisplay"
import ChatInput from "../chatInput/ChatInput"
import PrivateChatInput from "../chatInput/PrivateChatInput"

const ChatBox: React.FC<ChatProps> = (props) => {

	return (
		<div className="chat-box">
			{props.selectedGroupOption === ChannelOptions.CHANNEL || ( props.selectedGroupOption === ChannelOptions.FRIENDS && props.selectedUser !== undefined ) ? (
				<>
					<ChatDisplay {...props} />
					{
						props.selectedGroupOption === ChannelOptions.CHANNEL ?
						<ChatInput {...props} />
						:
						<PrivateChatInput {...props} />
					}
				</>
			) : undefined
			}
		</div>
	)
}
export default ChatBox