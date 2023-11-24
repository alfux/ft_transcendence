import React, { useEffect, useState, ChangeEvent, KeyboardEvent } from 'react'
import { getHeaders } from '../Auth/AuthComponent';
import { User, Message, Conversation } from '../types'
import { chat_socket } from './Socket';

import './Chat.css'

function CreateConversation(props : {
  updateConversation:(value:Conversation) => void
}) {
  const [title, setTitle] = useState("")

  function handleSubmit() {
    fetch('http://localhost:3001/api/conversation/', {
      method: 'POST',
      headers: {'Content-Type':'application/json', ...getHeaders()},
      body: JSON.stringify({
        "title": title
      }),
    })
      .then((response) => {
        if (response.status >= 200 && response.status < 300)
          return response.json()
        else
          throw new Error(`${response.status}`);
      })
      .then((data) => {
        props.updateConversation(data)
      })
      .catch((error) => console.error('Error:', error));
  }

  return (
    <>
      Create conversation:
      <div>  
        <label>
          Title:
          <input type="text" value={title} onChange={(e) => {setTitle(e.target.value)}} />
        </label>
        <button onClick={handleSubmit}>send</button>
      </div>
    </>
  )
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
    <div className={`conversation-display ${props.selected ? 'selected' : ''}`}>
      {props.conversation.title}
      <ul className='horizontal-list'>
        {props.conversation.users.map((value, index) => (
          <li key={index}>
            <img src={value.image} className='profile-picture'/>
          </li>
        ))}
      </ul>
      <button onClick={deleteConversation}/>
    </div>
  )
}


function ChatBox(props: {
  conversation: Conversation
}) {

  const [inputValue, setInputValue] = useState('')
  const [messages, setMessages] = useState<Message[]>([])

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      console.log("Sending: ", inputValue)
      chat_socket.emit('send_message', {message:inputValue, conversation_id:props.conversation.id})
      setInputValue('');
    }
  };

  function message_received(event: {username:string, conversation_id:number, message:string}) {
    const new_message:Message = {content:event.message, sender:event.username, conversation_id:event.conversation_id}
    setMessages(prevMessages => [...prevMessages, new_message]);
  }

  useEffect(() => {

    chat_socket.on('receive_message', message_received)

    fetch(`http://localhost:3001/api/conversation/${props.conversation.id}`, {
      method: 'GET',
      headers: getHeaders()
    })
      .then((response) => {
        if (response.status >= 200 && response.status < 300)
          return response.json()
        else
          throw new Error(`${response.status}`);
      })
      .then((data) => {
        setMessages(data.messages.map((msg:{id:number, content:string, image:string, conversation:any, sender:{username:string}}) => {
          return {
            content:msg.content,
            conversation_id:data.id,
            sender:msg.sender.username
          }
        }))
      })
      .catch((error) => console.error('Error:', error));

      return () => {
        chat_socket.off('receive_message')
      }

  }, [props])

  return (
    <>
      <ul>
        {messages?.map((item, index) => (
          <li key={index}>
            {`${item.sender} : ${item.content}`}
          </li>
        ))}
      </ul>
      <input type='text' value={inputValue} onChange={handleInputChange} onKeyDown={handleKeyDown} />
    </>
  )
}


export function Chat() {
  const headers = getHeaders()

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation|null>()

  useEffect(() => {
    fetch('http://localhost:3001/api/conversation/me', {
      method: 'GET',
      headers: headers
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data)
        setConversations(data)
      })
      .catch((error) => console.error('Error:', error));  
  }, [])

  return (
    <div className="chatbox-container">

      <div className='chatbox-container-left'>
        <CreateConversation updateConversation={(x) => {setConversations([x, ...conversations])}} />
        <div className='conversation-list-container'>
          <ul className='basic-list'>
            {conversations?.map((item, index) => (
              <li key={index} style={{margin:'5px', width:'200px'}} onClick={() => {selectedConversation === item ? setSelectedConversation(null) : setSelectedConversation(item)}}>
                <ConversationDisplay conversation={item} selected={selectedConversation === item} />
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className='chatbox-display'>
        {selectedConversation ? 
          <ChatBox conversation={selectedConversation}/> : <></>
        }
      </div>

    </div>
  )

}