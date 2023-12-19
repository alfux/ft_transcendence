import React, { useRef, useEffect, useState } from 'react'
import './AchievementsButton.css'


const AchievementsButton: React.FC = () => {

  return (
    <div style={{width:'90%'}}> {/* hacky patch to make sure enough place for text */}
      <button className='glowing-btn'>
        <span className='glowing-txt'>Achiev
          <span className='faulty-letter'>ements</span>
        </span>
      </button>
    </div>
  );
};

export default AchievementsButton;
