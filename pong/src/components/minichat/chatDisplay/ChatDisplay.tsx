import { useEffect } from "react";
import { ChannelOptions, ChatProps } from "../MiniChat";
import { Message } from "../../../THREE/Utils/backend_types";

const ChatDisplay: React.FC<ChatProps> = (props) => {


	/*======================================================================
	===================If Channel Have messages Display the messages==========
	======================================================================== */
	const displayChannelMessages = () => {

		if (props.channelMessages === undefined)
			return undefined

		const messages = props.channelMessages?.map((message: Message) => {
			return (
				<div key={message?.id}>
					<p key={message?.content}>
						{message?.sender?.user?.username} : {message?.content}
					</p>
				</div>
			);
		});

		return messages
	}


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
				{props.selectedGroupOption === ChannelOptions.CHANNEL &&
					displayChannelMessages()}
			</div>
		</div>
	);
};
export default ChatDisplay;
