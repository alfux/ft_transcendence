import { config } from '../../config';
import Cookies from 'js-cookie';
import './matchMaking.css'
import React, { useRef, useEffect, useState } from 'react'
import usePayload from '../../react_hooks/use_auth'
import ReactAudioPlayer from 'react-audio-player';
import { User } from '../../THREE/Utils/backend_types';
import { backend_fetch } from '../backend_fetch';

const MatchMaking: React.FC = () => {
  const [payload, updatePayload, handleUpdate] = usePayload();
  const [data, setData] = useState<User | undefined>()

  useEffect(() => {
    const requestProfile = async () => {
      try {//fetch Profile
        const url = `${config.backend_url}/api/user/me`;
        const response = await fetch(url, {
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
    //backend_fetch()
  }, [])

  return (
    <div className="glass-container-matchmaking">
      <div className='sub-container'>
        <h2>Match Making</h2>
      </div>
      <div className='players'>
        <div className='player-one'>
          <div className='player-info-one'>
            <p>Player: {data?.username}</p>
            <p>player rank</p>
            <p>lvl 10</p>
          </div>
          <img src={data?.image} alt="avatar" />
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
      <ReactAudioPlayer className='audio' src="./game.mp3" controls autoPlay={true}/>
    </div>
  );
};

export default MatchMaking;
