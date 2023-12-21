import { useState } from "react";
import { config } from "../../../config";
import { ChatProps } from "../MiniChat";
import { AccessLevel } from "../../../THREE/Utils/backend_types";
import { FetchError, backend_fetch } from "../../backend_fetch";

const ChannelProfile: React.FC<ChatProps> = (props) => {
	const [password, setPassword] = useState("");
	const [updatePassword, setUpdatePassword] = useState("");

	const joinChannel = async () => {
		backend_fetch(`${config.backend_url}/api/conversation/join`, {
			method: 'POST'
		}, {
			id: props.selectedGroup!.id,
			password: password
		})
			.catch((e) => { if (e instanceof FetchError) { } else throw e })

		setPassword("")
	};

	// Need to check if i am the owner if i am the owner i need to pass the rights to second person or another admin
	const leaveChannel = async () => {
		backend_fetch(`${config.backend_url}/api/conversation/leave`, {
			method: 'POST'
		}, {
			id: props.selectedGroup!.id
		})
			.catch((e) => { if (e instanceof FetchError) { } else throw e })
	};

	const addPassword = (id?: number) => {
		if (id) {
			backend_fetch(`${config.backend_url}/api/conversation/${id}`, {
				method: 'PATCH'
			}, {
				access_level: AccessLevel.PROTECTED,
				password: updatePassword
			})
				.catch((e) => { if (e instanceof FetchError) { } else throw e })
		}
	}

	const changePassword = (id?: number) => {
		if (id) {
			backend_fetch(`${config.backend_url}/api/conversation/${id}`, {
				method: 'PATCH'
			}, {
				access_level: AccessLevel.PROTECTED,
				password: updatePassword
			})
				.catch((e) => { if (e instanceof FetchError) { } else throw e })
		}
	}

	const removePassword = (id?: number) => {
		if (id) {
			backend_fetch(`${config.backend_url}/api/conversation/${id}`, {
				method: 'PATCH'
			}, {
				access_level: AccessLevel.PUBLIC,
				password: password
			})
				.catch((e) => { if (e instanceof FetchError) { } else throw e })
		}
	}

	const deleteChannel = (id?: number) => {
		if (id) {
			backend_fetch(`${config.backend_url}/api/conversation/${id}`, {
				method: 'DELETE'
			})
				.then(() => props.setSelectedChannel(undefined))
				.catch((e) => { if (e instanceof FetchError) { } else throw e })
		}
	}


	const updatePasswordForm = (f: (id?: number) => void, text: string) => {
		return (
			<form>
				<input
					placeholder="Password"
					type="password"
					value={updatePassword}
					onChange={(e) => setUpdatePassword(e.target.value)}
				/>
				<button type="button" onClick={() => f(props.selectedGroup?.id)}>{text}</button>
			</form>
		)
	}

	return (
		<div className="channel-profile">
			{!props.selectedUser} &&{" "}
			<div>
				<p>Channel Name: {props.selectedGroup?.title}</p>
				<p>Owner : {props.selectedGroup?.owner!.username}</p>
				<img src={props.selectedGroup?.owner!.image} />
				<p>Date Creation :</p>
				<p> {props.selectedGroup?.users![0]?.becameAdminAt}</p>

				{!props.isInChannel ? (
					<form>
						<input
							placeholder="Password"
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
						></input>
						<button type="button" onClick={joinChannel}>Join Channel</button>
					</form>
				) : (
					props.selectedGroup?.owner.id === props.me?.id ? (
						<>
							<button onClick={leaveChannel}>Leave Channel</button>
							{props.selectedGroup?.access_level === AccessLevel.PROTECTED ? (
								<>
									{updatePasswordForm(changePassword, 'Change password')}
									<button onClick={() => removePassword(props.selectedGroup?.id)}>Remove password</button>
								</>
							) : (
								<>
									{updatePasswordForm(addPassword, 'Add password')}
								</>
							)
							}
							<button onClick={() => deleteChannel(props.selectedGroup?.id)}>Delete channel</button>
						</>
					) : (
						<button onClick={leaveChannel}>Leave Channel</button>
					)


				)}
			</div>
		</div>
	);
};
export default ChannelProfile;
