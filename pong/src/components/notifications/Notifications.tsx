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
import { notificationsSocket } from "../../sockets";
import { FetchError, backend_fetch } from "../backend_fetch";
import { FriendRequest } from "../../THREE/Utils/backend_types";

const Notifications: React.FC = () => {
  const [friendsRequest, setFriendsRequests] = useState<any | null>(null);
  const [toogleButton, setToogleButton] = useState<string>("show");
  const [dataContent, setDataContent] = useState<any>(null);
  const [dataType, setDataType] = useState<any>(null);

  useEffect(() => {

    notificationsSocket.on("friend_new", (data: { req: any } | any) => {
      console.log("Received friend new");
      setDataType("friend_new");
      setDataContent(data);
    });

    notificationsSocket.on("friend_request_recv", (data: { req: any }) => {
      setDataType("friend_request_recv");
      setDataContent(data);
      console.log("friend request received");
    });
    notificationsSocket.on("friend_delete", (data: { req: any }) => {
      setDataType("friend_delete");
      setDataContent(data);
      console.log("friend deleted");
    });
    notificationsSocket.on("blocked_new", (data: { req: any }) => {
      console.log("blocked_new");
    });
    notificationsSocket.on("friend_request_denied", (data: { req: any }) => {
      setDataType("friend_request_denied");
      setDataContent(data);
    });

  });

  /*======================================================================
  ===================Fetch Friends Requests================================
  ======================================================================== */
  useEffect(() => {

    backend_fetch(`${config.backend_url}/api/user/friend_request`, {
      method: 'GET'
    })
      .then((json) => {
        console.log(json)
        setFriendsRequests(json)
      })
      .catch((e) => { if (e instanceof FetchError) {} else throw e })

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
  const getNotificationRequests = friendsRequest?.received?.map((request: FriendRequest) => {

    const acceptFriend = () => {
      backend_fetch(`${config.backend_url}/api/user/friend_request/accept`, {
        method: "POST"
      }, {
        id: request.id
      })
        .then((v) => {
          if (v === undefined) {
            alert("Couldn't accept friend request :(")
          }
        })
        .catch((e) => { if (e instanceof FetchError) {} else throw e })
    }

    if (request?.sender) {
      return (
        <div key={request.sender?.id}>
          <img
            key={request.sender?.id}
            src={request.sender?.image}
            alt={request.sender?.id.toString()}
          />
          <p>Name: {request.sender?.username}</p>
          <p>{request.sender?.username} has made a friend request.</p>
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
      className={`notifications-container-${toogleButton == "show" && friendsRequest ? "on" : "off"
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
