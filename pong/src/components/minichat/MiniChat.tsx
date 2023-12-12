// MiniChat.js

import Cookies from "js-cookie";
import React, {
  useState,
  useEffect,
  useRef,
  Dispatch,
  SetStateAction,
  ChangeEvent,
  FormEventHandler,
} from "react";
import jwt, { jwtDecode } from "jwt-decode";
import { JwtPayload, LoggedStatus } from "../../THREE/Utils/jwt.interface";
import TwoFactorValidate from "../twofactorvalidate/TwoFactorValidate";
import usePayload from "../../react_hooks/use_auth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import "./MiniChat.css";
import {
  Conversation,
  ConversationUser,
  FriendRequest,
  User,
} from "../../THREE/ReactUI/backend_types";
import { config } from "../../config";
import Login from "../login/Login";
import { channel } from "diagnostics_channel";
import { group } from "console";
import { notifications } from "../../notification/notification";
import { Channel } from "./interfaces/interfaces";

enum ChannelOptions {
  CREATE_CHANNEL = "create channel",
  ONLINE_USERS = "online users",
  FRIENDS = "friends",
  CHANNEL = "channel",
}

const MiniChat: React.FC = () => {
  const [channels, setChannels] = useState<Conversation[] | null>();
  const [me, setMe] = useState<User | undefined>(undefined);
  const [data, setData] = useState<User[] | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | undefined>(undefined);
  const [selectedGroup, setSelectedGroup] = useState<any | undefined>(
    undefined
  );
  const [selectedGroupOption, setSelectedGroupOption] =
    useState<ChannelOptions | null>(null);
  const [payload, updatePayload, handleUpdate] = usePayload();
  const [friends, setFriends] = useState<User[] | null>(null);
  const [friendsRequests, setFriendsRequests] = useState<User | undefined>();
  const [channelMessages, setChannelMessages] = useState<any | null>(null);
  const [messageText, setMessageText] = useState<any>("");
  const [conversation, setConversation] = useState<any>(null);
  // _______________________________________________________________________

  useEffect(() => {
    // Request all users
    const requestProfile = async () => {
      try {
        const enable2FAEndpoint = `${config.backend_url}/api/user`;
        const response = await fetch(enable2FAEndpoint, {
          method: "GET",
          credentials: "include",
        });
        if (response.ok) {
          const result = await response.json();
          setData(result);
        } else {
          console.error("Could not get profile:", response.status);
        }
      } catch (error) {
        console.error("Error fetching profile Token:", error);
      }
    };
    requestProfile();
  }, []);
  useEffect(() => {
    // Request all owned channels
    const requestProfile = async () => {
      try {
        const conversation_url = `${config.backend_url}/api/conversation/`;
        const response = await fetch(conversation_url, {
          method: "GET",
          credentials: "include",
        });
        if (response.ok) {
          const result = await response.json();
          setChannels(result);
        } else {
          console.error("Could not get Conversation:", response.status);
        }
      } catch (error) {
        console.error("Error fetching Conversation:", error);
      }
    };
    requestProfile();
  }, []);
  useEffect(() => {
    // Request all owned channels
    const requestProfile = async () => {
      try {
        const enable2FAEndpoint = `${config.backend_url}/api/user/friends`;
        const response = await fetch(enable2FAEndpoint, {
          method: "GET",
          credentials: "include",
        });
        if (response.ok) {
          const result = await response.json();
          setFriends(result);
        } else {
          console.error("Could not get Friends fetch:", response.status);
        }
      } catch (error) {
        console.error("Error fetching Friends:", error);
      }
    };
    requestProfile();
  }, []);
  // _________________________________________________________________________________________

  // Function on click set the SelectedUser to the user clicked
  function printInfo(user: User) {
    setSelectedUser(user);
  }

  useEffect(() => {
    // Find the user corresponing to the payload id
    const currentUser = data?.find((user) => user.id === payload?.id);
    if (currentUser) {
      setMe(currentUser);
    }
  }, [data, payload]);

  // Iterate all users and return a image of each user
  const onlineUsers = data?.map((user: User) => {
    return user?.isAuthenticated === LoggedStatus.Logged ? (
      <img
        key={user.id}
        src={user.image}
        className="chat-img"
        onClick={() => printInfo(user)}
      />
    ) : null;
  });

  // Iterate groups and return a element with the first letter of the group
  const usersGroups = channels?.map((group: Conversation) => {
    const title = group.title;
    const firstTitleLetter = title?.charAt(0).toUpperCase();
    return (
      <div
        className="group-icons"
        key={group.id}
        onClick={() => {
          setSelectedGroup(group);
          setSelectedGroupOption(ChannelOptions.CHANNEL);
          console.log("group Info: ", group);
        }}
      >
        <p>-{firstTitleLetter}</p>
      </div>
    );
  });

  // Iterate Channel and return image of users
  const myFriends = friends?.map((friend: User) => {
    return friend?.isAuthenticated === LoggedStatus.Logged ? (
      <img
        className="group-icons"
        src={friend.image}
        key={friend.id}
        onClick={() => printInfo(friend)}
      />
    ) : null;
  });

  const channelUsers = selectedGroup?.users?.map((channelInfo: any) => {
    const user: User = channelInfo.user;
    console.log("Users In group:: ", user);
    return (
      <img
        className="group-icons"
        src={user?.image}
        key={user?.id}
        onClick={() => printInfo(user)}
      />
    );
  });
  async function sendInvite() {
    const verify2FAEndpoint = `${config.backend_url}/api/user/friend_request`;
    try {
      const response = await fetch(verify2FAEndpoint, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(selectedUser),
      });
      if (response.ok) {
        const data = await response.json();
        console.log("Response: ", data);
        console.log(" sended friend request to", selectedUser?.username);
      } else {
        alert("didnt sended invate");
        console.error(
          "Error sending invite Server responded with status:",
          response.status
        );
      }
    } catch (error) {
      console.error("Error verifying 2FA code:", error);
    }
    try {
      handleUpdate();
    } catch (error) {
      console.log(error);
    }
  }

  const CreateChannelForm = () => {
    const [channelName, setChannelName] = useState<any>("");
    const [password, setPassword] = useState<any>("");
    const [isPrivate, setIsPrivate] = useState<any>(false);

    const createChannel = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const channelForm: Channel = {
        title: channelName,
        password: password,
        access_level: isPrivate,
      };
      try {
        const response = await fetch(`${config.backend_url}/api/conversation`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(channelForm),
        });
        if (response.ok) {
          console.log("FETCHED POST");
        } else {
          console.log("NOT FETCH");
        }
      } catch (error) {
        console.error("Error Fetching:", error);
      }
    };

    return (
      <div className="channel-creator">
        <form onSubmit={createChannel}>
          <div>
            <p>Channel Name</p>
            <input
              type="text"
              value={channelName}
              onChange={(e) => setChannelName(e.target.value)}
            ></input>
          </div>
          <div>
            <p>Password</p>
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            ></input>
          </div>
          <div>
            <label>Privite</label>
            <input
              value={isPrivate}
              onChange={(e) => setIsPrivate(isPrivate ? false : true)}
              type="checkbox"
            ></input>
          </div>
          <div>
            <button type="submit">Create Channel</button>
          </div>
        </form>
      </div>
    );
  };
  // Get the id of the convertion
  useEffect(()=>{
    const requestConversation = async () => {
      if (!channelMessages)
        return
      try {
        console.log("THE ID OF message IS", channelMessages[0].id)
        const fetchConversation = `${config.backend_url}/api/messages/${channelMessages[0].id}`;
        const response = await fetch(fetchConversation, {
          method: "GET",
          credentials: "include",
        });
        if (response.ok) {
          const result = await response.json();
          console.log("Conversation:", result.conversation);
          setConversation(result.conversation);
        } else {
          console.error("Could not get conversation stuff:", response.status);
        }
      } catch (error) {
        console.error("Error fetching conversation:", error);
      }
    };
    requestConversation();
  },[channelMessages])

  useEffect(() => {
    const requestMessages = async () => {
      if (!me){
        return
      }
      try {
        const fetchMessage = `${config.backend_url}/api/messages/from/${me?.id}`;
        const response = await fetch(fetchMessage, {
          method: "GET",
          credentials: "include",
        });
        if (response.ok) {
          const result = await response.json();
          console.log("Messages:", result);
          setChannelMessages(result);
        } else {
          setChannelMessages(undefined);
          console.error("Could not get me messages:", response.status);
        }
      } catch (error) {
        console.error("Error fetching profile me messages:", error);
      }
    };
    requestMessages();
  }, [selectedGroup]);

  const displayChannelMessages = channelMessages?.map((message: any) => {
    console.log("message Content", message);
    return (
      <div key={message?.id}>
        <p key={message?.content}>
          {message?.sender?.user?.username} : {message?.content}
        </p>
      </div>
    );
  });

  const sendMessage = () => {
    const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key == "Enter") {
        e.preventDefault();
        const message = messageText;
        const conversation_id :number = conversation.id
        notifications.emit("send_message", (data: {message:string, conversation_id:number}) =>{
          console.log("DATING",data)
        })
        setMessageText('')

      }
    };

    
    return (
      <div className="message-input">
        <input
          className="message-input-text"
          type="text"
          placeholder="Message ..."
          value={messageText}
          onKeyDown={handleKey}
          onChange={(e) => setMessageText(e.target.value)}
          />
      </div>
    );
  };
  useEffect(()=>{
    console.log("DATE")
    notifications.emit("send_message", (data: {"as":string, 20:number}) =>{
      console.log("DATING")
    })
  },[])
  return (
    <div className="a">
      {selectedUser && (
        <div className="user-profile">
          {selectedUser && (
            <img className="user-image" src={selectedUser.image} />
          )}
          {selectedUser && <p>{selectedUser.username}</p>}
          {selectedGroupOption == ChannelOptions.ONLINE_USERS &&
            selectedUser && <button onClick={sendInvite}>Invite Friend</button>}
        </div>
      )}
      <div className="glass-container-minichat">
        {/* Create Channel */}
        {selectedGroupOption == ChannelOptions.CREATE_CHANNEL && (
          <CreateChannelForm />
        )}
        <div className="chat-groups">
          {
            <img
              src="./add.png"
              className="group-img"
              onClick={() => {
                setSelectedUser(undefined);
                setSelectedGroupOption(ChannelOptions.CREATE_CHANNEL);
              }}
            />
          }
          {
            <img
              src="./online.png"
              className="group-img"
              onClick={() => {
                setSelectedUser(undefined);
                setSelectedGroupOption(ChannelOptions.ONLINE_USERS);
              }}
            />
          }
          {
            <img
              src="./friends.png"
              className="group-img"
              onClick={() => {
                setSelectedUser(undefined);
                setSelectedGroupOption(ChannelOptions.FRIENDS);
              }}
            />
          }
          {usersGroups}
        </div>
        <div className="chat-main">
          <div className="chat-options" id="chat-friends">
            {selectedGroupOption == ChannelOptions.ONLINE_USERS && onlineUsers}
            {selectedGroupOption == ChannelOptions.FRIENDS && myFriends}
            {selectedGroupOption == ChannelOptions.CHANNEL && channelUsers}
          </div>
          <div className="chat-box">
            <div className="message-output">
              <div className="message-output-box">
                {selectedGroupOption === ChannelOptions.FRIENDS &&
                  selectedUser && (
                    <img src={selectedUser.image} className="user-image" />
                  ) && <p>{selectedUser.username}: Hi</p>}
                {selectedGroupOption === ChannelOptions.CHANNEL &&
                  displayChannelMessages}
              </div>
            </div>
            <div className="message-input">{sendMessage()}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MiniChat;

