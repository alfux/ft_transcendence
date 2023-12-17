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

const Notifications: React.FC<{
  notificationData: { type: string; data: any } | null;
}> = ({ notificationData }) => {
  const [friendsRequest, setFriendsRequests] = useState<any | null>(null);
  const [toogleButton, setToogleButton] = useState<string>("show");
  const [friends, setFriends] = useState<User[] | null>(null);
  /*======================================================================
  ===================Fetch Friends Requests================================
  ======================================================================== */
  useEffect(() => {
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
  }, [notificationData]);
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
  useEffect(() => {});
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
  return (
    <div
      key={1}
      className={`notifications-container-${
        toogleButton == "show" && friendsRequest ? "on" : "off"
      }`}
    >
      <div key={2} className="notifications-content">
        <div key={3} className="notification-profile">
          {getNotificationRequests}
          {notificationData?.type === "friend_new" && (
            <p>New Friend Added: {notificationData.data.user?.username} </p>
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
