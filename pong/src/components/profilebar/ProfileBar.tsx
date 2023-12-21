import './ProfileBar.css'
import { config } from '../../config';
import Cookies from 'js-cookie';
import React, { useRef, useEffect, useState } from 'react'
import usePayload from '../../react_hooks/use_auth'
import userEvent from '@testing-library/user-event';
import { LoggedStatus } from '../../THREE/Utils/jwt.interface';
import { Match, User } from '../../THREE/Utils/backend_types';

const ProfileBar: React.FC = () => {
	const [payload, updatePayload, handleUpdate] = usePayload();
	const [data, setData] = useState<User | null>(null)
	const [matches, setMatches] = useState<Match[] | null>(null)

	useEffect(() => {
		const requestProfile = async () => {
			try {//fetch Profile
				const response = await fetch(`${config.backend_url}/api/user/me`, {
					method: 'GET',
					credentials: 'include',
				});

				if (response.ok) {
					const result = await response.json()
					setData(result)
				} else {
					console.error('Could not get profile:', response.status);
				}
			} catch (error) {
				console.error('Error fetching profile Token:', error);
			}
		};

		const requestMatchHist = async () => {
			try {//fetch Matches
				const response = await fetch(`${config.backend_url}/api/user/matches`, {
					method: 'GET',
					credentials: 'include',
				});

				if (response.ok) {
					const result = await response.json()
					setMatches(result)
				} else {
					console.error('Could not get matches:', response.status);
				}
			} catch (error) {
				console.error('Error fetching profile Token:', error);
			}
		};

		requestProfile();
		requestMatchHist();
	}, [])

	return (
		<div className="profile-bar">
			{data != null ? (
				<img className="profile-photo" src={data.image}></img>
			) : <h2>nop</h2>}
			<div className='stats'>
				<p>Nickname</p>
				<p>Won</p>
				<p>Lost</p>
			</div>
			<div className='stats-values'>
				{data ? <p>{data.username}</p> : <h2>no infos</h2>}
				{matches && data ? <p>{matches.filter((m) => m.winner?.username === data.username).length}</p> : <h2>no infos</h2>}
				{matches && data ? <p>{matches.filter((m) => m.winner?.username !== data.username).length}</p> : <h2>no infos</h2>}
			</div>
		</div>
	);
};

export default ProfileBar;