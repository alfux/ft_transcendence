import Cookies from "js-cookie";
import React, { useEffect, useState } from "react";
import userEvent from "@testing-library/user-event";
import AchievementsButton from "./buttons/achievements/AchievementsButton";
import MatchHistory from "./buttons/matchhistory/MatchHistoryButton";
import { User, Match } from "../../../THREE/Utils/backend_types";
import usePayload from "../../../react_hooks/use_auth";
import { config } from "../../../config";
const accessToken = Cookies.get("accessToken");

const Profile: React.FC<any> = (props) => {
	const [data, setData] = useState<User | null>(null);
	const [matches, setMatches] = useState<Match[] | null>(null);

	const [isEditingUsername, setIsEditingUsername] = useState(false);
	const [editUsernameValue, setEditUsernameValue] = useState("");
	useEffect(() => {
		setData(props);
		const requestMatchHist = async () => {
			try {
				//fetch Matches
				const response = await fetch(`${config.backend_url}/api/user/matches`, {
					method: "GET",
					credentials: "include",
				});

				if (response.ok) {
					const result = await response.json();
					setMatches(result);
				} else {
					console.error("Could not get matches:", response.status);
				}
			} catch (error) {
				console.error("Error fetching profile Token:", error);
			}
		};
		requestMatchHist();
	}, []);

	return (
		<div className="profile-box">
			<div className="profile-box-two">
				{data != null ? (
					<div>
						<img className="profile-photo" src={data.image} />
					</div>
				) : (
					<h2>nop</h2>
				)}

				<div className="main">
					<div className="stats">
						<p>Nickname</p>
						<p>Won</p>
						<p>Lost</p>
					</div>

					<div className="stats-values">
						{data ? <a>{data.username}</a> : <h2>no infos</h2>}
						{matches && data ? (
							<p>{matches.filter((m) => m.winner?.id === data.id).length}</p>
						) : (
							<h2>no infos</h2>
						)}
						{matches && data ? (
							<p>{matches.filter((m) => m.winner?.id !== data.id).length}</p>
						) : (
							<h2>no infos</h2>
						)}
					</div>
				</div>

				<div className="buttons-container">
					<AchievementsButton />
					{matches ? (
						<MatchHistory matches={matches} />
					) : (
						<h2>Couldn't get match hist</h2>
					)}
				</div>
			</div>
		</div>
	);
};

export default Profile;
