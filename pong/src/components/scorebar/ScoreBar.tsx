import './ScoreBar.css'
import { config } from '../../config';
import Cookies from 'js-cookie';
import React, { useRef, useEffect, useState } from 'react'
import usePayload from '../../react_hooks/use_auth'
import userEvent from '@testing-library/user-event';
import { LoggedStatus } from '../../THREE/Utils/jwt.interface';

import { gameSocket } from '../../sockets';

export type User = {
  id: number;
  email: string;
  image: string;
  isAuthenticated: LoggedStatus;
  twoFactorAuth: boolean;
  username: string;
}

const ScoreBar: React.FC<{user?: User}> = ({user}) => {
  const [payload, updatePayload, handleUpdate] = usePayload();
  const [data, setData] = useState<User | null>(null)
  const	[score, setScore] = useState<number>(0);
  gameSocket.on("score", (score) => {
	  setScore(user ? score.opponent : score.you);
  });

  useEffect(() => {
    const requestScore = async () => {
      try {//fetch Score
        const enable2FAEndpoint = `${config.backend_url}/api/user/me`;
        console.log('Before fetch');
        const response = await fetch(enable2FAEndpoint, {
          method: 'GET',
          credentials: 'include',
        });

        if (response.ok) {
          const result = await response.json()
          setData(result)
        } else {
          console.error('Could not get score:', response.status);
        }
      } catch (error) {
        console.error('Error fetching score Token:', error);
      }
    };
	if (user)
		setData(user);
	else
    	requestScore();
  }, [])
  console.log("user:", data)

  return (
    <div id="score-component" className={(user) ? "ennemy-bar" : "score-bar"}>
      {data != null ? (
        <img className="score-photo" src={data.image}></img>
      ) : <h2>nop</h2>}
      {data != null ? (
        <div className='stats'>
          <p>Player</p>
          <p>Score</p>
        </div>
      ) : <h2>nop</h2>}
      {data != null ? (
        <div className='stats-values'>
          <p>{data.username}</p>
          <p>{score}</p>
        </div>
      ) : <h2>nop</h2>}
    </div>
  );
};

export default ScoreBar;
