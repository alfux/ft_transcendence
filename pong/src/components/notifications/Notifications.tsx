import React, {
  useState,
  useEffect,
  useRef,
  Dispatch,
  SetStateAction,
} from "react";

import "./Notifications.css";
import { config } from "../../config";
import { User } from "../scorebar/ScoreBar";
import { Interface } from "readline";
import { notifications } from "../../sockets/notifications";
import { chatSocket } from "../../sockets/chat";

const Notifications: React.FC = () => {
  const [friendsRequest, setFriendsRequests] = useState<any | null>(null);
  const [toogleButton, setToogleButton] = useState<string>("show");
  const [dataContent, setDataContent] = useState<any>(null);
  const [dataType, setDataType] = useState<any>(null);

  useEffect(() => {
    console.log("Socket connection status:", notifications.connected);
    if (!notifications.connected) {
      notifications.connect();
      console.log("ups .. ok now connected");
    }
    
    chatSocket.on("receive_message",(data)=>{
      console.log("RECEIUVE A MNESAGE")
    })
    notifications.on("friend_new", (data: { req: any } | any) => {
      console.log("Received friend new");
      setDataType("friend_new");
      setDataContent(data);
    });

    notifications.on("friend_request_recv", (data: { req: any }) => {
      setDataType("friend_request_recv");
      setDataContent(data);
      console.log("friend request received");
    });
    notifications.on("friend_delete", (data: { req: any }) => {
      setDataType("friend_delete");
      setDataContent(data);
      console.log("friend deleted");
    });
    notifications.on("blocked_new", (data: { req: any }) => {
      console.log("blocked_new");
    });
    notifications.on("friend_request_denied", (data: { req: any }) => {
      setDataType("friend_request_denied");
      setDataContent(data);
    });
    return(()=>{
      console.log("disconected")
      notifications.disconnect()
    })
  });

  /*======================================================================
  ===================Fetch Friends Requests================================
  ======================================================================== */
  useEffect(() => {
    console.log("Socket connection status:", notifications.connected);
    const fetchRequets = async () => {
      try {
        const enable2FAEndpoint = `${config.backend_url}/api/user/friend_request`;
        const response = await fetch(enable2FAEndpoint, {
          method: "GET",
          credentials: "include",
        });

        if (response.ok) {
          const result = await response.json();
          setFriendsRequests(result);
        } else {
          console.error("Could not get friendRequests:", response.status);
        }
      } catch (error) {
        console.error("Error fetching friendRequests:", error);
      }
    };
    fetchRequets();
  }, [dataType, dataContent]);
  /*======================================================================
  ===================Toogle Notification Bar On or Off=====================
  ======================================================================== */
  function toogleNotification() {
    if (toogleButton == "show") {
      setToogleButton("hide");
    } else {
      setToogleButton("show");
    }
  }
  /*======================================================================
  ===================Send Post Request to Accept Friend=====================
  ======================================================================== */
  const getNotificationRequests = friendsRequest?.received?.map((user: any) => {
    async function acceptFriend() {
      const url = `${config.backend_url}/api/user/friend_request/accept`;
      try {
        const response = await fetch(url, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: user.id }),
        });
        if (response.ok) {
          const result = await response.text();
        } else {
          alert("didnt sended accept request");
          console.error(
            "Error sending invite Server responded with status:",
            response.status
          );
        }
      } catch (error) {
        console.error("Error fetching:", error);
      }
    }
    if (user?.sender) {
      return (
        <div key={user.sender?.id}>
          <img
            key={user.sender?.id}
            src={user.sender?.image}
            alt={user.sender?.id}
          />
          <p>Name: {user.sender?.username}</p>
          <p>{user.sender?.username} has made a friend request.</p>
          <div className="notifications-buttons-box">
            <button onClick={acceptFriend}>Accept</button>
            <button>Reject</button>
          </div>
        </div>
      );
    } else {
      return null;
    }
  });
  console.log("user", dataContent?.user?.username, dataType);
  return (
    <div
      className={`notifications-container-${
        toogleButton == "show" && friendsRequest ? "on" : "off"
      }`}
    >
      <div className="notifications-content">
        <div className="notification-profile">
          {dataType === "friend_request_recv" && getNotificationRequests}
          {dataType === "friend_new" && (
            <p>New Friend Added: {dataContent?.user?.username} </p>
          )}
          {dataType === "friend_delete" && (
            <p>No longer friend with: {dataContent?.user?.username} </p>
          )}
          {dataType === "friend_request_recv" && (
            <p>Friend Request Received: {dataContent?.user?.username} </p>
          )}
          {dataType === "friend_request_denied" && (
            <p>Friend Request Denied: {dataContent?.user?.username} </p>
          )}
        </div>
      </div>
      <div key={4} className="notification-popup">
        <button onClick={toogleNotification}></button>
      </div>
    </div>
  );
};
export default Notifications;
