import { useEffect, useState } from "react";
import { config } from "../../../config";
import { ChannelOptions, ChatProps } from "../MiniChat";
import { FriendRequest, PlayRequest } from "../../../THREE/Utils/backend_types";


async function backend_fetch(url: string, init?: RequestInit, body?: any) {

  async function log_error(rep: Response) {
    const json = await rep.json().catch((e) => undefined)
    console.error(`Couldn't fetch ${rep.url} (status: ${rep.status}): ${json !== undefined ? JSON.stringify(json, null, 2) : rep.body}`)
  }

  const default_init = {
    method: "GET",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body)
  }
  const rep = await fetch(url, Object.assign({}, default_init, init)).catch((e) => {
    console.error(`Couldn't fetch ${url}): ${e}`)
    return undefined
  })
  if (rep===undefined)
    return undefined

  if (rep.ok) {
    const data = await rep.json().catch((e) => undefined)
    return data
  } else {
    log_error(rep)
    return undefined
  }
}

const UserProfile: React.FC<ChatProps> = (props) => {
  const [channelRights, setChannelRights] = useState<string | null>(null);

  /*======================================================================
  ===================Fetch<Post> Request To Send Friend Invite To Another User==========
  ======================================================================== */
  async function sendFriendInvite() {
    /*
    const verify2FAEndpoint = `${config.backend_url}/api/user/friend_request`;
    console.log("selectedUser: ", props.selectedUser);
    try {
      const response = await fetch(verify2FAEndpoint, {
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
    */
    backend_fetch(`${config.backend_url}/api/user/friend_request`, { method: 'POST' }, {
      user_id: props.selectedUser?.id
    })
  }
  /*======================================================================
  ===================Fetch<Post> Request To Send Play Invite To Another User==========
  ======================================================================== */
  async function sendPlayInvite() {
    backend_fetch(`${config.backend_url}/api/user/play_request`, { method: 'POST' }, {
      user_id: props.selectedUser?.id
    })
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
        props.selectedUser && props.friends?.find((u) => u.id !== props.selectedUser?.id) && (
          <button onClick={sendFriendInvite}>Invite Friend</button>
        )}
      {props.selectedGroupOption == ChannelOptions.FRIENDS &&
        props.selectedUser && (
          <button onClick={sendPlayInvite}>Invite Play</button>
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
