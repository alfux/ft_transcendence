import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'

import { config } from '../../config'
import { getHeaders } from '../Utils'

import './ui.css'

export function Profile() {

  const [profile, setProfile] = useState<any>()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      setProfile(undefined)
      return
    }

    fetch(`${config.backend_url}/api/user/me`, {
      headers:getHeaders()
    })
    .then((data) => data.json())
    .then((profile) => {
      setProfile(profile)
    })
    .catch(() => {setProfile(undefined)})

  }, [])

  return (
    <div className='bg-rect profile-container'>
      {
        profile ? 
        <img src={profile.image} className='profile-img'/>
        : <a>Can't load profile !</a>
      }
    </div>
  )
}
