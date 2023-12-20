import React, { useRef, useEffect, useState } from 'react'
import './MatchHistoryButton.css'
import { Match } from '../../../../../THREE/Utils/backend_types';


function MatchHistory(props: {
  matches: Match[]
}) {
  return (
    <div style={{ width: '90%' }}> {/* hacky patch to make sure enough place for text */}
      <button className='glowing-btn2'>
        <span className='glowing-txt2'>Match
          <span className='faulty-letter2'> History</span>
        </span>
      </button>
    </div>
  );

}

export default MatchHistory;