import { useState } from "react";
import { Conversation, User } from "../../../THREE/Utils/backend_types";
import { ChannelOptions, ChatProps } from "../MiniChat";



const Groups: React.FC<ChatProps> = (props) => {
  const displayChannels = props.channels?.map((group: Conversation, index:number) => {
    const title = group.title;
    const firstTitleLetter = title?.charAt(0).toUpperCase();
    return (
      <div
        className="group-icons"
        key={index}
        onClick={() => {
          props.setSelectedChannel(group);
          props.setSelectedUser(undefined);
          props.setSelectedChannelOption(ChannelOptions.CHANNEL);
          props.setToogledButton("Channel");
        }}
      >
        <p>-{firstTitleLetter}</p>
      </div>
    );
  });

  return (
    <div className="chat-groups">
      {
        <img
          src="./add.png"
          className="group-img"
          onClick={() => {
            props.setSelectedUser(undefined);
            props.setSelectedChannelOption(ChannelOptions.CREATE_CHANNEL);
          }}
        />
      }
      {
        <img
          src="./online.png"
          className="group-img"
          onClick={() => {
            props.setSelectedUser(undefined);
            props.setSelectedChannelOption(ChannelOptions.ONLINE_USERS);
          }}
        />
      }
      {
        <img
          src="./friends.png"
          className="group-img"
          onClick={() => {
            props.setSelectedUser(undefined);
            props.setSelectedChannelOption(ChannelOptions.FRIENDS);
          }}
        />
      }
      {displayChannels}
    </div>
  );
};
export default Groups;
