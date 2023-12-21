import { useState } from "react";
import { config } from "../../../config";
import { ChatProps } from "../MiniChat";
import { Channel } from "../interfaces/interfaces";
import { AccessLevel } from "../../../THREE/Utils/backend_types";

const ChannelForm: React.FC<ChatProps> = (props) => {
	const [channelName, setChannelName] = useState<any>("");
	const [password, setPassword] = useState<any>("");
	const [isPrivate, setIsPrivate] = useState<any>(false);

	const createChannel = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const channelForm: Channel = {
			title: channelName,
			password: password,
			access_level: isPrivate ? AccessLevel.PRIVATE : AccessLevel.PUBLIC,
		};
		console.log(channelForm)
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
				props.setNewChannel(channelName);
				console.log("FETCHED POST");
			} else {
				console.log("NOT FETCH");
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
						value={isPrivate}
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



