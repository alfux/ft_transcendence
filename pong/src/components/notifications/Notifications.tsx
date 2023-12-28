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
import { ChatEvents, FriendRequest, Message, NotificationEvent, PlayRequest } from "../../THREE/Utils/backend_types";
import { LoggedStatus } from "../../THREE/Utils";

const Notifications: React.FC = () => {
	const [friendsRequest, setFriendsRequests] = useState<any | null>(null);
	const [playRequest, setPlayRequests] = useState<any | null>(null);
	const [toogleButton, setToogleButton] = useState<string>("hide");
	const [dataContent, setDataContent] = useState<any>({ username: "Our website", message: "WElcome for being online" });
	const [dataType, setDataType] = useState<any>();
	const [payload, updatePayload, handleUpdate] = usePayload();
	const [accept, setAccept] = useState<boolean>(false);

	useEffect(() => {

		//function s_receive_message(data: any) {
		//	setDataContent(data)
		//	setDataType("receive_message")
		//}
		//chatSocket.on("receive_message", s_receive_message)

		function s_friend_new(data: any) {
			setDataType("friend_new");
			setDataContent(data);
		}
		notificationsSocket.on("friend_new", s_friend_new);

		function s_friend_request_recv(data: any) {
			setDataType("friend_request_recv");
			setDataContent(data);
		}
		notificationsSocket.on("friend_request_recv", s_friend_request_recv);

		function s_friend_delete(data: any) {
			setDataType("friend_delete");
			setDataContent(data);
		}
		notificationsSocket.on("blocked_new", s_friend_delete);

		function s_friend_request_denied(data: any) {
			setDataType("friend_request_denied");
			setDataContent(data);
		}
		notificationsSocket.on("friend_request_denied", s_friend_request_denied);


		function s_status_change(data: { user: User }) {
			setDataType("status_change")
			setDataContent(data)
		}
		notificationsSocket.on("status_change", s_status_change)

		function s_play_request_recv(data: { req: PlayRequest }) {
			setDataType("play_request_recv")
			setDataContent(data)
		}
		notificationsSocket.on("play_request_recv", s_play_request_recv)

		return (() => {
			//chatSocket.off("receive_message", s_receive_message)
			notificationsSocket.off("friend_new", s_friend_new);
			notificationsSocket.off("friend_request_recv", s_friend_request_recv);
			notificationsSocket.off("blocked_new", s_friend_delete);
			notificationsSocket.off("friend_request_denied", s_friend_request_denied);
			notificationsSocket.off("status_change", s_status_change)
			notificationsSocket.off("play_request_recv", s_play_request_recv)
		})
	});


	if (toogleButton === "show") {
		setTimeout(() => {
			setToogleButton('hide');
		}, 10000)
	}


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
		setToogleButton("show")
		setAccept(false)
	}, [dataType, dataContent, accept]);
	/*======================================================================
	===================Fetch Play Requests================================
	======================================================================== */
	useEffect(() => {

		const fetchRequets = async () => {
			try {
				const enable2FAEndpoint = `${config.backend_url}/api/user/play_request`;
				const response = await fetch(enable2FAEndpoint, {
					method: "GET",
					credentials: "include",
				});

				if (response.ok) {
					const result = await response.json();
					setPlayRequests(result);
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
			backend_fetch(`${config.backend_url}/api/user/friend_request/accept`, {
				method: 'POST'
			}, {
				id: user.id
			})
				.then(() => {
					setAccept(true)
					setFriendsRequests(null)
				})
		}
		async function denyFriend() {
			backend_fetch(`${config.backend_url}/api/user/friend_request/deny`, {
				method: 'POST'
			}, {
				id: user.id
			})
				.then(() => {
					setAccept(true)
					setFriendsRequests(null)
				})
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
						<button onClick={denyFriend}>Reject</button>
					</div>
				</div>
			);
		} else {
			return null;
		}
	});

	const getPlayNotificationRequests = playRequest?.received?.map((user: any) => {

		async function acceptPlay() {
			backend_fetch(`${config.backend_url}/api/user/play_request/accept`, {
				method: 'POST'
			}, {
				id: user.id
			})
				.then(() => {
					setAccept(true)
					setPlayRequests(null)
				})
		}
		async function denyPlay() {
			backend_fetch(`${config.backend_url}/api/user/play_request/deny`, {
				method: 'POST'
			}, {
				id: user.id
			})
				.then(() => {
					setAccept(true)
					setPlayRequests(null)
				})
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
					<p>{user.sender?.username} has made a play request.</p>
					<div className="notifications-buttons-box">
						<button onClick={acceptPlay}>Accept</button>
						<button onClick={denyPlay}>Reject</button>
					</div>
				</div>
			);
		} else {
			return null;
		}
	});

	function getLoggedStatusAsString(st: LoggedStatus) {
		return Object.keys(LoggedStatus).at(st + 4)
	}

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
					{dataType === "status_change" && (
						<p>{dataContent?.user?.username} is now {getLoggedStatusAsString(dataContent?.user?.isAuthenticated)}.</p>
					)}
					{getNotificationRequests}
					{getPlayNotificationRequests}
				</div>
			</div>
			<div key={4} className="notification-popup">
				<button onClick={toogleNotification}></button>
			</div>
		</div>
	);
};
export default Notifications;
