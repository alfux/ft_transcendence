import { useState } from "react";
import { config } from "../../../config";
import { ChatProps } from "../MiniChat";

const ChannelProfile: React.FC<ChatProps> = (props) => {
	const [password, setPassword] = useState("");
	const joinChannel = async () => {
		console.log("group", props.selectedGroup);
		try {
			const response = await fetch(
				`${config.backend_url}/api/conversation/join`,
				{
					method: "POST",
					credentials: "include",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ id: props.selectedGroup?.id, password: password }),
				}
			);
			if (response.ok) {
				console.log("Joined Succefully");
			} else {
				console.log("didnt Succede Join Channel");
			}
		} catch (error) {
			console.error("Error Fetching:", error);
		}
		setPassword("")
	};
	// Need to check if i am the owner if i am the owner i need to pass the rights to second person or another admin
	const leaveChannel = async () => {
		try {
			console.log("lla", props.selectedGroup);
			const response = await fetch(
				`${config.backend_url}/api/conversation/leave`,
				{
					method: "POST",
					credentials: "include",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ id: props.selectedGroup?.id }),
				}
			);
			if (response.ok) {
				console.log("Left Succesfully");
			} else {
				console.log("didnt Succede Leave Channel");
			}
		} catch (error) {
			console.error("Error Fetching:", error);
		}
	};

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
						&&
						<button type="button" onClick={joinChannel}>Join Channel</button>
					</form>
				) : (
					<button onClick={leaveChannel}>Leave Channel</button>
				)}
			</div>
		</div>
	);
};
export default ChannelProfile;
