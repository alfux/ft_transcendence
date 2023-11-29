import './Profile.css'
import Cookies from 'js-cookie';
import React, { useRef, useEffect, useState } from 'react'

// useEffect(() =>{
    
// })

const accessToken = Cookies.get('accessToken')

const Profile: React.FC = () => {
    console.log('profillas')
  return (
    <div className="glass-container-profile">
        <h2>Profile</h2>
    </div>
  );
};

export default Profile;
