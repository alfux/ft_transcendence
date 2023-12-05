import React, { useState, useEffect } from 'react'
import { Animation } from "../Animations";
import { config } from '../../config'

import { Profile } from "./Profile";
import { Chat } from './Chat';

import './css/ui.css'
import { Socket, io } from 'socket.io-client'

//register les hooks de maniere global, penser au cleanup

export function ReactUIParent(props: {
    showProfile:boolean,
    showChat:boolean
}) {

    const [socket, setSocket] = useState<Socket>()


    function update_auth() { socket?.emit("authentification", localStorage.getItem("token")) }
    useEffect(() => {
        const socket = io(`${config.backend_url}/notifications`, {transports: ["websocket"]})
        
        const token = localStorage.getItem("token")
        if (token) {
            socket.emit("authentification", token)
        }
        window.addEventListener('storage', update_auth);
        setSocket(socket);

        return (() => {
            window.removeEventListener('storage', update_auth)
        })
    }, [])

    return (
        <div className='ui'>

            <div style={{width:'33.33%', height:'100%', top:'0', left:'0'}}>
                {props.showProfile ? <Profile socket={socket}/> : null}
            </div>
            
            <div style={{width:'33.33%', height:'100%', top:'0', left:'33.33%'}} className='spacer' />

            <div style={{width:'33.33%', height:'100%', top:'0', left:'66.66%'}}>
                {props.showChat ? <Chat/> : null}
            </div>

            <a style={{margin:'10px',top:'0px',textAlign:'center', color:'white', height:'auto'}}>ft_transcendence</a>

        </div>
    )
}

