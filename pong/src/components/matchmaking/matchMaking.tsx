import { config } from '../../config';
import Cookies from 'js-cookie';
import './matchMaking.css'
import React, { useRef, useEffect, useState } from 'react'
import usePayload from '../../react_hooks/use_auth'
import { GameMode, User } from '../../THREE/Utils/backend_types';
import { FetchError, backend_fetch } from '../backend_fetch';
import { MoonLoader } from 'react-spinners';
import { gameSocket } from '../../sockets';

import Countdown from 'react-countdown'
import Select from "react-dropdown-select";

import { classic_mode } from "../../THREE/MenuScene/menu_scene";

const MatchMaking: React.FC = () => {
	const [payload, updatePayload, handleUpdate] = usePayload();
	const [data, setData] = useState<User | undefined>()

	const [mode, setMode] = useState<GameMode>(GameMode.CLASSIC);

	const [searching, setSearching] = useState(false)
	const [opponent, setOpponent] = useState<User | undefined>()
	const [timer, setTimer] = useState(0)

	useEffect(() => {
		backend_fetch(`${config.backend_url}/api/user/me`, {
			method: 'GET'
		})
		.catch((e) => { if (e instanceof FetchError) {} else throw e })

		gameSocket.on("match_found", (data: { opponent: User, delay: number }) => {
			setOpponent(data.opponent)
			setTimer(data.delay)

			setSearching(false)
		})

		return (() => {
			gameSocket.emit("cancel_search")
		})

	}, [])

	const handleSelectModeChange = (values: {}[]) => {
		console.log('Selected:', values[0]);
		console.log(values)
		setMode(values.length > 0 ? (values[0] as any).value : GameMode.CLASSIC);

	};


	return (
		<div className="glass-container-matchmaking">

			<div className='sub-container'>
				<h2>Match Making</h2>
				{
					timer === 0 ?
						undefined
						: <Countdown
							date={Date.now() + timer * 1000}
							onComplete={() => setTimer(0)}
						/>
				}
			</div>


			<div className='players'>

				<div className='player-one'>
					<div className='player-info-one'>
						<p>Player: {data?.username}</p>
					</div>
					<img src={data?.image} alt="avatar" />
				</div>

				<div className='player-two'>
					{
						opponent ?
							<div className='player-info-two'>
								<p>{opponent.username}</p>
							</div>
							:
							undefined
					}
					{
						searching ?
							<MoonLoader color={'#36D7B7'} loading={searching} size={150} />
							: (
								opponent ?
									<img src={opponent.image} />
									:
									<img src='42.png'></img>
							)
					}
				</div>
			</div>


			<div className='buttons'>
				<button>Invite</button>
				{
					searching ?
						<button onClick={() => { setSearching(false); gameSocket.emit("cancel_search") }}>
							Cancel
						</button>
						:
						<button onClick={() => { setSearching(true); gameSocket.emit("search", { mode: mode }) }}>
							Find Match
						</button>
				}
				<Select
					values={[{ value: mode, label: mode }]}
					options={Object.values(GameMode).map((option) => ({ value: option, label: option }))}
					onChange={handleSelectModeChange}
				/>
			</div>
		</div>
	);
};

export default MatchMaking;
