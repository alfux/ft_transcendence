import './Profile.css'
import Cookies from 'js-cookie';
import React, { useEffect, useState } from 'react'
import userEvent from '@testing-library/user-event';
import usePayload from '../../react_hooks/use_auth'
import { config } from '../../config';
import AchievementsButton from './buttons/achievements/AchievementsButton';
import MatchHistory from './buttons/matchhistory/MatchHistoryButton';
import { User, Match } from '../../THREE/Utils/backend_types';


const Profile: React.FC = () => {
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

  function changePfP(event: any) {
    if (!data)
      return

    const file = event.target.files[0]
    const reader = new FileReader();

    const sendFile = async (image_b64:string) => {
      try {
        const response = await fetch(`${config.backend_url}/api/user/me`, {
          method: 'PATCH',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            image: `data:image/png;base64,${image_b64}`
          }),
        });

        if (response.ok) {
          console.log('File uploaded successfully.');
          const result = await response.json()
          console.log(result)
          setData(result)
        } else {
          console.error('Failed to upload file.');
        }
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    }

    reader.onload = () => {
      const res = reader.result as string
      const base64String = res.split(',')[1]
      sendFile(base64String)
    };
  
    reader.readAsDataURL(file);

  }

  return (
    <div className="profile-box">
      <div className='profile-box-two'>

        {data != null ? (
          <div>
            <input
              type="file"
              id="fileInput"
              style={{ display: 'none' }}
              onChange={changePfP}
            />
            <label htmlFor="fileInput">
              <img className="profile-photo" src={data.image} />
            </label>
          </div>
        ) : <h2>nop</h2>}

        <div className='main'>
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

        <div className='buttons-container'>
          <AchievementsButton />
          {matches ? <MatchHistory matches={matches} /> : <h2>Couldn't get match hist</h2>}
        </div>

      </div>
    </div>
  );
};

export default Profile;
