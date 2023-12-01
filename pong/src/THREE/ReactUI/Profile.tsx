import React, { useState, useEffect, Children, Dispatch, SetStateAction } from 'react'
import ReactDOM from 'react-dom/client'

import { config } from '../../config'
import { getHeaders } from '../Utils'

import { notifications } from '../../notification/notification'

import './css/ui.css'
import './css/profile.css'
import { Socket } from 'socket.io-client'

interface ProfileData {
  id:number
  username:string
  image:string
}

interface FriendRequest {
  id:number
  sender:ProfileData
  receiver:ProfileData
}

enum FriendRequestStatus {
  None="",
  Sending="Sending...",
  Success="Success !",
  NotFound="User not found !",
  Failed="Something went wrong :("
}

function PPDisplay(props:{src:string, className:string, children?:React.ReactNode}) {
  
  const [error, setError] = useState(false)
  
  return (
    <>
      {
        error ?
        <div className={props.className}>
        </div>
        :        
        <img src={props.src} className={props.className} onError={() => setError(true)}>
          {props.children}
        </img>  
      }
    </>
  )
}

export function Profile(props: {socket: Socket|undefined}) {

  const [profile, setProfile] = useState<ProfileData>()
  const [friends, setFriends] = useState<ProfileData[]>()
  const [receivedFriendsRequests, setReceivedFriendsRequests] = useState<FriendRequest[]>([])
  const [sentFriendsRequests, setSentFriendsRequests] = useState<FriendRequest[]>([])
  const [blocked, setBlocked] = useState<ProfileData[]>()

  const [showAddFriend, setShowAddFriend] = useState(false)
  const [addFriendUsername, setAddFriendUsername] = useState("")
  const [friendRequestSent, setFriendRequestSent] = useState<FriendRequestStatus>(FriendRequestStatus.None)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      setProfile(undefined)
      return
    }

    fetch(`${config.backend_url}/api/user/me`, {
      method:'GET',
      headers:getHeaders()
    })
    .then((data) => data.json())
    .then((profile) => {
      setProfile(profile)
    })
    .catch(() => {setProfile(undefined)})
    .then(() => {

      fetch(`${config.backend_url}/api/user/friend_request`, {
        method:'GET',
        headers:getHeaders()
      })
      .then((data) => data.json())
      .then((reqs: {received:FriendRequest[], sent:FriendRequest[]}) => {
        setReceivedFriendsRequests(reqs.received)
        setSentFriendsRequests(reqs.sent)
      })
      .catch(() => {setFriends(undefined)})

    })


    fetch(`${config.backend_url}/api/user/friends`, {
      method:'GET',
      headers:getHeaders()
    })
    .then((data) => data.json())
    .then((friends) => {
      setFriends(friends)
    })
    .catch(() => {setFriends(undefined)})



    fetch(`${config.backend_url}/api/user/blocked`, {
      method:'GET',
      headers:getHeaders()
    })
    .then((data) => data.json())
    .then((blocked) => {
      setBlocked(blocked)
    })
    .catch(() => {setBlocked(undefined)})


    if (props.socket) {
      props.socket.on("friend_request_recv", (data:{req:FriendRequest}) => {
        console.log("Friend request recv")
        setReceivedFriendsRequests((prev) => [data.req, ...prev])
      })
      props.socket.on("friend_request_accepted", (data:{req:FriendRequest}) => {
        setReceivedFriendsRequests(receivedFriendsRequests.filter((v) => v.id !== data.req.id))
        setSentFriendsRequests(sentFriendsRequests.filter((v) => v.id !== data.req.id))
      })
      props.socket.on("friend_new", (data:{user:ProfileData}) => {
        setFriends((prev) => prev ? [data.user, ...prev] : [data.user])
      })
      props.socket.on("friend_delete", (data:{user:ProfileData}) => {
        console.log(friends)
        const new_friends_list = friends?.filter((v) => v.id !== data.user.id)
        console.log(new_friends_list)
        setFriends(new_friends_list)
      })
    }

    return () => {
      props.socket?.off("friend_request_recv")
      props.socket?.off("friend_request_accepted")
      props.socket?.off("friend_new")
      props.socket?.off("friend_delete")
    }
  }, [])

  function sendFriendRequest() {
    setFriendRequestSent(FriendRequestStatus.Sending)
    fetch(`${config.backend_url}/api/user/friend_request`, {
      method: 'POST',
      headers:{'Content-Type': 'application/json', ...getHeaders()},
      body: JSON.stringify({username:addFriendUsername})
    })
    .then((res) => {
      if(!res.ok) return res.text().then(text => { throw new Error(text) });
      setFriendRequestSent(FriendRequestStatus.Success)
      return res.json()
    })
    .then((json) => {
      setSentFriendsRequests((prev) => [json, ...prev])
    })
    .catch((e: Error) => {
      const json: {message:string, statusCode:number} = JSON.parse(e.message)
      if (json.message === "User not found") {
        setFriendRequestSent(FriendRequestStatus.NotFound)
      } else {
        console.log(json.message)
        setFriendRequestSent(FriendRequestStatus.Failed)
      }
    })
  }  

  function acceptFriendRequest(fr: FriendRequest) {
    fetch(`${config.backend_url}/api/user/friend_request_accept`, {
      method: 'POST',
      headers:{'Content-Type': 'application/json', ...getHeaders()},
      body: JSON.stringify({id:fr.id})
    })
    .then((res) => {
      if(!res.ok) return res.text().then(text => { throw new Error(text) });
    })
    .catch((e: Error) => {
      const json: {message:string, statusCode:number} = JSON.parse(e.message)
      console.log(json.message)
    })
  }

  function removeFriend(user_id:number) {
    fetch(`${config.backend_url}/api/user/remove_friend`, {
      method: 'POST',
      headers:{'Content-Type': 'application/json', ...getHeaders()},
      body: JSON.stringify({user_id:user_id})
    })
    .then((res) => {
      if(!res.ok) return res.text().then(text => { throw new Error(text) });
    })
    .catch((e: Error) => {
      const json: {message:string, statusCode:number} = JSON.parse(e.message)
      console.log(json.message)
    })
  }

  function blockUser(user_id:number) {
    fetch(`${config.backend_url}/api/user/blocked`, {
      method: 'POST',
      headers:{'Content-Type': 'application/json', ...getHeaders()},
      body: JSON.stringify({user_id:user_id})
    })
    .then((res) => {
      if(!res.ok) return res.text().then(text => { throw new Error(text) });
      res.text().then(text => console.log(text))
    })
    .catch((e: Error) => {
      const json: {message:string, statusCode:number} = JSON.parse(e.message)
      console.log(json.message)
    })
  }

  return (
    <div className='bg-rect profile'>
      {
        profile ? 

        <div className="topbar">
        
          <div className="img-container">
            <img src={profile.image} className="image"/>
          </div>
          <div className='text-container'>
            <a className='text'>{profile.username}</a>
          </div>
        
        </div>
        : <a>Can't load profile !</a>
      }

      {
        friends ?
        <div className='bg-rect profile friends'>
          <div style={{display:'flex', flexDirection:'row'}}>
            <a style={{fontSize:'20px', color:'white'}}>Friends:</a>
            <button style={{marginLeft:'auto', height:'20px'}} onClick={()=>{setShowAddFriend((prev)=>!prev)}}>
              {showAddFriend?"return":"add friend"}
            </button>
          </div>
          {
            showAddFriend ? 
            <div className='bg-rect add-friend'>
              <div>
                <input type="text" value={addFriendUsername} onChange={(event) => {setAddFriendUsername(event.target.value)}}/>
                <button onClick={sendFriendRequest}>send</button>
                {friendRequestSent}
              </div>

              <ul className='friend-list'>
                {
                  receivedFriendsRequests.map((v, i) => (
                    <li key={i} className='item'>
                      <PPDisplay src={v.sender.image} className='img'/>
                      <a className='text'>{v.sender.username}</a>
                      <button onClick={() => acceptFriendRequest(v)}>accept</button>
                    </li>
                  ))
                }
                {
                  sentFriendsRequests.map((v, i) => (
                    <li key={i} className='item'>
                      <PPDisplay src={v.receiver.image} className='img'/>
                      <a className='text'>{v.receiver.username}</a>
                      <button onClick={() => acceptFriendRequest(v)}>accept</button>
                    </li>
                  ))
                }
              </ul>

            </div>
            :
            <ul className='friend-list'>
              {friends.map((v, i) => 
                <li key={i} className='item'>
                  <PPDisplay src={v.image} className='img'/>
                  <a className='text'>{v.username}</a>
                  <div className='buttons'>
                    <div className='container'>
                      <button id='button' onClick={()=>{}} >chat</button>
                      <button id='button' onClick={() => removeFriend(v.id)} >remove</button>
                      <button id='button' onClick={() => blockUser(v.id)} >block</button>
                    </div>
                  </div>
                </li>
              )}
            </ul>
          }
        </div>
        : <a>Can't load friends !</a>
      }

      {
        blocked ?
        <ul>
          {blocked.map((v, i) => 
            <li key={i}>
              {v.username}
            </li>
          )}
        </ul>
        : <a>Can't load blocked !</a>
      }

    </div>
  )
}
