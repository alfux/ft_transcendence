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
			<div className='profile-box-two'>
				<div className='main'>
					<div className='stats-values'>
						<img className="profile-photo" src={data?.image} />
						<p>nickName : {data?.username}</p>
						<p>Email : {data?.email}</p>
					</div>
				</div>
				<div className='buttons-container'>
					<div className='achevments'>
						<AchievementsButton />
						{matches && data ? <p>Won : {matches.filter((m) => m.winner?.id === data.id).length}</p> : <h2>no infos</h2>}
						{matches && data ? <p>Lost : {matches.filter((m) => m.winner?.id !== data.id).length}</p> : <h2>no infos</h2>}
					</div>
					<div className='matchHistory'>
						{matches && <MatchHistory matches={matches} />}
					</div>

				</div>

			</div>
		</div>
	);
};

export default Profile;
