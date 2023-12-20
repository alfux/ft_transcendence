import './Logout.css'
import React from 'react'
import usePayload from '../../react_hooks/use_auth'

const Logout: React.FC = () => {
  const [payload, updatePayload, handleUpdate] = usePayload();
  return (
    <div className='circle'>
      <div className="glass-container-logout">
        <div className="fortytwologo"></div>
      </div>
    </div>
  );
};

export default Logout;
