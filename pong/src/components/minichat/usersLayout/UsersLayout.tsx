import { User } from "../../../THREE/Utils/backend_types";
import { LoggedStatus } from "../../../THREE/Utils/jwt.interface";
import { ChannelOptions, ChatProps } from "../MiniChat";

const UsersLayout: React.FC<ChatProps> = (props) => {

  const onlineUsers = props.allUsers?.map((user: User) => {
    return user.id !== props.me?.id ? (
      <img
        key={user.id}
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
        key={friend.id}
        onClick={() => props.setSelectedUser(friend)}
      />
    )
  });

  const channelUsers = props.selectedGroup?.users?.map((channelInfo: any) => {
    const user: User = channelInfo.user;
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
