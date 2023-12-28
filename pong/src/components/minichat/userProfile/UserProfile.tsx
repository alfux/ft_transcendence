import { useEffect, useState } from "react";
import { config } from "../../../config";
import { ChannelOptions, ChatProps } from "../ChatProps.interface";
import { FetchError, backend_fetch } from "../../backend_fetch";
import Profile from "../profileDisplay/Profile";
import { LoggedStatus } from "../../../THREE/Utils";
import { FailableButton } from "../../failable_button/failable_button";
import { notificationsSocket } from "../../../sockets";
import { Conversation, User } from "../../../THREE/Utils/backend_types";

const UserProfile: React.FC<ChatProps> = (props) => {
	const [channelRights, setChannelRights] = useState<string | null>(null);
	const [profileStatus, setProfileStatus] = useState<boolean>(false);

	/*======================================================================
	===================Check if User friend is blocked and return boolean==========
	======================================================================== */
	function isUserBlocked(friend: any) {
		let result = false;
		props.usersBlocked?.map((user: any) => {
			if (user.db_id == friend.db_id) {
				result = true
			}
		})
		return result
	}
	/*======================================================================
	===================Block/Unblock User==========
	======================================================================== */
	async function blockUser() {
		return backend_fetch(`${config.backend_url}/api/user/blocked`, {
			method: 'POST'
		}, {
			user_id: props.selectedUser?.id
		})
	};

	async function unblockUser() {
		return backend_fetch(`${config.backend_url}/api/user/blocked/${props.selectedUser?.id}`, {
			method: 'DELETE'
		})
			.then(() => props.setUsersBlocked(undefined))
	}
	/*======================================================================
	===================Promotes/Demotes User==========
	======================================================================== */
	async function promoteUser() {

		const conv_user = props.selectedGroup?.users.find((u) => u.user.id === props.selectedUser?.id)
		if (conv_user === undefined)
			return

		return backend_fetch(`${config.backend_url}/api/conversation/promote`, {
			method: 'POST'
		}, {
			conversation_user_id: conv_user.id
		})
			.catch((e) => { if (e instanceof FetchError) { } else throw e })
	}

	async function demoteUser() {

		const conv_user = props.selectedGroup?.users.find((u) => u.user.id === props.selectedUser?.id)
		if (conv_user === undefined)
			return

		return backend_fetch(`${config.backend_url}/api/conversation/demote`, {
			method: 'POST'
		}, {
			conversation_user_id: conv_user.id
		})
			.catch((e) => { if (e instanceof FetchError) { } else throw e })
	}
	/*======================================================================
	===================Fetch<Post> Request To Send Friend Invite To Another User==========
	======================================================================== */
	async function inviteFriend() {
		return backend_fetch(`${config.backend_url}/api/user/friend_request`, {
			method: 'POST'
		}, {
			user_id: props.selectedUser?.id
		})
			.then(() => props.triggerUpdate())
	}

	/*======================================================================
	===================Fetch<Delete> Request To Remove Friend==========
	======================================================================== */
	async function removeFriend() {
		return backend_fetch(`${config.backend_url}/api/user/friends/${props.selectedUser!.id}`, {
			method: "DELETE"
		})
	}

	/*======================================================================
	===================Check if is owner or admin and set const string==========
	======================================================================== */
	useEffect(() => {
		if (props.me?.db_id === props.selectedGroup?.owner?.db_id) {
			setChannelRights("Owner");
		} else {
			const me_conv = props.selectedGroup?.users.find((u) => u.id === props.me?.id)
			if (me_conv !== undefined && me_conv.isAdmin) {
				setChannelRights("Admin")
			} else {
				setChannelRights(null)
			}
		}
	}, [props.selectedGroup]);

	async function muteUser() {

		const conv_user = props.selectedGroup?.users.find((u) => u.user.id === props.selectedUser?.id)
		if (conv_user === undefined)
			return

		return backend_fetch(`${config.backend_url}/api/conversation/mute`, {
			method: 'POST'
		}, {
			conversation_user_id: conv_user.id,
			duration: '60s'
		})
			.catch((e) => { if (e instanceof FetchError) { } else throw e })
	}

	async function kickUser() {

		const conv_user = props.selectedGroup?.users.find((u) => u.user.id === props.selectedUser?.id)
		if (conv_user === undefined)
			return

		return backend_fetch(`${config.backend_url}/api/conversation/kick`, {
			method: 'POST'
		}, {
			conversation_user_id: conv_user.id,
		})
			.catch((e) => { if (e instanceof FetchError) { } else throw e })
	}

	function isFriend() {
		let friend = false
		props.friends?.map((user: any) => {
			if (user.id === props.selectedUser?.id) {
				friend = true;
			}
		});
		return friend
	}

	function invitePlay() {
		return backend_fetch(`${config.backend_url}/api/user/play_request`, {
			method: 'POST'
		}, {
			user_id: props.selectedUser?.id
		})
	}

	function toggleProfile() {
		setProfileStatus(profileStatus ? false : true)
	}


	function profileDisplay() {
		if (props.selectedUser !== undefined) {
			return (
				<>
					<img className="user-image" src={props.selectedUser.image} />
					<p>{props.selectedUser.username}</p>
				</>
			)
		} else {
			return undefined
		}
	}

	function profileDisplayChannelStatus() {
		if (props.selectedGroupOption === ChannelOptions.CHANNEL && props.selectedGroup) {
			return (
				<div>
					<div className="channel-rights-dev">
						<p>Admin</p>
						<div className={props.selectedGroup.users!.find((u) => u.user!.id === props.selectedUser!.id)?.isAdmin || props.selectedGroup.owner!.id === props.selectedUser!.id ? "status-online" : "status-offline"}></div>
					</div>
					<div className="channel-rights-dev">
						<p>Owner</p>
						<div className={props.selectedGroup.owner!.id === props.selectedUser!.id ? "status-online" : "status-offline"}></div>
					</div>
				</div>
			)
		} else {
			return undefined
		}
	}

	function profileDisplayStatus() {

		let status = "status-offline"
		if (props.selectedUser?.isAuthenticated === LoggedStatus.Logged)
			status = "status-online"
		else if (props.selectedUser?.isAuthenticated === LoggedStatus.InGame)
			status = "status-ingame"

		if (props.selectedUser !== undefined) {
			return (
				<div>
					<div className="status-div">
						<p>Status</p>
						<div className={status}></div>
					</div>

					{profileDisplayChannelStatus()}
				</div>
			)
		} else {
			return undefined
		}
	}

	return (
		<>
			{profileStatus && setTimeout(() => { setProfileStatus(false) }, 10000)}

			{
				profileStatus ?
					<Profile {...props.selectedUser} />
					: undefined
			}

			<div className="user-profile">

				{profileDisplay()}
				{profileDisplayStatus()}

				{
					props.selectedUser && !props.selectedGroup ?
						<button className={"button-ok"} onClick={toggleProfile}>Profile</button>
						: undefined
				}

				{
					props.selectedGroupOption === ChannelOptions.FRIENDS && props.selectedUser && isFriend() ? (
						<>
							<FailableButton onClick={invitePlay}>Invite Game</FailableButton>
							<FailableButton onClick={removeFriend}>Remove Friend</FailableButton>
							<FailableButton onClick={blockUser}>Block Friend</FailableButton>
						</>
					)
						: undefined
				}

				{
					props.selectedGroupOption !== ChannelOptions.CHANNEL && props.selectedUser && !isFriend() ? (
						(!isUserBlocked(props.selectedUser)) ?
							<FailableButton onClick={inviteFriend}>Invite Friend</FailableButton>
							: <FailableButton onClick={unblockUser}>Unblock</FailableButton>
					) : undefined
				}

				{
					channelRights === "Owner" &&
						props.selectedUser?.id !== props.me?.id &&
						props.selectedGroupOption === ChannelOptions.CHANNEL ? (
						props.selectedGroup?.users!.find((u) => u.user!.id === props.selectedUser!.id)?.isAdmin ?
							<FailableButton onClick={demoteUser}>Demote</FailableButton>
							:
							<FailableButton onClick={promoteUser}>Promote</FailableButton>
					)
						: undefined
				}
				{channelRights &&
					props.selectedUser?.id !== props.me?.id &&
					props.selectedGroupOption === ChannelOptions.CHANNEL &&
					<FailableButton onClick={muteUser}>Mute</FailableButton>
				}
				{channelRights &&
					props.selectedUser?.id !== props.me?.id &&
					props.selectedGroupOption === ChannelOptions.CHANNEL &&
					<FailableButton onClick={kickUser}>Kick</FailableButton>
				}
			</div>

		</>
	)
};
export default UserProfile;
