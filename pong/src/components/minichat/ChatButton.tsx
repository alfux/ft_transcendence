// MiniChatButton.js
import { Socket } from 'socket.io-client';
import React, { useEffect, useState } from 'react';
import './ChatButton.css';
import MiniChat from './MiniChat';
import { createRoot } from 'react-dom/client';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMessage } from '@fortawesome/free-solid-svg-icons';
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
    <div className={isMiniChatVisible?"glass-container-minichat-button-on":"glass-container-minichat-button-off"}>
<FontAwesomeIcon className='chat-icon' onClick={handleToggleMiniChat} icon={faMessage} flip="horizontal" />
    </div>
  );
};

export default MiniChatButton;
