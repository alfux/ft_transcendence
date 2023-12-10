// MiniChat.js

import Cookies from 'js-cookie';
import React, { useState, useEffect, useRef, Dispatch, SetStateAction } from 'react';
import jwt, { jwtDecode } from 'jwt-decode';
import { JwtPayload, LoggedStatus } from '../../THREE/Utils/jwt.interface';
import TwoFactorValidate from '../twofactorvalidate/TwoFactorValidate';
import usePayload from '../../react_hooks/use_auth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import './MiniChat.css';
import { Conversation, ConversationUser, FriendRequest, User } from '../../THREE/ReactUI/backend_types';
import { config } from '../../config';
import Login from '../login/Login';
import { channel } from 'diagnostics_channel';
import { group } from 'console';
import { notifications } from '../../notification/notification';

enum ChannelOptions  {
  CREATE_CHANNEL = "create channel",
  ONLINE_USERS = "online users",
  FRIENDS = "friends"
};

const MiniChat: React.FC = () => {
  const [channels, setChannels] = useState<Conversation[] | null>();
  const [me, setMe] = useState<User | undefined>(undefined)
  const [data, setData] = useState<User[] | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | undefined>(undefined);
  const [selectedGroup, setSelectedGroup] = useState<ConversationUser | null>(null);
  const [selectedGroupOption, setSelectedGroupOption] = useState<ChannelOptions | null>(null);
  const [payload, updatePayload, handleUpdate] = usePayload();
  const [friends, setFriends] = useState<User[] | null>(null);
  // const [a,setA] = useState('a')
  // _______________________________________________________________________
  
  
  useEffect(() => {
    // Request all users
    const requestProfile = async () => {
      try {
        const enable2FAEndpoint = `${config.backend_url}/api/user`;
        console.log('Before fetch');
        const response = await fetch(enable2FAEndpoint, {
          method: 'GET',
          credentials: 'include',
        });
        if (response.ok) {
          const result = await response.json()
          console.log(result)
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
  useEffect(() => {
    // Request all owned channels
    const requestProfile = async () => {
      try {
        const enable2FAEndpoint = `${config.backend_url}/api/conversation/own`;
        console.log('Before fetch of conversation');
        const response = await fetch(enable2FAEndpoint, {
          method: 'GET',
          credentials: 'include',
        });
        if (response.ok) {
          const result = await response.json()
          setChannels(result)
          
        } else {
          console.error('Could not get profile:', response.status);
        }
      } catch (error) {
        console.error('Error fetching profile Token:', error);
      }
    };
    console.log("TESTING")
    requestProfile();
  }, [])
  useEffect(() => {
    // Request all owned channels
    const requestProfile = async () => {
      try {
        const enable2FAEndpoint = `${config.backend_url}/api/user/friends`;
        console.log('Before fetch of conversation');
        const response = await fetch(enable2FAEndpoint, {
          method: 'GET',
          credentials: 'include',
        });
        if (response.ok) {
          const result = await response.json()
          console.log("Friends",result)
          setFriends(result)
          
        } else {
          console.error('Could not get profile:', response.status);
        }
      } catch (error) {
        console.error('Error fetching profile Token:', error);
      }
    };
    requestProfile();
  }, [])
  // _________________________________________________________________________________________
  
  // Function on click set the SelectedUser to the user clicked
  function printInfo(user :User){
    setSelectedUser(user)
  }

  useEffect(() => {
    // Find the user corresponing to the payload id
    const currentUser = data?.find(user => user.id === payload?.id);
    if (currentUser) {
      setMe(currentUser);
    }
  }, [data, payload]);

  // Iterate all users and return a image of each user
  const onlineUsers = data?.map((user:User) =>{
    return (
      user?.isAuthenticated === LoggedStatus.Logged ? <img key = {user.id} src={user.image} className='chat-img' onClick={()=>printInfo(user)}/>:null
  )})
    
// Iterate groups and return a element with the first letter of the group
  const usersGroups = channels?.map((group:Conversation) =>{
    const title = group.title;
    console.log(title)
    const firstTitleLetter = title?.charAt(0).toUpperCase()
    return (
       <p className="group-icons" key={group.id}>{firstTitleLetter}</p>
  )})

// Iterate Channel and return image of users
  const myFriends = friends?.map((friend:User) =>{
    return (
      friend?.isAuthenticated === LoggedStatus.Logged ? <img className="group-icons" src={friend.image} key={friend.id}/>:null
 )})






 async function sendInvite(){
  const verify2FAEndpoint = `${config.backend_url}/api/user/friend_request`;
  try {
    const response = await fetch(verify2FAEndpoint, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(selectedUser),
    });
    if (response.ok) {
     const data = await response.json();
     console.log("RESONSE: ",data)
     console.log(" sended friend request to", selectedUser?.username)
    } else {
  alert("didnt sended invate")
      console.error('Error sending invite Server responded with status:', response.status);
    }
  } catch (error) {
    console.error('Error verifying 2FA code:', error);
  }
  try{
    //await requestNewToken()
    handleUpdate()
  }catch(error){
    console.log(error)
  }
  
}
useEffect(()=>{
    
  notifications.on("friend_request_recv", (req: FriendRequest, ) => {
    console.log("NOTIFICATION ONNNN")
  })
  
 })


  return (
      <div className='a'>{selectedUser && <div className='user-profile'>
        {selectedUser && <img className='user-image' src={selectedUser.image}/>}
        {selectedUser && <p>{selectedUser.username}</p>}
        {selectedUser && <button onClick={sendInvite}>Invite Friend</button>}
      </div>}
      <div className="glass-container-minichat">
        <div className='chat-groups'>
          {<img src='./add.png' className='group-img' onClick={()=>{setSelectedGroupOption(ChannelOptions.CREATE_CHANNEL)}}/>}
          {<img src='./online.png' className='group-img'onClick={()=>{setSelectedGroupOption(ChannelOptions.ONLINE_USERS)}}/>}
          {<img src='./friends.png' className='group-img'onClick={()=>{setSelectedGroupOption(ChannelOptions.FRIENDS)}}/>}
          {usersGroups}
        </div>
        <div className='chat-main'>
          <div className='chat-options' id='chat-friends'>
            {selectedGroupOption == ChannelOptions.ONLINE_USERS && onlineUsers}
            {selectedGroupOption == ChannelOptions.FRIENDS && myFriends}
          </div>
          <div className='chat-box'>
            <div className='message-output'>
              <div className='message-output-box'>
                {selectedUser && <img src={selectedUser.image} className='user-image'/> && <p>{selectedUser.username}: Hi</p>}
              </div>
            </div>
            <div className='message-input'>
              <input className="message-input-text" type="text" placeholder="Message ..."/>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MiniChat;

