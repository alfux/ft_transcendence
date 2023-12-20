import { useEffect, useRef, useState } from "react";
import "./MiniChat.css";
import ChatMain from "./chatMain/ChatMain";
import Groups from "./groups/Groups";
import { config } from "../../config";
import {
	Conversation,
	ConversationUser,
	FriendRequest,
	Message,
	User,
} from "../../THREE/Utils/backend_types";
import UserProfile from "./userProfile/UserProfile";
import ChannelProfile from "./channelProfile/ChannelProfile";
import ChannelForm from "./channelForm/ChannelForm";
import usePayload from "../../react_hooks/use_auth";
import { JwtPayload } from "../../THREE/Utils";
import { chatSocket } from "../../sockets/chat";
import { gameSocket, notificationsSocket } from "../../sockets";
import { FetchError, backend_fetch } from "../backend_fetch";

export enum ChannelOptions {
	CREATE_CHANNEL = "create channel",
	ONLINE_USERS = "online users",
	FRIENDS = "friends",
	CHANNEL = "channel",
}

export interface ChatProps {
	me?: User;
	payload?: JwtPayload;

	isInChannel: boolean;

	channels?: Conversation[];
	friends?: User[];
	allUsers?: User[];
	channelMessages?: Message[];

	selectedUser?: User;
	selectedGroup?: Conversation;
	selectedGroupOption?: ChannelOptions;

	messageText: string;
	toogledButton: string | undefined;
	notificationType: any;

	setMe: React.Dispatch<React.SetStateAction<User | undefined>>;

	setChannels: React.Dispatch<React.SetStateAction<Conversation[] | undefined>>;
	setFriends: React.Dispatch<React.SetStateAction<User[] | undefined>>;
	setAllUsers: React.Dispatch<React.SetStateAction<User[] | undefined>>;
	setChannelMessages: React.Dispatch<React.SetStateAction<Message[] | undefined>>;

	setSelectedUser: (user?: User) => void;
	setSelectedGroup: React.Dispatch<React.SetStateAction<any | undefined>>;
	setSelectedGroupOption: React.Dispatch<React.SetStateAction<ChannelOptions | undefined>>;

	setMessageText: React.Dispatch<React.SetStateAction<any>>;
	setNotificationType: (notificationType: any) => void;
	setToogledButton: (toogledButton?: string) => void;

	setFriendsRequests: React.Dispatch<React.SetStateAction<User | undefined>>;

	displayContainer: React.MutableRefObject<HTMLDivElement | null>;
}

interface ChatSize {
	width: string;
	height: string;
	bottom: string;
	right: string;
}

const MiniChat: React.FC<ChatSize> = ({ width, height, bottom, right }) => {

	const [me, setMe] = useState<User>();
	const [payload, updatePayload, handleUpdate] = usePayload();

	const [isInChannel, setIsInChannel] = useState<boolean>(false);

	const [channels, setChannels] = useState<Conversation[]>();
	const [friends, setFriends] = useState<User[]>();
	const [allUsers, setAllUsers] = useState<User[]>();
	const [channelMessages, setChannelMessages] = useState<Message[]>();

	const [selectedUser, setSelectedUser] = useState<User>();
	const [selectedGroup, setSelectedGroup] = useState<Conversation>();
	const [selectedGroupOption, setSelectedGroupOption] = useState<ChannelOptions>();


	const [messageText, setMessageText] = useState<string>("");
	const [toogledButton, setToogledButton] = useState<string>();
	const [notificationType, setNotificationType] = useState<any>()

	const [friendsRequests, setFriendsRequests] = useState<User>();

	const displayContainer = useRef<HTMLDivElement>(null);

	/*======================================================================
	===================Const that hold all the props to pass to children===============
	======================================================================== */
	const groupsProps = {
		me,
		payload,

		isInChannel,

		channels,
		friends,
		allUsers,
		channelMessages,

		selectedUser,
		selectedGroup,
		selectedGroupOption,

		messageText,
		toogledButton,
		notificationType,

		setMe,

		setChannels,
		setFriends,
		setAllUsers,
		setChannelMessages,

		setSelectedUser,
		setSelectedGroup,
		setSelectedGroupOption,

		setMessageText,
		setNotificationType,
		setToogledButton,

		setFriendsRequests,

		displayContainer,
	};

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
	======================USE EFFECT (update on notif)======================
	======================================================================== */
	useEffect(() => {
		chatSocket.on("receive_message", (data) => {
			setNotificationType(data);
		})
		gameSocket.on("receive_message", (data) => {
			setNotificationType(data);
		})
		return (() => {
			chatSocket.off("receive_message")
			chatSocket.disconnect()
		})
	}, [])

	useEffect(() => {

		//Get all channels
		backend_fetch(`${config.backend_url}/api/conversation`, {
			method: 'GET'
		})
			.then((json) => {
				setChannels(json)
			})
			.catch((e) => { if (e instanceof FetchError) { } else throw e })

		//Get all users
		backend_fetch(`${config.backend_url}/api/user`, {
			method: 'GET'
		})
			.then((json) => {
				setAllUsers(json)
			})
			.catch((e) => { if (e instanceof FetchError) { } else throw e })

	}, [notificationType]);

	/*======================================================================
	=============USE EFFECT (update on notif && selected group)=============
	======================================================================== */
	useEffect(() => {
		//Get all friends
		backend_fetch(`${config.backend_url}/api/user/friends`, {
			method: 'GET'
		})
			.then((json) => {
				setFriends(json)
			})
			.catch((e) => { if (e instanceof FetchError) { } else throw e })

	}, [selectedGroupOption, notificationType]);

	/*======================================================================
	=============USE EFFECT (update on selected group)=============
	======================================================================== */
	useEffect(() => {
		//Get selected channel messages
		if (selectedGroup !== undefined) {
			backend_fetch(`${config.backend_url}/api/conversation/${selectedGroup.id}`, {
				method: 'GET'
			})
				.then((json: Conversation) => {
					setChannelMessages(json?.messages)
				})
				.catch((e) => { if (e instanceof FetchError) { } else throw e })
		}
	}, [selectedGroupOption, selectedGroup])


	useEffect(() => {
		function socket_msg(data: {
			conversation_id: number,
			message: Message
		}) {
			if (selectedGroup !== undefined && selectedGroup.id === data.conversation_id)
				setChannelMessages((prev) => prev === undefined ? prev : [...prev, data.message])
		}

		chatSocket.on("receive_message", socket_msg)
		return (() => {
			chatSocket.off("receive_message", socket_msg)
		})
	}, [selectedGroup])


	useEffect(() => {
		function socket_msg(data: {
			user: User,
			conversation: Conversation
		}) {

			console.log("LEAVE / JOIN")

			channels?.forEach((v, i) => {
				if (v.id === data.conversation.id) {
					channels![i] = data.conversation
				}
			})

			if (selectedGroup && selectedGroup.id === data.conversation.id) {
				setSelectedGroup(data.conversation)
			}
		}

		chatSocket.on("conv_join", socket_msg)
		chatSocket.on("conv_leave", socket_msg)
		return (() => {
			chatSocket.off("conv_join", socket_msg)
			chatSocket.off("conv_leave", socket_msg)
		})
	}, [selectedGroup])


	useEffect(() => {

		notificationsSocket.on("friend_new", (user: User) => {
			setFriends((prev) => (prev === undefined) ? [user] : [user, ...prev])
		})
		return () => {
			notificationsSocket.off("friend_new")
		}
	}, [notificationType, selectedGroupOption]);


	useEffect(() => {

		notificationsSocket.on("conv_create", (data: { conversation: Conversation }) => {
			setChannels((prev) => {
				return (prev === undefined) ? [data.conversation] : [data.conversation, ...prev]
			})
		})
		notificationsSocket.on("conv_delete", (data: { conversation: Conversation }) => {
			setChannels((prev) => {
				return (prev === undefined) ? prev : prev.filter((c) => c.id !== data.conversation.id)
			})
		})

		return () => {
			notificationsSocket.off("conv_create")
			notificationsSocket.off("conv_delete")
		}
	}, [notificationType]);

	useEffect(() => {
		notificationsSocket.on("user_create", (data: { user: User }) => {
			setAllUsers((prev) => (prev === undefined) ? [data.user] : [data.user, ...prev])
		})
		return () => {
			notificationsSocket.off("user_create")
		}
	})








	useEffect(() => {
		setIsInChannel(false)
		selectedGroup?.users.map((channelUser: any) => {
			if (me?.id === channelUser.user.id) {
				setIsInChannel(true);
			}
		}
		);
	}, [selectedGroup, notificationType]);

	const componentSize: React.CSSProperties = {
		width: width,
		height: height,
		position: 'fixed',
		bottom: bottom,
		right: right,
		display: 'flex',
		justifyContent: 'end',
		alignItems: 'center',
	};

	return (
		<div style={componentSize}>
			{selectedUser && <UserProfile {...groupsProps} />}
			<div className="glass-container-minichat">
				{selectedGroupOption === ChannelOptions.CREATE_CHANNEL && (
					<ChannelForm {...groupsProps} />
				)}
				{selectedGroupOption === ChannelOptions.CHANNEL && toogledButton === "Channel" && <ChannelProfile {...groupsProps} />}
				<Groups {...groupsProps} />
				<ChatMain {...groupsProps} />
			</div>
		</div>
	);
};
export default MiniChat;
