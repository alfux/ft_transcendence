// MiniChat.js

import Cookies from 'js-cookie';
import React, { useState, useEffect, useRef, Dispatch, SetStateAction } from 'react';
import jwt, { jwtDecode } from 'jwt-decode';
import { JwtPayload } from '../../THREE/Utils/jwt.interface';
import TwoFactorValidate from '../twofactorvalidate/TwoFactorValidate';
import usePayload from '../../react_hooks/use_auth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import './MiniChat.css';

const MiniChat: React.FC = () => {
  const inputRefs = useRef<Array<HTMLInputElement | null>>(Array(6).fill(null));
  const containerRef = useRef<HTMLDivElement>(null); // Reference to the chat-options container
  const accessToken = Cookies.get('access_token');
  const user = accessToken ? jwtDecode<JwtPayload>(accessToken) : null;
  const [images, setImages]: [string[], Dispatch<SetStateAction<string[]>>] = useState<string[]>([]);

  const addMoreImages = () => {
    setImages((prevImages: string[]) => [...prevImages, `https://picsum.photos/200/300?random=${prevImages.length + 1}`]);
  };

  const handleScroll = () => {
    const container = containerRef.current;
    if (container) {
      const isAtBottom = container.scrollTop + container.clientHeight >= container.scrollHeight;

      if (isAtBottom) {
        addMoreImages();
      }
    }
  };

  const scrollToBottom = () => {
    const container = containerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  };

  useEffect(() => {
    for (let i = 0; i < 50; i++) {
      addMoreImages();
    }
    scrollToBottom();
  }, []);

  return (
    <div className="glass-container-minichat">
      <div className='chat-options' id='chat-friends' onScroll={handleScroll} ref={containerRef}>
        {images.map((image, index) => (
          <img className="chat-img" key={index} src={image} alt={`Image ${index + 1}`} />
        ))}
        <div className="scroll-icon">
          <FontAwesomeIcon icon={faChevronDown} size="2x" />
        </div>
      </div>
      <div className='chat-box'>
        <div className='message-output'></div>
        <div className='message-input'>
          <input className="message-input-text" type="text" placeholder="Message ..."/>
        </div>
      </div>
    </div>
  );
};

export default MiniChat;
