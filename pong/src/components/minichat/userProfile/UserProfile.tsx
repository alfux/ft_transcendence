import { useEffect, useState } from "react";
import { config } from "../../../config";
import { ChannelOptions, ChatProps } from "../MiniChat";
import { FetchError, backend_fetch } from "../../backend_fetch";
import Profile from "../profileDisplay/Profile";

const UserProfile: React.FC<ChatProps> = (props) => {
	const [channelRights, setChannelRights] = useState<string | null>(null);
	const [profileStatus, setProfileStatus] = useState<boolean>(false);

	const [errorInvite, setErrorInvite] = useState<boolean>(false);
	const [errorBlock, setErrorBlock] = useState<boolean>(false);
	const [errorUnblock, setErrorUnblock] = useState<boolean>(false);
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
	===================Unblock User==========
	======================================================================== */
	async function unblockUser() {
		const url = `${config.backend_url}/api/user/blocked/` + props.selectedUser?.id;
		try {
			const response = await fetch(url, {
				method: "DELETE",
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ id: props.selectedUser?.id }),
			});

			if (response.ok) {
				props.setUsersBlocked(null)
				setErrorUnblock(false)
				console.log("Unblocked", props.selectedUser?.username);
			} else {
				console.error(
					"Error Blocking User. Server responded with status:",
					response.status
				);
				setErrorUnblock(true)
			}
		} catch (error) {
			console.error("Error Blocking:", error);
		}
	}


	/*======================================================================
	===================Fetch<Post> Request To Send Friend Invite To Another User==========
	======================================================================== */
	async function sendFriendInvite() {
		const url = `${config.backend_url}/api/user/friend_request`;
		try {
			const response = await fetch(url, {
				method: "POST",
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ user_id: props.selectedUser?.id }),
			});

			if (response.ok) {
				props.setNotificationType("gsagsagsa")
				setErrorInvite(false)
				console.log("Blocked", props.selectedUser?.username);
			} else {
				setErrorInvite(true)
				setTimeout(() => { setErrorInvite(false) }, 500)
			}
		} catch (error) {
			setErrorInvite(true)
			console.error("Error Blocking:", error);
		}
	}
	/*======================================================================
	===================Fetch<Post> Request To Send Play Invite To Another User==========
	======================================================================== */
	async function sendPlayInvite() {
		backend_fetch(
			`${config.backend_url}/api/user/play_request`,
			{ method: "POST" },
			{
				user_id: props.selectedUser?.id,
			}
		);
	}

	/*======================================================================
	===================Fetch<Delete> Request To Remove Friend==========
	======================================================================== */
	async function sendFriendRemove() {
		backend_fetch(
			`${config.backend_url}/api/user/friends/${props.selectedUser!.id}`,
			{ method: "DELETE" }
		);
		props.setNotificationType("friend_removed")
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
		const url = `${config.backend_url}/api/user/blocked`;
		try {
			const response = await fetch(url, {
				method: "POST",
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ user_id: props.selectedUser?.id }),
			});

			if (response.ok) {
				setErrorBlock(false)
				console.log("Blocked", props.selectedUser?.username);
			} else {
				setErrorBlock(true)
				console.log(response.status)
			}
		} catch (error) {
			setErrorBlock(true)
			console.error("Error Blocking:", error);
		}
	};


	async function promoteUser() {
		props.selectedGroup?.users!.map(async (user: any) => {
			if (user.user.db_id === props.selectedUser?.db_id) {
				const url = `${config.backend_url}/api/conversation/promote`;
				try {
					const response = await fetch(url, {
						method: "POST",
						credentials: "include",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({ conversation_user_id: user.id }),
					});

					if (response.ok) {
						console.log("Promoted", user.user.username);
					} else {
						alert("Could not Promote");
						console.error(
							"Error Promoting User. Server responded with status:",
							response.status
						);
					}
				} catch (error) {
					console.error("Error Promoting:", error);
				}
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

	function invitePlay() {
		backend_fetch(`${config.backend_url}/api/user/play_request`, {
			method: 'POST'
		}, {
			user_id: props.selectedUser?.id
		})
		.catch((e) => { if (e instanceof FetchError) {} else throw e })
	}

	function toogleProfile() {
		setProfileStatus(profileStatus ? false : true)
	}

	return (
		<>{profileStatus && setTimeout(() => { setProfileStatus(false) }, 10000)}
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
					</div>
				)}
				{props.selectedUser && !props.selectedGroup && <button className={"button-ok"} onClick={toogleProfile}>Profile</button>}
				{props.selectedGroupOption == ChannelOptions.FRIENDS &&
					props.selectedUser && isFriend() && ( // && !props.selectedGroup
						<button className="button-ok" onClick={invitePlay}>Invite Game</button>
					)}
				{props.selectedGroupOption == ChannelOptions.FRIENDS &&
					props.selectedUser && isFriend() && ( // && !props.selectedGroup
						<button className="button-ok" onClick={sendFriendRemove}>Remove Friend</button>
					)}
				{props.selectedGroupOption == ChannelOptions.FRIENDS &&
					props.selectedUser && isFriend() && ( // && !props.selectedGroup
						<button className={errorBlock ? "errorBlock" : "button-ok"} onClick={blockFriend}>Block Friend</button>
					)}

				{props.selectedGroupOption !== ChannelOptions.CHANNEL &&
					props.selectedUser &&
					!isFriend() && (
						(!isUserBlocked(props.selectedUser)) ? <button className={errorInvite ? "errorInvite" : "button-ok"} onClick={sendFriendInvite}>Invite Friend</button> : <button className={errorUnblock ? 'errorUnblock' : "button-ok"} onClick={unblockUser}>Unblock</button>
					)}

				{channelRights == "Owner" &&
					props.selectedUser?.db_id !== props.me?.db_id &&
					props.selectedGroupOption == ChannelOptions.CHANNEL && (
						<button className={"button-ok"} onClick={promoteUser}>Promote</button>
					)}
				{channelRights &&
					props.selectedUser?.db_id !== props.me?.db_id &&
					props.selectedGroupOption == ChannelOptions.CHANNEL && (
						<button className={"button-ok"} >Mute</button>
					)}
				{channelRights &&
					props.selectedUser?.db_id !== props.me?.db_id &&
					props.selectedGroupOption == ChannelOptions.CHANNEL && (
						<button className={"button-ok"} >Kick</button>
					)}
			</div>

		</>
	)
};
export default UserProfile;
