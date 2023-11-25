import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import THREE_App from './THREE/main';
import './index.css'

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
	  <THREE_App/>
  </React.StrictMode>
);
