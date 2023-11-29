import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'

import { config } from '../../config'
import { getHeaders } from '../Utils'

import { LoadingState, BackendData, State } from './backend_data'

import './css/ui.css'
import './css/chat.css'

import { Conversation } from './backend_types'

type OptionalType<T> = {
  [K in keyof T]?: T[K]
}

class ConversationData extends BackendData<Conversation|undefined, OptionalType<Conversation>> {

  constructor(...args: ConstructorParameters<typeof BackendData<Conversation|undefined, OptionalType<Conversation>>>) {
    super(...args)
  }

  load() {
    if (this.data)
      this._load({id:this.data?.id})
  }

  _load(params?: OptionalType<Conversation>) {
    if (!params?.id)
      return

    this.loadingState = LoadingState.Loading
    fetch(`${config.backend_url}/api/conversation/${params.id}`, {
      method: 'GET',
      headers:getHeaders()
    })
    .then(res => {
      if(!res.ok) return res.text().then(text => { throw new Error(text) });
      return res.json()
    })
    .then((json:Conversation) => {
      this.state[1](json)
      this.loadingState = LoadingState.Success
    })
    .catch((e: Error) => {
      const json: {message:string, statusCode:number} = JSON.parse(e.message)
      if (json.message === "User not found") {
        this.loadingState = LoadingState.Failure
      } else {
        console.log(json.message)
        this.loadingState = LoadingState.Error
      }
    })
  }
}

class ConversationList extends BackendData<Conversation[], undefined> {
  
  constructor(...args: ConstructorParameters<typeof BackendData<Conversation[], undefined>>) {
    super(...args)
  }

  _load() {
    this.loadingState = LoadingState.Loading

    console.log("loading")

    fetch(`${config.backend_url}/api/conversation`, {
      method: 'GET',
      headers:getHeaders()
    })
    .then(res => {
      if(!res.ok) return res.text().then(text => { throw new Error(text) });
      return res.json()
    })
    .then((json:Conversation[]) => {
      this.state[1](json)
      this.loadingState = LoadingState.Success
    })
    .catch((e: Error) => {
      const json: {message:string, statusCode:number} = JSON.parse(e.message)
      if (json.message === "User not found") {
        this.loadingState = LoadingState.Failure
      } else {
        console.log(json.message)
        this.loadingState = LoadingState.Error
      }
    })
  }
}

function ConversationDisplay(props: {
  conversation:Conversation,
  selected:boolean
}) {

  function deleteConversation() {
    fetch(`http://localhost:3001/api/conversation/${props.conversation.id}`, {
      method: 'DELETE',
      headers: {'Content-Type':'application/json', ...getHeaders()},
    })
      .catch((error) => console.error('Error:', error));
  }

  return (
    <div className={`conv-display ${props.selected ? 'selected' : ''}`}>
      {props.conversation.title}
      <ul className='horizontal-list'>
        {
          props.conversation.users?.map((value, index) => (
            <li key={index}>
              <img src={value.image} className='profile-picture'/>
            </li>
          ))
        }
      </ul>
      <button onClick={deleteConversation}/>
    </div>
  )
}

export function Chat() {
  const [conversationList, setConversationList] = useState<Conversation[]>([])
  const [conversationListLoader] = useState(new ConversationList({state:[conversationList, setConversationList]}))
  
  const [currentConv, setCurrentConv] = useState<Conversation>()
  const [currentConvLoader] = useState(new ConversationData({state:[currentConv, setCurrentConv]}))

  useEffect(() => {
    conversationListLoader.load()
  }, [])

  if (conversationListLoader.loadingState === LoadingState.Loading) {
    return (
      <div className='bg-rect chat-container'>
        <a style={{color:'white'}}>Loading...</a>
      </div>
    )
  }

  return (
    <div className='bg-rect chat-container'>
      {
        conversationListLoader.loadingState === LoadingState.Success ?
        <ul className='conversation-list-container'>
            {
              conversationList?.map((item, index) => (
                <li key={index} onClick={() => {currentConv?.id === item.id ? setCurrentConv(undefined) : setCurrentConv(item)}}>
                  <ConversationDisplay conversation={item} selected={currentConv?.id === item.id} />
                </li>
              ))
            }
        </ul>
        : <a>Can't load chat !</a>
      }
    </div>
  )
}
