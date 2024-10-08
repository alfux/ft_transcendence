import { ConversationUser, User } from "../../../THREE/Utils/backend_types";
import { ChannelOptions, ChatProps } from "../ChatProps.interface";

const UsersLayout: React.FC<ChatProps> = (props: ChatProps) => {		

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
				onClick={() => props.setSelectedUser(user)}
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
