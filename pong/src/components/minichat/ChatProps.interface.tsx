import { JwtPayload } from "../../THREE/Utils";
import { PrivateConversation, Conversation, User, Message } from "../../THREE/Utils/backend_types";

export enum ChannelOptions {
	CREATE_CHANNEL = "create channel",
	ONLINE_USERS = "online users",
	FRIENDS = "friends",
	CHANNEL = "channel",
}

type ReactStateSetter<T> = React.Dispatch<React.SetStateAction<T>>

export interface ChatProps {
	payload?: JwtPayload;
	
	me?: User;
	friends?: User[];
	
	friendConversation?: PrivateConversation;
	
	channels?: Conversation[];
	allUsers?: User[];
	usersBlocked?: User[];
	
	selectedUser?: User;
	selectedGroup?: Conversation;
	selectedGroupOption?: ChannelOptions;
	
	onUpdate: boolean;
	triggerUpdate: () => void;
	
	setMe: ReactStateSetter<User | undefined>;
	setFriends: ReactStateSetter<User[] | undefined>;
	
	setFriendConversation:(friendConversation?: PrivateConversation) => void;
	
	setChannels: ReactStateSetter<Conversation[] | undefined>;
	setAllUsers: ReactStateSetter<User[] | undefined>;
	setUsersBlocked: (usersBlocked: User[] | undefined) => void;
	
	setSelectedUser: (user?: User) => void;
	setSelectedGroup: ReactStateSetter<Conversation | undefined>;
	setSelectedGroupOption: ReactStateSetter<ChannelOptions | undefined>;
}