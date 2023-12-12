// MiniChatButton.js
import { Socket } from 'socket.io-client';
import React, { useEffect, useState } from 'react';
import MiniChat from './MiniChat';
import './ChatButton.css';
import createComponent from '../../THREE/Utils/createComponent';

const MiniChatButton: React.FC = () => {
  const [isMiniChatVisible, setMiniChatVisibility] = useState<boolean>(false);

  const handleToggleMiniChat = () => {
    setMiniChatVisibility((prevVisibility) => !prevVisibility);
  };
  useEffect(()=>{
    if(isMiniChatVisible){
      return createComponent(MiniChat)
    }
  },[isMiniChatVisible])
  
  return (
    <div className={`glass-container-minichat-button ${isMiniChatVisible ? 'position-right' : 'position-left'}`}>
      <img src='42.png' className='minichat-icon' onClick={handleToggleMiniChat} alt="MiniChat Button" />
    </div>
  );
};

export default MiniChatButton;
