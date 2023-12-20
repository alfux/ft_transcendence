import { useEffect, useState } from "react";
import { config } from "../../../config";
import { ChannelOptions, ChatProps } from "../MiniChat";
import { FetchError, backend_fetch } from "../../backend_fetch";
import Profile from "../profileDisplay/Profile";

const UserProfile: React.FC<ChatProps> = (props) => {
	const [channelRights, setChannelRights] = useState<string | null>(null);
	const [profileStatus, setProfileStatus] = useState<boolean>(false);
	/*======================================================================
	===================Fetch<Post> Request To Send Friend Invite To Another User==========
	======================================================================== */
	async function sendFriendInvite() {
		backend_fetch(`${config.backend_url}/api/user/friend_request`, {
			method: "POST"
		}, {
			user_id: props.selectedUser?.id,
		})
			.catch((e) => { if (e instanceof FetchError) { } else throw e })
	}
	/*======================================================================
	===================Fetch<Post> Request To Send Play Invite To Another User==========
	======================================================================== */
	async function sendPlayInvite() {
		backend_fetch(`${config.backend_url}/api/user/play_request`, {
			method: "POST"
		}, {
			user_id: props.selectedUser?.id,
		})
			.catch((e) => { if (e instanceof FetchError) { } else throw e })
	}

	/*======================================================================
	===================Fetch<Delete> Request To Remove Friend==========
	======================================================================== */
	async function sendFriendRemove() {
		backend_fetch(`${config.backend_url}/api/user/friends/${props.selectedUser!.id}`, {
			method: "DELETE"
		})
			.catch((e) => { if (e instanceof FetchError) { } else throw e })

		//Non: la backend enverra l'event quand ca sera bon
		//props.setNotificationType("friend_removed")
	}

	/*======================================================================
	===================Check if is owner or admin and set const string==========
	======================================================================== */
	useEffect(() => {
		if (props.me?.db_id === props.selectedGroup?.owner?.db_id) {
			setChannelRights("Owner");
		} else {
			props.selectedGroup?.users!.map((users: any) => {
				if (users.user.db_id == props.me?.db_id) {
					const myRights = users;
					if (myRights.isAdmin) {
						setChannelRights("Admin");
					}
				}
			});
		}
	}, [props.selectedGroup]);

	async function blockFriend() {
		backend_fetch(`${config.backend_url}/api/user/blocked`, {
			method: 'POST'
		}, {
			user_id: props.selectedUser!.id
		})
			.catch((e) => { if (e instanceof FetchError) { } else throw e })
	};


	async function promoteUser() {
		props.selectedGroup?.users!.map(async (user: any) => {
			if (user.user.db_id === props.selectedUser?.db_id) {
				backend_fetch(`${config.backend_url}/api/conversation/promote`, {
					method: 'POST'
				}, {
					conversation_user_id: user.id
				})
					.catch((e) => { if (e instanceof FetchError) { } else throw e })
			}
		});
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

	function toogleProfile() {
		setProfileStatus(profileStatus ? false : true)
		console.log(profileStatus)
	}


	return (
		<>
			{profileStatus && setTimeout(() => { setProfileStatus(false) }, 10000)}
			{profileStatus && <Profile {...props.selectedUser} />}
			<div className="user-profile">
				{props.selectedUser && !props.selectedGroup && (
					<img className="user-image" src={props.selectedUser.image} />
				)}
				{props.selectedUser && <p>{props.selectedUser.username}</p>}
				{props.selectedUser && (
					<div>
						<div className="status-div">
							<p>Status</p>
							<div className={props.selectedUser.isAuthenticated === 0 ? "status-online" : "status-offline"}></div>
						</div>

						{
							props.selectedGroupOption === ChannelOptions.CHANNEL && props.selectedGroup ?
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
								: undefined
						}
						{/* <div className="status-div">
          <p>Status</p>
          <div
            className={
              props.selectedUser.isAuthenticated === 0
                ? "status-online"
                : "status-offline"
            }
          ></div> */}
					</div>
				)}

				{props.selectedUser && !props.selectedGroup && <button onClick={toogleProfile}>Profile</button>}
				{props.selectedGroupOption == ChannelOptions.FRIENDS &&
					props.selectedUser && ( // && !props.selectedGroup
						<button>Invite Game</button>
					)}
				{props.selectedGroupOption == ChannelOptions.FRIENDS &&
					props.selectedUser && ( // && !props.selectedGroup
						<button onClick={sendFriendRemove}>Remove Friend</button>
					)}
				{props.selectedGroupOption == ChannelOptions.FRIENDS &&
					props.selectedUser && ( // && !props.selectedGroup
						<button onClick={blockFriend}>Block Friend</button>
					)}

				{props.selectedGroupOption !== ChannelOptions.CHANNEL &&
					props.selectedUser &&
					!isFriend() && (
						<button onClick={sendFriendInvite}>Invite Friend</button>
					)}

				{channelRights == "Owner" &&
					props.selectedUser?.db_id !== props.me?.db_id &&
					props.selectedGroupOption == ChannelOptions.CHANNEL && (
						<button onClick={promoteUser}>Promote</button>
					)}
				{channelRights &&
					props.selectedUser?.db_id !== props.me?.db_id &&
					props.selectedGroupOption == ChannelOptions.CHANNEL && (
						<button>Mute</button>
					)}
				{channelRights &&
					props.selectedUser?.db_id !== props.me?.db_id &&
					props.selectedGroupOption == ChannelOptions.CHANNEL && (
						<button>Kick</button>
					)}
			</div>

		</>
	);
};
export default UserProfile;
