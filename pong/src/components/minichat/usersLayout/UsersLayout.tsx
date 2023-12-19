import { useEffect } from "react";
import { Conversation, ConversationUser, User } from "../../../THREE/Utils/backend_types";
import { ChannelOptions, ChatProps } from "../MiniChat";
import { notificationsSocket } from "../../../sockets";

const UsersLayout: React.FC<ChatProps> = (props: ChatProps) => {

  useEffect(() => {
    notificationsSocket.on("conv_join", async (data: {
      user: User,
      conversation: Conversation
    }) => {
      
      if (props.selectedGroup && props.selectedGroup.id === data.conversation.id) {
        props.setSelectedChannel(data.conversation)
      }
    })
    notificationsSocket.on("conv_leave", async (data: {
      user: User,
      conversation: Conversation
    }) => {
      if (props.selectedGroup && props.selectedGroup.id === data.conversation.id) {
        props.setSelectedChannel(data.conversation)
      }
    })
  })

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
      className={friend?.isAuthenticated === 0?"chat-user-online":"chat-user-offline"}
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
      className={user?.isAuthenticated === 0?"chat-user-online":"chat-user-offline"}
        src={user?.image}
        key={user?.id}
        onClick={() => {props.setSelectedUser(user);props.setToogledButton("User")}}
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
