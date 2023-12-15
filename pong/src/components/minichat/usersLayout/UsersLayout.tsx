import { User } from "../../../THREE/Utils/backend_types";
import { LoggedStatus } from "../../../THREE/Utils/jwt.interface";
import { ChannelOptions, ChatProps } from "../MiniChat";

const UsersLayout: React.FC<ChatProps> = (props) => {
  const onlineUsers = props.allUsers?.map((user: User) => {
    return user?.isAuthenticated === LoggedStatus.Logged ? (
      <img
        key={user.id}
        src={user.image}
        className="chat-img"
        onClick={() => props.setSelectedUser(user)}
      />
    ) : null;
  });

  const myFriends = props.friends?.map((friend: User) => {
    return friend?.isAuthenticated === LoggedStatus.Logged ? (
      <img
        className="group-icons"
        src={friend.image}
        key={friend.id}
        onClick={() => props.setSelectedUser(friend)}
      />
    ) : null;
  });

  const channelUsers = props.selectedGroup?.users?.map((channelInfo: any) => {
    const user: User = channelInfo.user;
    return (
      <img
        className="group-icons"
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
