

import Cookies from 'js-cookie';
import React, { useState, useEffect, useRef, Dispatch, SetStateAction } from 'react';
import jwt, { jwtDecode } from 'jwt-decode';
import { JwtPayload, LoggedStatus } from '../../THREE/Utils/jwt.interface';
import TwoFactorValidate from '../twofactorvalidate/TwoFactorValidate';
import usePayload from '../../react_hooks/use_auth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import './Notifications.css';
import { Conversation, ConversationUser, FriendRequest, User } from '../../THREE/ReactUI/backend_types';
import { config } from '../../config';
import Login from '../login/Login';
import { channel } from 'diagnostics_channel';
import { group } from 'console';
import { notifications } from '../../notification/notification';




const Notifications: React.FC = () => {
    const [friendsRequest, setFriendsRequests] = useState<any | null>(null);
    const [toogleButton, setToogleButton] = useState<string>("show")
    useEffect(() =>{
        const fetchRequets = async () => {
            try {//fetch Profile
                const enable2FAEndpoint = `${config.backend_url}/api/user/friend_request`;
                const response = await fetch(enable2FAEndpoint, {
                    method: 'GET',
                    credentials: 'include',
                });
                
                if (response.ok) {
                    const result = await response.json()
                    setFriendsRequests(result)
                } else {
                    console.error('Could not get friendRequests:', response.status);
                }
            } catch (error) {
                console.error('Error fetching friendRequests:', error);
            }
        };
        fetchRequets()
    },[])
    

    function toogleNotification(){
        if (toogleButton == "show"){
            setToogleButton("hide")
        }
        else{
            setToogleButton("show")
        }
    }
    
    const getNotificationContent = friendsRequest?.received?.map((user: any) => {
        // Check if user.sent is defined before accessing its properties
        if (user.sender) {
          return (
            <div key={user.sender.id}>
              <img key={user.sender.id} src={user.sender.image} alt={user.sender.id} />
              <p>Name: {user.sender.username}</p>
              <p>{user.sender.username} has made a friend request.</p>
              <div className="notifications-buttons-box">
                <button>Accept</button>
                <button>Reject</button>
              </div>
            </div>
          );
        } else {
          // Handle the case where user.sent is undefined or null
          return null; // or a default component or message
        }
      });

    console.log("friends Request data: ",friendsRequest)
    return (
        <div className={`notifications-container-${toogleButton == "show" && friendsRequest?'on':'on'}`}>
            <div className='notifications-content'>
                <div className="notification-profile">
                    {getNotificationContent}
                </div>
            </div>
                <div className='notification-popup'>
                    <button onClick={toogleNotification}></button>
                </div>
        </div>
    );
};

export default Notifications;

