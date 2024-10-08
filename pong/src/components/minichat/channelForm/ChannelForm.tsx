import { useState } from "react";
import { config } from "../../../config";
import { ChatProps } from "../ChatProps.interface";
import { Channel } from "../interfaces/interfaces";
import { AccessLevel } from "../../../THREE/Utils/backend_types";
import { FetchError, backend_fetch } from "../../backend_fetch";

const ChannelForm: React.FC<ChatProps> = (props) => {
	const [channelName, setChannelName] = useState<string>("");
	const [password, setPassword] = useState<string>("");
	const [isPrivate, setIsPrivate] = useState<boolean>(false);

	const createChannel = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const channelForm: Channel = {
			title: channelName,
			password: password,
			access_level: isPrivate ? AccessLevel.PRIVATE : AccessLevel.PUBLIC,
		};

		if (channelForm.password !== '')
			channelForm.access_level = AccessLevel.PROTECTED

/*
		await backend_fetch(`${config.backend_url}/api/conversation`, {
			method: 'POST'
		}, channelForm.password === "" ? { title: channelForm.title, access_level: channelForm.access_level } : channelForm)
			.then((conv) => props.setNewChannel(conv))
			.catch((e) => { if (e instanceof FetchError) { } else throw e })
	};
*/
		try {
			const response = await fetch(`${config.backend_url}/api/conversation`, {
				method: "POST",
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(channelForm.password === "" ? { title: channelForm.title, access_level: channelForm.access_level } : channelForm),
			});
			if (response.ok) {
				//props.setNewChannel(channelName);
			} else {
			}
		} catch (error) {
			console.error("Error Fetching:", error);
		}
	};

	return (
		<div className="channel-creator">
			<form onSubmit={createChannel}>
				<div>
					<p>Channel Name</p>
					<input
						type="text"
						value={channelName}
						onChange={(e) => setChannelName(e.target.value)}
					></input>
				</div>
				<div>
					<p>Password</p>
					<input
						type="text"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
					></input>
				</div>
				<div>
					<label>Privite</label>
					<input
						value={isPrivate.toString()}
						onChange={(e) => setIsPrivate(isPrivate ? false : true)}
						type="checkbox"
					></input>
				</div>
				<div>
					<button type="submit">Create Channel</button>
				</div>
			</form>
		</div>
	);
}
export default ChannelForm;



