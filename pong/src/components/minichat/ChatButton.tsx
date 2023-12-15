// MiniChatButton.js
import { Socket } from 'socket.io-client';
import React, { useEffect, useState } from 'react';
import './ChatButton.css';
import createComponent from '../../THREE/Utils/createComponent';
import MiniChatTest from './MiniChatTest';
import MiniChat from './MiniChat';
import { createRoot } from 'react-dom/client';

const MiniChatButton: React.FC = () => {
  const [isMiniChatVisible, setMiniChatVisibility] = useState<boolean>(false);

  const handleToggleMiniChat = () => {
    setMiniChatVisibility((prevVisibility) => !prevVisibility);
  };
  useEffect(()=>{
    if(isMiniChatVisible){
      const newFormContainer = document.createElement('div');
      const root = createRoot(newFormContainer);
      root.render(<MiniChat width='30%' height='65%' bottom='5%' right='-1px' />);
      document.body.appendChild(newFormContainer);
      return () => {
        setTimeout(() => {
          root.unmount();
          document.body.removeChild(newFormContainer);
        });
      };
    }
  },[isMiniChatVisible])
  
  return (
    <div className={`glass-container-minichat-button ${isMiniChatVisible ? 'position-right' : 'position-left'}`}>
      <img src='42.png' className='minichat-icon' onClick={handleToggleMiniChat} alt="MiniChat Button" />
    </div>
  );
};

export default MiniChatButton;
