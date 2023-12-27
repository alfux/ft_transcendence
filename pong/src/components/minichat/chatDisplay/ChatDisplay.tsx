import { useEffect } from "react";
import { ChannelOptions, ChatProps } from "../MiniChat";
import { Message, PrivateMessage } from "../../../THREE/Utils/backend_types";

const ChatDisplay: React.FC<ChatProps> = (props) => {


	/*======================================================================
	===================If Channel Have messages Display the messages==========
	======================================================================== */

	useEffect(() => {
		if (props.displayContainer.current) {
			props.displayContainer.current.scrollTo(
				0,
				props.displayContainer.current.scrollHeight
			);
		}
	}, [props.channelMessages]);

	return (
		<div ref={props.displayContainer} className="message-output">
			<div className="message-output-box">
				
				{props.selectedGroupOption === ChannelOptions.CHANNEL && props.channelMessages !== undefined ? (
					props.channelMessages?.map((message: Message) => (
						<div key={message?.id}>
							<p key={message?.content}>
								{message?.sender?.user?.username} : {message?.content}
							</p>
						</div>
					))
				) : undefined
				}

				{props.selectedGroupOption === ChannelOptions.FRIENDS && props.friendConversation !== undefined ? (
					props.friendConversation?.messages?.map((message: PrivateMessage) => (
						<div key={message?.id}>
							<p key={message?.content}>
								{message?.sender?.username} : {message?.content}
							</p>
						</div>
					))
				) : undefined
				}
			
			</div>
		</div>
	);
};
export default ChatDisplay;
