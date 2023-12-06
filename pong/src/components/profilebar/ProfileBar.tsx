import './ProfileBar.css'
import { config } from '../../config';
import Cookies from 'js-cookie';
import React, { useRef, useEffect, useState } from 'react'
import usePayload from '../../react_hooks/use_auth'
import userEvent from '@testing-library/user-event';
import { LoggedStatus } from '../../THREE/Utils/jwt.interface';

const accessToken = Cookies.get('accessToken')

type User = {
  id: number;
  email: string;
  image: string;
  isAuthenticated: LoggedStatus;
  twoFactorAuth: boolean;
  username: string;
}

const ProfileBar: React.FC = () => {
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
  console.log("user:", data)

  return (
    <div className="profile-bar">
      {data != null ? (
        <img className="profile-photo" src={data.image}></img>
      ) : <h2>nop</h2>}
      {data != null ? (
        <div className='stats'>
          <p>Login</p>
          <p>Rank</p>
          <p>Lvl</p>
        </div>
      ) : <h2>nop</h2>}
      {data != null ? (
        <div className='stats-values'>
          <p>{data.username}</p>
          <p>1</p>
          <p>10</p>
        </div>
      ) : <h2>nop</h2>}
    </div>
  );
};

export default ProfileBar;
