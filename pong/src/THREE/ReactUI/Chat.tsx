import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'

import { config } from '../../config'
import { getHeaders } from '../Utils'

import './ui.css'

export function Chat() {
  const [chat, setChat] = useState<any>()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      setChat(undefined)
      return
    }
  }, [])

  return (
    <div className='bg-rect chat-container'>
      {
        chat ? 
        <img src={chat.image} className='chat-img'/>
        : <a>Can't load chat !</a>
      }
    </div>
  )
}
