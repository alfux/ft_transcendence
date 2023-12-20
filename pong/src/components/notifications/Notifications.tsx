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
	const [dataType, setDataType] = useState<any>(undefined);
	const [payload, updatePayload, handleUpdate] = usePayload();


	useEffect(() => {

		/*
		Je suis 99% sur que ca ca sert a rien, parce que au moment du useEffect la socket ne sera jamais connecté, pas besoin
		de lui demander a chaque fois de se connecter une nouvelle fois
		Ca peut prendre du temps a se connecter, et de toute maniere tout les messages
		sont stockés et envoyé une fois connecté.

		if (!notificationsSocket.connected) {
			notificationsSocket.connect();
			console.log("ups .. ok now connected");
		}
		*/

		/*
		Ici on est obligé de creer une fonction pour chaque event, parce que quand on fait
		socket.off, on doit passer la meme fonction pour etre sur que socket.off enleve le bon listener
		(Si on fait pas socket.off on recoit 15000 events)
		*/

		function socket_event_receive_message(data: {conversation_id: number, message: Message}) {
			setDataContent(data)
			setDataType(ChatEvents.RECEIVE_MESSAGE)
			console.log("Received a message")
		}
		chatSocket.on(ChatEvents.RECEIVE_MESSAGE, socket_event_receive_message)

		
		function socket_event_friend_new(data: { req: FriendRequest }) {
			console.log("Received friend new");
			setDataType(NotificationEvent.FRIEND_NEW);
			setDataContent(data);
		}
		notificationsSocket.on(NotificationEvent.FRIEND_NEW, socket_event_friend_new);
		

		function socket_event_friend_request_recv(data: { req: FriendRequest }) {
			console.log("Received friend request");
			setDataType(NotificationEvent.FRIEND_REQUEST_RECV);
			setDataContent(data);
		}
		notificationsSocket.on(NotificationEvent.FRIEND_REQUEST_RECV, socket_event_friend_request_recv);


		function socket_event_friend_delete(data: { req: any }) {
			console.log("Friend deleted");
			setDataType(NotificationEvent.FRIEND_DELETE);
			setDataContent(data);
		};
		notificationsSocket.on(NotificationEvent.FRIEND_DELETE, socket_event_friend_delete)


		function socket_event_blocked_new(data: { req: any }) {
			console.log(NotificationEvent.BLOCKED_NEW);
		}
		notificationsSocket.on(NotificationEvent.BLOCKED_NEW, socket_event_blocked_new);
		
		
		function socket_event_friend_request_denied(data: { req: any }) {
			setDataType(NotificationEvent.FRIEND_REQUEST_DENIED);
			setDataContent(data);
		};
		notificationsSocket.on(NotificationEvent.FRIEND_REQUEST_DENIED, socket_event_friend_request_denied)

		return (() => {
			chatSocket.off(ChatEvents.RECEIVE_MESSAGE, socket_event_receive_message)
		
			notificationsSocket.off(NotificationEvent.FRIEND_NEW, socket_event_friend_new)
			notificationsSocket.off(NotificationEvent.FRIEND_REQUEST_RECV, socket_event_friend_request_recv)
			notificationsSocket.off(NotificationEvent.FRIEND_DELETE, socket_event_friend_delete)
			notificationsSocket.off(NotificationEvent.BLOCKED_NEW, socket_event_blocked_new)
			notificationsSocket.off(NotificationEvent.FRIEND_REQUEST_DENIED, socket_event_friend_request_denied)
		})

	}, []);


	if (toogleButton === "show") {
		setTimeout(() => {
			setToogleButton('hide');
		}, 4000)
	}


	/*======================================================================
	===================Fetch Friends Requests================================
	======================================================================== */
	useEffect(() => {
		backend_fetch(`${config.backend_url}/api/user/friend_request`, {
			method: 'GET'
		})
			.then((json) => {
				setFriendsRequests(json)
			})
			.catch((e) => { if (e instanceof FetchError) { } else throw e })

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
				.catch((e) => { if (e instanceof FetchError) {
					alert("Couldn't accept friend request :(")
				} else throw e })
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
					{/* petit changement: les message recu par l'event 'receive_message' sont maintenant du type: {conversation_id: number, message: Message} */}
					{dataType === ChatEvents.RECEIVE_MESSAGE && dataContent?.username !== payload?.username && <p>🗨️ {dataContent.message.sender.username} sent: {dataContent.message.content}</p>}
					{dataType === NotificationEvent.FRIEND_NEW && (
						<p>New Friend Added: {dataContent?.user?.username} </p>
					)}
					{dataType === NotificationEvent.FRIEND_DELETE && (
						<p>No longer friend with: {dataContent?.user?.username} </p>
					)}
					{dataType === NotificationEvent.FRIEND_REQUEST_RECV && (
						<p>Friend Request Received: {dataContent?.user?.username} </p>
					)}
					{dataType === NotificationEvent.FRIEND_REQUEST_DENIED && (
						<p>Friend Request Denied: {dataContent?.user?.username} </p>
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
