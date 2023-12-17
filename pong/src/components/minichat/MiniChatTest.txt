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
} from "../../THREE/Utils/backend_types";
import { config } from "../../config";
import Login from "../login/Login";
import { channel } from "diagnostics_channel";
import { group } from "console";
import { Channel } from "./interfaces/interfaces";
import { chatSocket } from "../../sockets/notifications";


enum ChannelOptions {
  CREATE_CHANNEL = "create channel",
  ONLINE_USERS = "online users",
  FRIENDS = "friends",
  CHANNEL = "channel",
}

const MiniChatTest: React.FC = () => {
  const [channels, setChannels] = useState<Conversation[] | null>();
  const [me, setMe] = useState<User | undefined>(undefined);
  const [allUsers, setAllUsers] = useState<User[] | null>(null);
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
  const [newChannel, setNewChannel] = useState<any | null>(null);
  const displayContainer = useRef<HTMLDivElement>(null);

  /*======================================================================
  ===================Fetch<GET>All Users==================================
  ======================================================================== */

  useEffect(() => {
    const requestAllUsers = async () => {
      try {
        const enable2FAEndpoint = `${config.backend_url}/api/user`;
        const response = await fetch(enable2FAEndpoint, {
          method: "GET",
          credentials: "include",
        });
        if (response.ok) {
          const result = await response.json();
          setAllUsers(result);
        } else {
          console.error("Could not get profile:", response.status);
        }
      } catch (error) {
        console.error("Error fetching profile Token:", error);
      }
    };
    requestAllUsers();
  }, [messageText]);

  /*======================================================================
  ===================Fetch<GET> All Conversations========================
  ======================================================================== */
  useEffect(() => {
    const requestConversation = async () => {
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
    requestConversation();
  }, [selectedGroup, newChannel, messageText]);

  /*======================================================================
  ===================Fetch<GET> All Friends From User=====================
  ======================================================================== */
  useEffect(() => {
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
  }, [selectedUser]);

  /*======================================================================
  ===================Change State To The User Select On Click================
  ======================================================================== */
  function printInfo(user: User) {
    console.log("seleted user: ", user);
    setSelectedUser(user);
  }

  /*======================================================================
  ===================Find the Own User Object <ME>=====================
  ======================================================================== */
  useEffect(() => {
    const currentUser = allUsers?.find((user) => user.id === payload?.id);
    if (currentUser) {
      setMe(currentUser);
    }
  }, [allUsers]);

  /*======================================================================
  ===================Iterate All Users And Set Selected User OnClick==========
  ======================================================================== */
  const onlineUsers = allUsers?.map((user: User) => {
    return user?.isAuthenticated === LoggedStatus.Logged ? (
      <img
        key={user.id}
        src={user.image}
        className="chat-img"
        onClick={() => setSelectedUser(user)}
      />
    ) : null;
  });

  /*======================================================================
  ===================Iterate All Channels<Conversations/Group> And OnClick===
  ======================Set Seletect Group And Set The Group Option=============
  ========================================================================= */

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
        }}
      >
        <p>-{firstTitleLetter}</p>
      </div>
    );
  });
  
  /*======================================================================
  ===================Iterate All Friend And On Click Set Selected Friend==========
  ======================================================================== */
  const myFriends = friends?.map((friend: User) => {
    return friend.isAuthenticated === LoggedStatus.Logged ? (
      <img
        className="group-icons"
        src={friend.image}
        key={friend.id}
        onClick={() => printInfo(friend)}
      />
    ) : null;
  });

  /*======================================================================
  ===================Iterate Users From Selected Group And Return Image ==========
  ==================That OnClick Set Selected User========================= 
  =========================================================================*/
  const channelUsers = selectedGroup?.users?.map((channelInfo: any) => {
    const user: User = channelInfo.user;
    return (
      <img
        className="group-icons"
        src={user?.image}
        key={user?.id}
        onClick={() => setSelectedUser(user)}
      />
    );
  });

  /*======================================================================
  ===================Fetch<Post> Request To Send Invite To Another User==========
  ======================================================================== */
  async function sendInvite() {
    const verify2FAEndpoint = `${config.backend_url}/api/user/friend_request`;
    console.log("selectedUser: ", selectedUser);
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

  /*======================================================================
  ===================Create A Channel Form To Create A Channel==========
  ======================================================================== */
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
          //body: JSON.stringify(channelForm.password === "" ? {title:channelForm.title, access_level:channelForm.access_level} : channelForm),
          body: JSON.stringify(channelForm),
        });
        if (response.ok) {
          setNewChannel(channelName);
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

  /*======================================================================
  ===================Create Channel Profille When Clicked On==========
  ======================================================================== */
  const CreateChannelProfile = () => {
    const joinChannel = async () => {
      console.log("me_id", selectedGroup?.id);
      try {
        const response = await fetch(
          `${config.backend_url}/api/conversation/join`,
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ id: selectedGroup?.id }),
          }
        );
        if (response.ok) {
          console.log("Joined Succefully");
        } else {
          console.log("didnt Succede Join Channel");
        }
      } catch (error) {
        console.error("Error Fetching:", error);
      }
    };
    // setSelectedUser(undefined);
    return (
      <div className="channel-profile">
        <div>
          <p>Channel Name: {selectedGroup.title}</p>
          <p>Owner : {selectedGroup.owner.username}</p>
          <img src={selectedGroup.owner.image} />
          <p>Date Creation :</p>
          <p> {selectedGroup?.users[0]?.becameAdminAt}</p>
        </div>
        <button onClick={joinChannel}>Join</button>
      </div>
    );
  };
  /*======================================================================
  ===================Fetch<Get> All Messages From A Channel==========
  ======================================================================== */
  useEffect(() => {
    const requestConversation = async () => {
      if (!channelMessages) return;
      try {
        const fetchConversation = `${config.backend_url}/api/conversation/${selectedGroup?.id}}`;
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
  }, [selectedGroup]);

  /*======================================================================
  ===================Fetch<Get> Messages From His Own Id====================
  ======================================================================== */
  useEffect(() => {
    const requestMessages = async () => {
      if (!me) {
        return;
      }
      console.log("selected group: ", selectedGroup?.id);
      try {
        const fetchMessage = `${config.backend_url}/api/conversation/${selectedGroup?.id}`;
        const response = await fetch(fetchMessage, {
          method: "GET",
          credentials: "include",
        });
        if (response.ok) {
          const result = await response.json();
          console.log("Messages:", result);
          setChannelMessages(result.messages);
        } else {
          setChannelMessages(undefined);
          console.error("Could not get channel messages:", response.status);
        }
      } catch (error) {
        console.error("Error fetching profile me messages:", error);
      }
    };
    requestMessages();
  }, [selectedGroup, messageText]);
  /*======================================================================
  ===================If Channel Have messages Display the messages==========
  ======================================================================== */
  const displayChannelMessages = channelMessages?.map((message: any) => {
    // console.log("message Content", message);
    return (
      <div key={message?.id}>
        <p key={message?.content}>
          {message?.sender?.user?.username} : {message?.content}
        </p>
      </div>
    );
  });
  /*======================================================================
  ===================Send a Message On Click TO the Selected Conversatio(Group)==========
  ======================================================================== */
  const sendMessage = () => {
    const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key == "Enter") {
        e.preventDefault();
        const message = messageText;
        const conversation_id: number = selectedGroup?.id;
        setMessageText(message);
        chatSocket.emit("send_message", {
          message: message,
          conversation_id: conversation_id,
        });
        setMessageText("");
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

  /*======================================================================
  ===================Structure Html Return==========
  ======================================================================== */
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
        {/* JOIN Option and Data About it*/}
        {selectedGroupOption == ChannelOptions.CHANNEL && (
          <CreateChannelProfile />
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
            <div ref={displayContainer} className="message-output">
              <div className="message-output-box">
                {selectedGroupOption === ChannelOptions.CHANNEL ? (
                  <>
                    {displayContainer?.current?.scrollTo(
                      0,
                      displayContainer.current.scrollHeight
                    )}
                    {displayChannelMessages}
                  </>
                ) : null}
              </div>
            </div>
            {selectedGroupOption === ChannelOptions.CHANNEL && (
              <div className="message-input">{sendMessage()}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MiniChatTest;
