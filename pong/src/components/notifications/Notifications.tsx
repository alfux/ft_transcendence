
import React, { useState, useEffect, useRef, Dispatch, SetStateAction } from 'react';

import './Notifications.css';
import { config } from '../../config';




const Notifications: React.FC<{ notificationData: { type: string; data: any } | null }> = ({ notificationData }) => {
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

    const getNotificationRequests = friendsRequest?.received?.map((user: any) => {
        async function acceptFriend(){
            const verify2FAEndpoint = `${config.backend_url}/api/user/friend_request_accept`;
            try {
              const response = await fetch(verify2FAEndpoint, {
                method: 'POST',
                credentials: 'include',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({id :user.id}),
              });
              if (response.ok) {
              //  const data = await response.json();
              //  console.log("Response: ",data)
              } else {
            alert("didnt sended accept request")
                console.error('Error sending invite Server responded with status:', response.status);
              }
            } catch (error) {
              console.error('Error fetching:', error);
            }
            try{
            }catch(error){
              console.log(error)
            }
          }
          if (user?.sender) {
            return (
              <div key={user.sender?.id}>
                <img key={user.sender?.id} src={user.sender?.image} alt={user.sender?.id} />
                <p>Name: {user.sender?.username}</p>
                <p>{user.sender?.username} has made a friend request.</p>
                <div className="notifications-buttons-box">
                  <button onClick={acceptFriend}>Accept</button>
                  <button>Reject</button>
                </div>
              </div>
            );
          } else {
            return null;
          }
        })
        if (notificationData?.type === "friend_new")
          console.log("data2 : ", notificationData.data)
    return (
        <div key={1}className={`notifications-container-${toogleButton == "show" && friendsRequest?'on':'off'}`}>
            <div  key={2} className='notifications-content'>
                <div  key={3} className="notification-profile">
                    {getNotificationRequests}
                    {notificationData?.type ===  "friend_new" && <p >New Friend Added: {notificationData.data.user?.username} </p>}
                </div>
            </div>
                <div  key={4}className='notification-popup'>
                    <button onClick={toogleNotification}></button>
                </div>
        </div>
    );
};
export default Notifications;

