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

export enum ChannelOptions {
	CREATE_CHANNEL = "create channel",
	ONLINE_USERS = "online users",
	FRIENDS = "friends",
	CHANNEL = "channel",
}

export interface ChatProps {
	isInChannel: boolean;
	me: User | undefined;
	payload: JwtPayload | undefined;
	channels: Conversation[] | null;
	friends: User[] | null;
	allUsers: User[] | null;
	selectedUser: User | undefined;
	selectedGroup: Conversation | undefined;
	selectedGroupOption: ChannelOptions | null;
	channelMessages: any | null;
	messageText: any;
	toogledButton: string | null;
	notificationType: any;
	usersBlocked: any;
	setUsersBlocked: (usersBlocked: any) => void;
	setNotificationType: (notificationType: any) => void;
	setToogledButton: (toogledButton: string | null) => void;
	setSelectedChannel: (channel: Conversation | undefined) => void;
	setSelectedChannelOption: (option: ChannelOptions) => void;
	setSelectedUser: (user: User | undefined) => void;
	setChannels: React.Dispatch<React.SetStateAction<Conversation[] | null>>;
	setFriends: React.Dispatch<React.SetStateAction<User[] | null>>;
	setAllUsers: React.Dispatch<React.SetStateAction<User[] | null>>;
	setSelectedGroup: React.Dispatch<React.SetStateAction<any | undefined>>;
	setSelectedGroupOption: React.Dispatch<React.SetStateAction<ChannelOptions | null>>;
	setMe: React.Dispatch<React.SetStateAction<User | undefined>>;
	setFriendsRequests: React.Dispatch<React.SetStateAction<User | undefined>>;
	setChannelMessages: React.Dispatch<React.SetStateAction<any | null>>;
	setMessageText: React.Dispatch<React.SetStateAction<any>>;
	setConversation: React.Dispatch<React.SetStateAction<any>>;
	setNewChannel: React.Dispatch<React.SetStateAction<any | null>>;
	displayContainer: React.MutableRefObject<HTMLDivElement | null>;
}

interface ChatSize {
	width: string;
	height: string;
	bottom: string;
	right: string;
}

const MiniChat: React.FC<ChatSize> = ({ width, height, bottom, right }) => {
	const [payload, updatePayload, handleUpdate] = usePayload();
	const [channels, setChannels] = useState<Conversation[] | null>(null);
	const [selectedGroupOption, setSelectedGroupOption] =
		useState<ChannelOptions | null>(null);
	const [selectedUser, setSelectedUser] = useState<User | undefined>(undefined);
	const [selectedGroup, setSelectedGroup] = useState<any | undefined>(
		undefined
	);
	const [me, setMe] = useState<User | undefined>(undefined);
	const [allUsers, setAllUsers] = useState<User[] | null>(null);
	const [friends, setFriends] = useState<User[] | null>(null);
	const [friendsRequests, setFriendsRequests] = useState<User | undefined>();
	const [channelMessages, setChannelMessages] = useState<any | null>(null);
	const [messageText, setMessageText] = useState<any>("");
	const [conversation, setConversation] = useState<any>(null);
	const [newChannel, setNewChannel] = useState<any | null>(null);
	const displayContainer = useRef<HTMLDivElement>(null);
	const [isInChannel, setIsInChannel] = useState<boolean>(false);
	const [toogledButton, setToogledButton] = useState<string | null>(null);
	const [notificationType, setNotificationType] = useState<any>(null);
	const [usersBlocked, setUsersBlocked] = useState<any>(null);
	/*======================================================================
	===================Functions to Pass To Children To Set State===============
	======================================================================== */
	const handleSelectGroup = (channel: any | undefined) => {
		setSelectedGroup(channel);
	};
	const handleSelectGroupOption = (option: ChannelOptions) => {
		setSelectedGroupOption(option);
	};

	const handleSelectUser = (user: User | undefined) => {
		setSelectedUser(user);
	};
	/*======================================================================
	===================Const that hold all the props to pass to children===============
	======================================================================== */
	const groupsProps = {
		isInChannel,
		me,
		payload,
		channels,
		friends,
		allUsers,
		selectedUser,
		selectedGroup,
		selectedGroupOption,
		channelMessages,
		messageText,
		toogledButton,
		notificationType,
		usersBlocked,
		setUsersBlocked,
		setNotificationType,
		setToogledButton,
		setSelectedChannel: handleSelectGroup,
		setSelectedChannelOption: handleSelectGroupOption,
		setSelectedUser: handleSelectUser,
		setChannels,
		setFriends,
		setAllUsers,
		setSelectedGroup,
		setSelectedGroupOption,
		setMe,
		setFriendsRequests,
		setChannelMessages,
		setMessageText,
		setConversation,
		setNewChannel,
		displayContainer,
	};
	/*======================================================================
	===================Find the Own User Object <ME>=====================
	======================================================================== */
	useEffect(() => {
		chatSocket.on("receive_message", (data) => {
			setNotificationType(data);
		});
		gameSocket.on("receive_message", (data) => {
			setNotificationType(data);
		});
	}, []);
	useEffect(() => {
		const currentUser = allUsers?.find((user) => user.id === payload?.id);
		if (currentUser) {
			setMe(currentUser);
		}
	}, [allUsers, notificationType]);

	/*======================================================================
	===================Fetch<GET> All Channels========================
	======================================================================== */

	useEffect(() => {
		const requestConversation = async () => {
			try {
				const conversation_url = `${config.backend_url}/api/conversation/`;
				const response = await fetch(conversation_url, {
					method: "GET",
					credentials: "include",
				});
				if (response.ok) {
					const result = await response.json();
					setChannels(result);
				} else {
					console.error("Could not get Conversation:", response.status);
				}
			} catch (error) {
				console.error("Error fetching Conversation:", error);
			}
		};
		requestConversation();





		/*
		Je sais que c'est degueulasse mais pour éviter de recevoir les memes events plein de fois
		faut faire les socket.off, et pour ca faut creer une fonction pour chaque socket.on.
		(Pour que le socket.off retire le bon handler)
		*/
		function s_conv_create(data: { conversation: Conversation }) {
			setChannels((prev) => {
				return prev === null
					? [data.conversation]
					: [data.conversation, ...prev];
			});
		}
		notificationsSocket.on("conv_create", s_conv_create);

		function s_conv_delete(data: { conversation: Conversation }) {
			setChannels((prev) => {
				return prev === null
					? prev
					: prev.filter((c) => c.id !== data.conversation.id);
			});
		}
		notificationsSocket.on("conv_delete", s_conv_delete);

		function s_friend_request_accepted(data:any) { setNotificationType(data); }
		notificationsSocket.on("friend_request_accepted", s_friend_request_accepted);
		
		function s_friend_new(data:any) { setNotificationType(data); }
		notificationsSocket.on("friend_new", s_friend_new);

		function s_friend_delete(data:any) { setNotificationType(data); }
		notificationsSocket.on("friend_delete", s_friend_delete);

		function s_blocked_new(data:any) { setNotificationType(data); }
		notificationsSocket.on("blocked_new", s_blocked_new);

		function s_blocked_delete(data:any) { setNotificationType(data); }
		notificationsSocket.on("blocked_delete", s_blocked_delete);

		return (() => {
			notificationsSocket.off("conv_create", s_conv_create);
			notificationsSocket.off("conv_delete", s_conv_delete);
			notificationsSocket.off("friend_request_accepted", s_friend_request_accepted);
			notificationsSocket.off("friend_new", s_friend_new);
			notificationsSocket.off("friend_delete", s_friend_delete);
			notificationsSocket.off("blocked_new", s_blocked_new);
			notificationsSocket.off("blocked_delete", s_blocked_delete);
		})

	}, [notificationType]);

	/*======================================================================
	===================Fetch<GET>Users Blocked==================================
	======================================================================== */

	useEffect(() => {
		const requestAllBlockedUsers = async () => {
			try {
				const enable2FAEndpoint = `${config.backend_url}/api/user/blocked`;
				const response = await fetch(enable2FAEndpoint, {
					method: "GET",
					credentials: "include",
				});
				if (response.ok) {
					const result = await response.json();
					setUsersBlocked(result);
				} else {
					console.error("Could not get profile:", response.status);
				}
			} catch (error) {
				console.error("Error fetching profile Token:", error);
			}
		};
		requestAllBlockedUsers();

		function s_user_create(data: { user: User }) {
			setAllUsers((prev) => {
				return prev === null ? [data.user] : [data.user, ...prev];
			});
		}
		notificationsSocket.on("user_create", s_user_create);

		return () => {
			notificationsSocket.off("user_create", s_user_create);
		};
	}, [notificationType]);

	/*======================================================================
	===================Fetch<GET>All Users==================================
	======================================================================== */

	useEffect(() => {
		const requestAllUsers = async () => {
			try {
				const enable2FAEndpoint = `${config.backend_url}/api/user`;
				const response = await fetch(enable2FAEndpoint, {
					method: "GET",
					credentials: "include",
				});
				if (response.ok) {
					const result = await response.json();
					setAllUsers(result);
				} else {
					console.error("Could not get profile:", response.status);
				}
			} catch (error) {
				console.error("Error fetching profile Token:", error);
			}
		};
		requestAllUsers();

	}, [notificationType]);

	/*======================================================================
	===================Fetch<GET> All Friends From User=====================
	======================================================================== */
	useEffect(() => {
		const requestProfile = async () => {
			try {
				const enable2FAEndpoint = `${config.backend_url}/api/user/friends`;
				const response = await fetch(enable2FAEndpoint, {
					method: "GET",
					credentials: "include",
				});
				if (response.ok) {
					const result = await response.json();
					setFriends(result);
				} else {
					console.error("Could not get Friends fetch:", response.status);
				}
			} catch (error) {
				console.error("Error fetching Friends:", error);
			}
		};
		requestProfile();

		function s_friend_new(user: User) {
			setFriends((prev) => {
				return prev === null ? [user] : [user, ...prev];
			});
		}
		notificationsSocket.on("friend_new", s_friend_new);
	
		return () => {
			notificationsSocket.off("friend_new", s_friend_new);
		};
	}, [notificationType, selectedGroupOption]);

	/*======================================================================
	===================Fetch<Get> Messages From His Own Id====================
	======================================================================== */
	useEffect(() => {
		const requestMessages = async () => {
			if (!me) {
				return;
			}
			console.log("selected group: ", selectedGroup?.id);
			try {
				const fetchMessage = `${config.backend_url}/api/conversation/${selectedGroup?.id}`;
				const response = await fetch(fetchMessage, {
					method: "GET",
					credentials: "include",
				});
				if (response.ok) {
					const result = await response.json();
					console.log("Messages:", result);
					setChannelMessages(result.messages);
				} else {
					// setChannelMessages(undefined);
					console.error("Could not get channel messages:", response.status);
				}
			} catch (error) {
				console.error("Error fetching profile me messages:", error);
			}
		};
		requestMessages();
	}, [selectedGroup, notificationType]);

	useEffect(() => {
		setIsInChannel(false);
		selectedGroup?.users.map((channelUser: any) => {
			console.log(me?.id, channelUser.user.id);
			if (me?.id === channelUser.user.id) {
				console.log("I am in the channel");
				setIsInChannel(true);
			}
		});
	}, [selectedGroup, notificationType]);

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
				{selectedGroupOption === ChannelOptions.CREATE_CHANNEL && (
					<ChannelForm {...groupsProps} />
				)}
				{selectedGroupOption === ChannelOptions.CHANNEL &&
					toogledButton === "Channel" && <ChannelProfile {...groupsProps} />}
				<Groups {...groupsProps} />
				<ChatMain {...groupsProps} />
			</div>
		</div>
	);
};
export default MiniChat;
