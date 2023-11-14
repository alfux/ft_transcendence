import { useState, useEffect } from 'react'
import { getHeaders } from '../Auth/AuthComponent'
import { ProfileView } from './ProfileView';
import { ProfileSidebar, ProfileSidebarSections } from './ProfileSiderbar';
import { Chat } from '../Chat';
import './MainPage.css'
import { User } from '../types';

function CreateUser() {
  const [id, setId] = useState("")
  const [username, setUsername] = useState("")
  const [image, setImage] = useState("")

  function handleSubmit() {
    fetch('http://localhost:3001/api/debug/add_user', {
      method: 'POST',
      headers: {'Content-Type':'application/json', ...getHeaders()},
      body: JSON.stringify({
        'id':+id,
        'username':username,
        'image':image
      }),
    })
    .catch((error) => console.error('Error:', error));
  }

  return (
    <>
      Create user:
      <div>  
        <label>
          ID:
          <input type="text" value={id} onChange={(e) => {setId(e.target.value)}} />
        </label>
        <label>
          Username:
          <input type="text" value={username} onChange={(e) => {setUsername(e.target.value)}} />
        </label>
        <label>
          Image:
          <input type="text" value={image} onChange={(e) => {setImage(e.target.value)}} />
        </label>
        <button onClick={handleSubmit}>send</button>
      </div>
    </>
  )
}


function UserList() {
  
  const [users, setUsers] = useState<User[]>([])
  
  useEffect(() => {

    fetch('http://localhost:3001/api/debug/all_users', { method: 'GET' })
    .then((response) => response.json())
    .then((data) => {
      console.log(data)
      setUsers(data)
    })
    .catch((error) => console.error('Error:', error));  
  }, [])


  function log_as(user:User) {
    fetch('http://localhost:3001/api/debug/log_as', { 
      method: 'POST',
      headers: {'Content-type':'application/json'},
      body: JSON.stringify({
        "username":user.username 
      }),
    })
    .then((response) => response.json())
    .then((data) => {
      console.log(data)
      localStorage.setItem('token', data.token)
    })
    .catch((error) => console.error('Error:', error));  
  }

  return (
    <>
      <ul>
        {users?.map((item, index) => (
          <li key={index} onClick={() => {log_as(item)}}>
            {item.username}
          </li>
        ))}
      </ul>
    </>
  ) 
}


export function DebugMenu() {
  return (
    <>
      <CreateUser />
      <UserList />
    </>
  )
}
