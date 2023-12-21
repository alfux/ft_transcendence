import React, { useRef, useEffect, useState } from 'react'
import './MatchHistoryButton.css'
import { Match } from '../../../../THREE/Utils/backend_types';


function MatchHistory(props: {
	matches: Match[]
}) {
	console.log("match",props.matches)
	const matchhistory = props.matches.map((match)=>{
		const playerOne = match?.players[0];
		const playerTwo = match?.players[1];
		const winner = match?.winner?.username;
		return(
			<div className='match' key={match?.id}>
				<p>{playerOne?.username} VS {playerTwo?.username}</p>
				<p>Winner [{winner}]</p>
			</div>
		)
	})

	return (
		<div className="mhcontainer" >
			<button className='glowing-btn2'>
				<span className='glowing-txt2'>Match
					<span className='faulty-letter2'> History</span>
				</span>
			</button>
			{matchhistory}
		</div>
	);

}

export default MatchHistory;
