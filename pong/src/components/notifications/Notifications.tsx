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
import usePayload from "../../react_hooks/use_auth";
import { notificationsSocket, chatSocket, gameSocket } from "../../sockets";
import { FetchError, backend_fetch } from "../backend_fetch";
import { ChatEvents, FriendRequest, Message, NotificationEvent } from "../../THREE/Utils/backend_types";

const Notifications: React.FC = () => {
	const [friendsRequest, setFriendsRequests] = useState<any | null>(null);
	const [toogleButton, setToogleButton] = useState<string>("hide");
	const [dataContent, setDataContent] = useState<any>({ username: "Our website", message: "WElcome for being online" });
	const [dataType, setDataType] = useState<any>();
	const [payload, updatePayload, handleUpdate] = usePayload();
	const [accept, setAccept] = useState<boolean>(false);

	useEffect(() => {
		console.log("Socket connection status:", notificationsSocket.connected);
		if (!notificationsSocket.connected) {
			notificationsSocket.connect();
			console.log("ups .. ok now connected");
		}

		function s_receive_message(data: any) {
			setDataContent(data)
			setDataType("receive_message")
		}
		chatSocket.on("receive_message", s_receive_message)

		function s_friend_new(data: any) {
			setDataType("friend_new");
			setDataContent(data);
		}
		notificationsSocket.on("friend_new", s_friend_new);

		function s_friend_request_recv(data: any) {
			setDataType("friend_request_recv");
			setDataContent(data);
			console.log("friend request received");
		}
		notificationsSocket.on("friend_request_recv", s_friend_request_recv);

		function s_friend_delete(data: any) {
			setDataType("friend_delete");
			setDataContent(data);
			console.log("friend deleted");
		}
		notificationsSocket.on("blocked_new", s_friend_delete);

		function s_friend_request_denied(data: any) {
			setDataType("friend_request_denied");
			setDataContent(data);
		}
		notificationsSocket.on("friend_request_denied", s_friend_request_denied);

		return (() => {
			chatSocket.off("receive_message", s_receive_message)
			notificationsSocket.off("friend_new", s_friend_new);
			notificationsSocket.off("friend_request_recv", s_friend_request_recv);
			notificationsSocket.off("blocked_new", s_friend_delete);
			notificationsSocket.off("friend_request_denied", s_friend_request_denied);
		})
	});


	if (toogleButton === "show") {
		setTimeout(() => {
			setToogleButton('hide');
		}, 4000)
	}


	/*======================================================================
	===================Fetch Friends Requests================================
	======================================================================== */
	useEffect(() => {
		console.log("Socket connection status:", notificationsSocket.connected);
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
		setToogleButton("show")
		setAccept(false)
	}, [dataType, dataContent, accept]);
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
					setAccept(true)
					setFriendsRequests(null)
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
	console.log("dataContent", dataContent, dataType);
	return (
		<div
			className={`notifications-container-${toogleButton == "show" && friendsRequest ? "on" : "off"
				}`}
		>
			<div className="notifications-content">
				<div className="notification-profile">
					{dataType === "blocked_delete" && (
						<p>{dataContent?.user?.username} has Unblocked your</p>
					)}
					{dataType === "receive_message" && dataContent?.username !== payload?.username && <p>🗨️ {dataContent.message.sender.user.username} has sent: {dataContent.message.content}</p>}
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
					{dataType === "blocked_new" && (
						<p>{dataContent?.user?.username} has Blocked you.</p>
					)}
					{getNotificationRequests}
				</div>
			</div>
			<div key={4} className="notification-popup">
				<button onClick={toogleNotification}></button>
			</div>
		</div>
	);
};
export default Notifications;
