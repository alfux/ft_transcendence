import { useEffect, useState } from "react";
import { config } from "../../../config";
import { ChannelOptions, ChatProps } from "../MiniChat";

const UserProfile: React.FC<ChatProps> = (props) => {
  const [channelRights, setChannelRights] = useState<string | null>(null);

  /*======================================================================
  ===================Fetch<Post> Request To Send Invite To Another User==========
  ======================================================================== */
  async function sendInvite() {
    const url = `${config.backend_url}/api/user/friend_request`;
    console.log("selectedUser: ", props.selectedUser);
    try {
      const response = await fetch(url, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(props.selectedUser),
      });
      if (response.ok) {
        const data = await response.json();
        console.log("Response: ", data);
        console.log(" sended friend request to", props.selectedUser?.username);
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
  }

  /*======================================================================
  ===================Check if is owner or admin and set const string==========
  ======================================================================== */
  useEffect(() => {
    if (props.me?.db_id === props.selectedGroup?.owner?.db_id) {
      setChannelRights("Owner");
    } else {
      props.selectedGroup?.users.map((users: any) => {
        if (users.user.db_id == props.me?.db_id) {
          const myRights = users;
          console.log("I AM IN", myRights);
          if (myRights.isAdmin) {
            setChannelRights("Admin");
          }
        }
      });
    }
  }, [props.selectedGroup]);

  async function promoteUser() {
    await Promise.all(
      props.selectedGroup.users.map(async (user: any) => {
        if (user.user.db_id === props.selectedUser?.db_id) {
          const url = `${config.backend_url}/api/conversation/promote`;
          try {
            const response = await fetch(url, {
              method: "POST",
              credentials: "include",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ conversation_user_id: user.id }),
            });

            if (response.ok) {
              console.log("Promoted", user.user.username);
            } else {
              alert("Could not Promote");
              console.error(
                "Error Promoting User. Server responded with status:",
                response.status
              );
            }
          } catch (error) {
            console.error("Error Promoting:", error);
          }
        }
      })
    );
  }

  return (
    <div className="user-profile">
      {props.selectedUser && !props.selectedGroup && (
        <img className="user-image" src={props.selectedUser.image} />
      )}
      {props.selectedUser && <p>{props.selectedUser.username}</p>}
      {props.selectedUser && (
        <div className="status-div">
          <p>Status</p>
          <div className={props.selectedUser.isAuthenticated === 0?"status-online":"status-offline"}></div>
        </div>
      )}
      {props.selectedUser && !props.selectedGroup && <button>Profile</button>}
      {props.selectedGroupOption == ChannelOptions.FRIENDS && props.selectedUser && !props.selectedGroup && (
        <button>Invite Game</button>
      )}
      {props.selectedGroupOption == ChannelOptions.FRIENDS && props.selectedUser && !props.selectedGroup && (
        <button>Remove Friend</button>
      )}
      {props.selectedGroupOption == ChannelOptions.FRIENDS && props.selectedUser && !props.selectedGroup && (
        <button>Block Friend</button>
      )}
      {props.selectedGroupOption == ChannelOptions.ONLINE_USERS &&
        props.selectedUser && (
          <button onClick={sendInvite}>Invite Friend</button>
        )}
      {channelRights == "Owner" &&
        props.selectedUser?.db_id !== props.me?.db_id &&
        props.selectedGroupOption == ChannelOptions.CHANNEL && (
          <button onClick={promoteUser}>Promote</button>
        )}
      {channelRights &&
        props.selectedUser?.db_id !== props.me?.db_id &&
        props.selectedGroupOption == ChannelOptions.CHANNEL && (
          <button>Mute</button>
        )}
      {channelRights &&
        props.selectedUser?.db_id !== props.me?.db_id &&
        props.selectedGroupOption == ChannelOptions.CHANNEL && (
          <button>Kick</button>
        )}
    </div>
  );
};
export default UserProfile;
