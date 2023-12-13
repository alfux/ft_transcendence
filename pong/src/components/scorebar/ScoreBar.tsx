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

interface	UserData {
	user: User,
	you: boolean
}

const ScoreBar: React.FC<{user?: UserData}> = ({user}) => {
  const [data, setData] = useState<User | undefined>(user?.user);
  const	[score, setScore] = useState<number>(0);
  gameSocket.on("score", (s) => {
	  setScore(user?.you ? s.you : s.opponent);
  });

  return (
    <div id="score-component" className={(user?.you) ? "score-bar" : "ennemy-bar"}>
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
