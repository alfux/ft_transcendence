import { useState, useEffect } from 'react'
import { getHeaders } from '../Auth/AuthComponent'
import { ProfileView } from './ProfileView';
import { ProfileSidebar, ProfileSidebarSections } from './ProfileSiderbar';
import { Chat } from '../Chat';
import './MainPage.css'
import { DebugMenu } from './Debug';



export interface User {
  id: number;

  username: string;
  image:string

  own_conversations: any
  conversations: any
  messages: any
}


export function MainPage()
{
  const [data, setData] = useState<User | null>(null);
  const [activeSection, setActiveSection] = useState<ProfileSidebarSections>('profile');


  useEffect(() => {
    const headers = getHeaders()
    fetch('http://localhost:3001/api/users/me', {
      method: 'GET',
      headers: headers
    })
      .then((response) => response.json())
      .then((data) => {
        setData(data)
      })
      .catch((error) => console.error('Error:', error));
  }, []);


  function renderCurrentSection()
  {
    switch (activeSection) {
      case 'profile':
        return (<ProfileView image={data!.image} login={data!.username} />)
      case 'chat':
        return (<Chat />)
      case 'debug':
        return (<DebugMenu />)
      default:
        return null;
    }
  }

  return (
    (data !== null) ?
    <div className='container'>
      <ProfileSidebar setActiveSection={setActiveSection} />
      <div className='content'>
        {renderCurrentSection()}
      </div>
    </div>

    : <>
      error loading data
    </>
  )

}
