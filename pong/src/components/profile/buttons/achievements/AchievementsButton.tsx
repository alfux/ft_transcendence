import React, { useRef, useEffect, useState } from 'react'
import './AchievementsButton.css'


const AchievementsButton: React.FC = () => {
  
  return (
    <div >
        <button className='glowing-btn'><span className='glowing-txt'>Achiv<span className='faulty-letter'>emnts</span></span></button>
    </div>
  );
};

export default AchievementsButton;
