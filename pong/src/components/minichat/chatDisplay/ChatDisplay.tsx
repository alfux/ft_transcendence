import { useEffect, useRef, useState } from "react";
import { ChannelOptions, ChatProps } from "../ChatProps.interface";
import { Conversation, Message, PrivateMessage } from "../../../THREE/Utils/backend_types";
import { backend_fetch } from "../../backend_fetch";
import { config } from "../../../config";
import { chatSocket } from "../../../sockets";

const ChatDisplay: React.FC<ChatProps> = (props) => {


	/*======================================================================
	===================If Channel Have messages Display the messages==========
	======================================================================== */

	const [messages, setMessages] = useState<Message[]>()
	const displayContainer = useRef<HTMLDivElement>(null);


	function on_message_received(data: { conversation_id: number, message: Message }) {
		if (props.selectedGroup?.id === data.conversation_id) {
			setMessages((prev) => {
				if (prev === undefined) {
					return [data.message]
				}
				const new_messages = [...prev, data.message]
				new_messages.sort((a: Message, b: Message) => (new Date(a.createdAt).getTime()) - (new Date(b.createdAt).getTime()))
				return new_messages
			})
		}
	}

	function render_private_messages() {

		const messages = props.friendConversation?.messages
		if (messages === undefined) {
			return undefined
		}

		messages.sort((a: PrivateMessage, b: PrivateMessage) => (new Date(a.createdAt).getTime()) - (new Date(b.createdAt).getTime()))

		return messages.map((message: PrivateMessage) => (
			<div key={message?.id}>
				<p key={message?.content}>
					{message?.sender?.username} : {message?.content}
				</p>
			</div>
		))
	}

	useEffect(() => {

		if (props.selectedGroup === undefined) {
			setMessages(undefined)
			return
		}

		backend_fetch(`${config.backend_url}/api/conversation/${props.selectedGroup?.id}`, {
			method: 'GET'
		})
			.then((conv?: Conversation) => {
				if (conv === undefined) {
					setMessages(undefined)
				} else {
					conv.messages?.sort((a: Message, b: Message) => (new Date(a.createdAt).getTime()) - (new Date(b.createdAt).getTime()))
					setMessages(conv.messages)
				}
			})
			.catch((e) => { })

		chatSocket.on("receive_message", on_message_received);

		return (() => {
			chatSocket.off("receive_message", on_message_received)
		})

	}, [props.selectedGroup])

	useEffect(() => {
		if (displayContainer.current)
			displayContainer.current.scrollTo(0, displayContainer.current.scrollHeight);
	}, [messages, props.selectedGroupOption, props.friendConversation]);

	return (
		<div ref={displayContainer} className="message-output">
			<div className="message-output-box">

				{
					props.selectedGroupOption === ChannelOptions.CHANNEL && messages !== undefined ? (
						messages?.map((message: Message) => (
							<div key={message?.id}>
								<p key={message?.content}>
									{message?.sender?.user?.username} : {message?.content}
								</p>
							</div>
						))
					) : undefined
				}

				{
					props.selectedGroupOption === ChannelOptions.FRIENDS && props.friendConversation !== undefined ?
						render_private_messages() : undefined
				}

			</div>
		</div>
	);
};
export default ChatDisplay;
