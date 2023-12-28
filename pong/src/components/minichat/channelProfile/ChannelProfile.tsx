import { useState } from "react";
import { config } from "../../../config";
import { ChatProps } from "../ChatProps.interface";
import { AccessLevel } from "../../../THREE/Utils/backend_types";
import { FetchError, backend_fetch } from "../../backend_fetch";
import { FailableButton } from "../../failable_button/failable_button";

const ChannelProfile: React.FC<ChatProps> = (props) => {
	const [password, setPassword] = useState("");
	const [updatePassword, setUpdatePassword] = useState("");

	const joinChannel = () => {
		setPassword("")
		return backend_fetch(`${config.backend_url}/api/conversation/join`, {
			method: 'POST'
		}, {
			id: props.selectedGroup!.id,
			password: password
		})
	};

	const leaveChannel = () => {
		return backend_fetch(`${config.backend_url}/api/conversation/leave`, {
			method: 'POST'
		}, {
			id: props.selectedGroup!.id
		})
	};

	const addPassword = (id?: number) => {
		return backend_fetch(`${config.backend_url}/api/conversation/${id}`, {
			method: 'PATCH'
		}, {
			access_level: AccessLevel.PROTECTED,
			password: updatePassword
		})
	}

	const changePassword = (id?: number) => {
		return backend_fetch(`${config.backend_url}/api/conversation/${id}`, {
			method: 'PATCH'
		}, {
			access_level: AccessLevel.PROTECTED,
			password: updatePassword
		})
	}

	const removePassword = (id?: number) => {
		return backend_fetch(`${config.backend_url}/api/conversation/${id}`, {
			method: 'PATCH'
		}, {
			access_level: AccessLevel.PUBLIC,
			password: password
		})
	}

	const deleteChannel = (id?: number) => {
		return backend_fetch(`${config.backend_url}/api/conversation/${id}`, {
			method: 'DELETE'
		})
			.then(() => { if (props.selectedGroup?.id === id) props.setSelectedGroup(undefined) })
	}


	const updatePasswordForm = (f: (id?: number) => Promise<any>, text: string) => {
		return (
			<form>
				<input
					placeholder="Password"
					type="password"
					value={updatePassword}
					onChange={(e) => setUpdatePassword(e.target.value)}
				/>
				<FailableButton onClick={() => f(props.selectedGroup?.id)}>{text}</FailableButton>
			</form>
		)
	}

	if (props.selectedGroup) {
		return (
			<div className="channel-profile">
				<p>Channel Name: {props.selectedGroup?.title}</p>
				<p>Owner : {props.selectedGroup?.owner!.username}</p>
				<img src={props.selectedGroup?.owner!.image} />
				<p>Date Creation :</p>
				<p> {props.selectedGroup?.users![0]?.becameAdminAt}</p>

				{props.selectedGroup?.users.find((u) => u.user.id === props.me?.id) === undefined ? (
					<>
						<form>
							{
								props.selectedGroup?.access_level === AccessLevel.PROTECTED ? (
									<input
										placeholder="Password"
										type="password"
										value={password}
										onChange={(e) => setPassword(e.target.value)}
									/>
								) : undefined
							}
						</form>
						<FailableButton onClick={joinChannel}>Join Channel</FailableButton>
					</>
				) : (
					props.selectedGroup?.owner.id === props.me?.id && props.selectedGroup.access_level !== AccessLevel.PRIVATE ? (
						<>
							<FailableButton onClick={leaveChannel}>Leave Channel</FailableButton>
							{props.selectedGroup?.access_level === AccessLevel.PROTECTED ? (
								<>
									{updatePasswordForm(changePassword, 'Change password')}
									<FailableButton onClick={() => removePassword(props.selectedGroup?.id)}>Remove password</FailableButton>
								</>
							) : (
								<>
									{updatePasswordForm(addPassword, 'Add password')}
								</>
							)
							}
							<FailableButton onClick={() => deleteChannel(props.selectedGroup?.id)}>Delete Channel</FailableButton>
						</>
					) : (
						<FailableButton onClick={leaveChannel}>Leave Channel</FailableButton>
					)


				)}
			</div>
		);
	} else {
		return <></>
	}
};
export default ChannelProfile;
