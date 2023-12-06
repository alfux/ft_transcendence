import { config } from '../../config';
import Cookies from 'js-cookie';
import './matchMaking.css'
import React, { useRef, useEffect, useState } from 'react'
import usePayload from '../../react_hooks/use_auth'
import userEvent from '@testing-library/user-event';
const accessToken = Cookies.get('accessToken')
type User = {
  avatar: string;
  email: string;
  firstName: string;
  lastName: string;
  nickName: string;
}
const MatchMaking: React.FC = () => {
  const [payload, updatePayload, handleUpdate] = usePayload();
  const [data, setData] = useState<User | null>(null)
  useEffect(() => {
    const requestProfile = async () => {
      try {//fetch Profile
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
          console.error('Could not get profile:', response.status);
        }
      } catch (error) {
        console.error('Error fetching profile Token:', error);
      }
    };
    requestProfile();
  }, [])
  return (
    <div className="glass-container-matchmaking">
      <div className='sub-container'>
        <h2>Match Making</h2>
      </div>
      <div className='players'>
        <div className='player-one'>
          <div className='player-info-one'>
            <p>{data?.nickName}</p>
            <p>player rank</p>
            <p>lvl 10</p>
          </div>
          <img src={data?.avatar}></img>
        </div>
        <div className='player-two'>
          <div className='player-info-two'>
            <p>player name</p>
            <p>player rank</p>
            <p>lvl</p>
          </div>
          <img src='42.png'></img>
        </div>
      </div>
      <div className='buttons'>
        <button>Invite</button>
        <button>Find Match</button>
      </div>
    </div>
  );
};

export default MatchMaking;
