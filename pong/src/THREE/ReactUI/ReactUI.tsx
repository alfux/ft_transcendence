import React, { useState, useEffect } from 'react'
import { Animation } from "../Animations";
import { config } from '../../config'

import { Profile } from "./Profile";
import { Chat } from './Chat';

import './ui.css'

//register les hooks de maniere global, penser au cleanup

export function ReactUIParent(props: {
    showProfile:boolean,
    showChat:boolean
}) {

    return (
        <div className='ui'>

            <div style={{width:'33.33%', height:'100%', top:'0', left:'0'}}>
                {props.showProfile ? <Profile/> : null}
            </div>
            
            <div style={{width:'33.33%', height:'100%', top:'0', left:'33.33%'}} className='spacer' />

            <div style={{width:'33.33%', height:'100%', top:'0', left:'66.66%'}}>
                {props.showChat ? <Chat/> : null}
            </div>

            <a style={{margin:'10px',top:'0px',textAlign:'center', color:'white'}}>ft_transcendence</a>

        </div>
    )
}

