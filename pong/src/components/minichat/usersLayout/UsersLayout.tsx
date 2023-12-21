import { useEffect } from "react";
import { Conversation, ConversationUser, User } from "../../../THREE/Utils/backend_types";
import { ChannelOptions, ChatProps } from "../MiniChat";
import { notificationsSocket } from "../../../sockets";
import { config } from "../../../config";

const UsersLayout: React.FC<ChatProps> = (props: ChatProps) => {


	// ____________________Request Friend Messages_______________________
	useEffect(()=>{
		const getFriendMessages = async ()=> {
			try {
				const conversation_url = `${config.backend_url}/api/conversation/pconversation`;
				const response = await fetch(conversation_url, {
					method: "GET",
					credentials: "include",
				});
				if (response.ok) {
					const result = await response.json();
					props.setFriendMessages(result.messages)
					console.log("gotfriend messages")
				} else {
					console.error("Could not get Conversation:", response.status);
				}
			} catch (error) {
				console.error("Error fetching Conversation:", error);
			}
		}
		getFriendMessages();
	},[props.selectedUser])
		

	// _______________________________________________________________
	const onlineUsers = props.allUsers?.map((user: User) => {
		return user.id !== props.me?.id ? (
			<img
				key={`onlineUser-${user?.db_id}`}
				src={user.image}
				className={user?.isAuthenticated === 0 ? "chat-user-online" : "chat-user-offline"}
				onClick={() => props.setSelectedUser(user)}
			/>
		) : undefined
	});

	const myFriends = props.friends?.map((friend: User) => {
		return (
			<img
				className={friend?.isAuthenticated === 0 ? "chat-user-online" : "chat-user-offline"}
				src={friend.image}
				key={`onlineUser-${friend?.db_id}`}
				onClick={() => props.setSelectedUser(friend)}
			/>
		)
	});

	const channelUsers = props.selectedGroup?.users?.map((conversationUser: ConversationUser) => {
		const user = conversationUser.user;
		return (
			<img
				className={user?.isAuthenticated === 0 ? "chat-user-online" : "chat-user-offline"}
				src={user?.image}
				key={user?.id}
				onClick={() => { props.setSelectedUser(user); props.setToogledButton("User") }}
			/>
		);
	});

	return (
		<div className="chat-options" id="chat-friends">
			{props.selectedGroupOption == ChannelOptions.ONLINE_USERS && onlineUsers}
			{props.selectedGroupOption == ChannelOptions.FRIENDS && myFriends}
			{props.selectedGroupOption == ChannelOptions.CHANNEL && channelUsers}
		</div>
	);
};
export default UsersLayout;
