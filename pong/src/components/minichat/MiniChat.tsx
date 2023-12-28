import { useCallback, useEffect, useRef, useState } from "react";
import "./MiniChat.css";
import ChatMain from "./chatMain/ChatMain";
import Groups from "./groups/Groups";
import { config } from "../../config";
import {
	Conversation,
	Message,
	PrivateConversation,
	User,
} from "../../THREE/Utils/backend_types";
import UserProfile from "./userProfile/UserProfile";
import ChannelProfile from "./channelProfile/ChannelProfile";
import ChannelForm from "./channelForm/ChannelForm";
import usePayload from "../../react_hooks/use_auth";
import { chatSocket } from "../../sockets/chat";
import { notificationsSocket, private_chatSocket } from "../../sockets";
import { backend_fetch } from "../backend_fetch";
import { ChannelOptions, ChatProps } from "./ChatProps.interface";

interface ChatSize {
	width: string;
	height: string;
	bottom: string;
	right: string;
}

const MiniChat: React.FC<ChatSize> = ({ width, height, bottom, right }) => {
	const [payload, updatePayload, handleUpdate] = usePayload();

	const [me, setMe] = useState<User | undefined>(undefined);
	const [friends, setFriends] = useState<User[] | undefined>(undefined);

	const [friendConversation, setFriendConversation] = useState<PrivateConversation | undefined>(undefined)

	const [channels, setChannels] = useState<Conversation[] | undefined>(undefined);
	const [allUsers, setAllUsers] = useState<User[] | undefined>(undefined);
	const [usersBlocked, setUsersBlocked] = useState<User[] | undefined>(undefined);

	const [selectedUser, setSelectedUser] = useState<User | undefined>(undefined);
	const [selectedGroup, setSelectedGroup] = useState<Conversation | undefined>(undefined);
	const [selectedGroupOption, setSelectedGroupOption] = useState<ChannelOptions | undefined>(undefined);

	const [onUpdate, setUpdateTrigger] = useState<boolean>(false);

	/*======================================================================
	===================Const that hold all the props to pass to children===============
	======================================================================== */
	const groupsProps: ChatProps = {
		payload: payload,

		me: me,
		friends: friends,
		friendConversation: friendConversation,

		channels: channels,
		allUsers: allUsers,
		usersBlocked: usersBlocked,

		selectedUser: selectedUser,
		selectedGroup: selectedGroup,
		selectedGroupOption: selectedGroupOption,

		onUpdate: onUpdate,
		triggerUpdate: () => setUpdateTrigger((prev) => !prev),

		setMe: setMe,
		setFriends: setFriends,
		setFriendConversation: setFriendConversation,

		setChannels: setChannels,
		setAllUsers: setAllUsers,
		setUsersBlocked: setUsersBlocked,

		setSelectedUser: setSelectedUser,
		setSelectedGroup: setSelectedGroup,
		setSelectedGroupOption: setSelectedGroupOption,
	};
	/*======================================================================
	===================Find the Own User Object <ME>=====================
	======================================================================== */
	useEffect(() => {
		const currentUser = allUsers?.find((user) => user.id === payload?.id);
		if (currentUser) {
			setMe(currentUser);
		}
	}, [allUsers, onUpdate]);

	/*======================================================================
	===================Fetch<GET> All Channels========================
	======================================================================== */
	useEffect(() => {
		backend_fetch(`${config.backend_url}/api/conversation`, {
			method: 'GET'
		})
			.then((data) => setChannels(data))
			.catch(() => setChannels(undefined))
	}, [onUpdate]);

	/*======================================================================
	===================Fetch<GET>Users Blocked==================================
	======================================================================== */

	useEffect(() => {
		backend_fetch(`${config.backend_url}/api/user/blocked`, {
			method: 'GET'
		})
			.then((data) => setUsersBlocked(data))
			.catch(() => setUsersBlocked(undefined))
	}, [onUpdate]);

	/*======================================================================
	===================Fetch<GET>All Users==================================
	======================================================================== */

	useEffect(() => {
		backend_fetch(`${config.backend_url}/api/user`, {
			method: 'GET'
		})
			.then((data) => setAllUsers(data))
			.catch(() => setAllUsers(undefined))
	}, [onUpdate]);

	/*======================================================================
	===================Fetch<GET> All Friends From User=====================
	======================================================================== */
	useEffect(() => {
		backend_fetch(`${config.backend_url}/api/user/friends`, {
			method: 'GET'
		})
			.then((data) => setFriends(data))
			.catch(() => setFriends(undefined))
	}, [onUpdate, selectedGroupOption]);

	/*======================================================================
===============Fetch<Get> Messages in Private Conversation================
======================================================================== */
	useEffect(() => {
		if (selectedUser !== undefined && selectedGroupOption === ChannelOptions.FRIENDS) {
			backend_fetch(`${config.backend_url}/api/private_conversation/${selectedUser.id}`, {
				method: 'GET'
			})
				.then((data) => setFriendConversation(data))
				.catch(() => setFriendConversation(undefined))
		}

	}, [selectedUser, onUpdate])
	/*======================================================================
===============Notification socket handlers================
======================================================================== */

	/*
	Cette merde marche pas des fois parce que:
	
	
	On rentre dans le useEffect, qui setup tout les handler pr les websockets
	Les handlers ont la ref d'un state, mais quand on change le state later,
	la ref qu'ils ont est plus la bonne, donc faut trouver un moyen de mettre
	ca a jour
	
	https://react.dev/reference/react/useCallback
	https://github.com/facebook/react/issues/14543
	*/

	useEffect(() => {
		function s_friend_new(user: User) { setFriends((prev) => prev === undefined ? [user] : [user, ...prev]) }
		notificationsSocket.on("friend_new", s_friend_new);


		function s_user_create(data: { user: User }) { setAllUsers((prev) => prev === undefined ? [data.user] : [data.user, ...prev]) }
		notificationsSocket.on("user_create", s_user_create);


		function s_conv_create(data: { conversation: Conversation }) { setChannels((prev) => prev === undefined ? [data.conversation] : [data.conversation, ...prev]) }
		notificationsSocket.on("conv_create", s_conv_create);

		function s_friend_request_accepted(data: any) { groupsProps.triggerUpdate(); }
		notificationsSocket.on("friend_request_accepted", s_friend_request_accepted);

		function s_friend_delete(data: any) { groupsProps.triggerUpdate(); }
		notificationsSocket.on("friend_delete", s_friend_delete);

		function s_blocked_new(data: any) { groupsProps.triggerUpdate(); }
		notificationsSocket.on("blocked_new", s_blocked_new);

		function s_blocked_delete(data: any) { groupsProps.triggerUpdate(); }
		notificationsSocket.on("blocked_delete", s_blocked_delete);

		private_chatSocket.on("receive_message", (data) => {
			groupsProps.triggerUpdate();
		});

		return () => {
			notificationsSocket.off("conv_create", s_conv_create);

			notificationsSocket.off("friend_request_accepted", s_friend_request_accepted);
			notificationsSocket.off("friend_delete", s_friend_delete);
			notificationsSocket.off("blocked_new", s_blocked_new);
			notificationsSocket.off("blocked_delete", s_blocked_delete);

			notificationsSocket.off("friend_new", s_friend_new);
			notificationsSocket.off("user_create", s_user_create);

			chatSocket.off("receive_message")
			private_chatSocket.off("receive_message")
		};
	}, [])

	useEffect(() => {
		function s_conv_delete(data: { conversation: Conversation }) {
			setChannels((prev) => prev === undefined ? prev : prev.filter((c) => c.id !== data.conversation.id));
			if (selectedGroup?.id === data.conversation.id) {
				setSelectedGroup(undefined)
			}
		}
		notificationsSocket.on("conv_delete", s_conv_delete);


		function conv_update(data: { conversation: Conversation }) {
			setChannels((prev) => prev === undefined ? prev : prev.map((p) => p.id === data.conversation.id ? data.conversation : p))
			if (selectedGroup?.id === data.conversation.id) {
				setSelectedGroup(data.conversation)
			}

			groupsProps.triggerUpdate()
		}
		notificationsSocket.on("conv_update", conv_update)
		notificationsSocket.on("conv_join", conv_update)
		notificationsSocket.on("conv_leave", conv_update)
		notificationsSocket.on("conv_promote", conv_update)
		notificationsSocket.on("conv_demote", conv_update)

		return (() => {
			notificationsSocket.off("conv_delete", s_conv_delete)

			notificationsSocket.off("conv_update", conv_update)
			notificationsSocket.off("conv_join", conv_update)
			notificationsSocket.off("conv_leave", conv_update)
			notificationsSocket.off("conv_promote", conv_update)
			notificationsSocket.off("conv_demote", conv_update)
		})

	}, [selectedGroup, selectedUser]) //dependance necessaire sinon le 'selectedGroup' dans les event handler des websocket est pas a jour :(

	const componentSize: React.CSSProperties = {
		width: width,
		height: height,
		position: "fixed",
		bottom: bottom,
		right: right,
		display: "flex",
		justifyContent: "end",
		alignItems: "center",
	};

	return (
		<div style={componentSize}>
			{selectedUser && <UserProfile {...groupsProps} />}
			<div className="glass-container-minichat">
				{
					selectedGroupOption === ChannelOptions.CREATE_CHANNEL &&
					<ChannelForm {...groupsProps} />
				}
				{
					selectedGroupOption === ChannelOptions.CHANNEL && selectedGroup !== undefined ?
						<ChannelProfile {...groupsProps} /> : undefined
				}

				<Groups {...groupsProps} />
				<ChatMain {...groupsProps} />
			</div>
		</div>
	);
};
export default MiniChat;
