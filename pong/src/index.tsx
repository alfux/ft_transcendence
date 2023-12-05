import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import THREE_App from './THREE/main';
import './index.css'
import { ReactUIParent } from './THREE/ReactUI/ReactUI';

import Chat from "./components/chat/Chat";

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

function App() {

  const [showProfile, setShowProfile] = useState(false)
  const [showChat, setShowChat] = useState(false)

  return (
    <div>
      <THREE_App
        toggleProfile={()=>{setShowProfile((prev)=>!prev)}}
        toggleChat={()=>{setShowChat((prev)=>!prev)}}>
        <ReactUIParent showProfile={showProfile} showChat={showChat}/>
      </THREE_App>
    </div>
  )
}

root.render(
  //<React.StrictMode>
    <App/>
//	<Chat width={window.innerWidth / 2} height={window.innerHeight / 2}/>
  //</React.StrictMode>
);
