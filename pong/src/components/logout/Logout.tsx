import './Logout.css'
import Cookies from 'js-cookie';
import React, { useRef, useEffect, useState } from 'react'
import usePayload from '../../react_hooks/use_auth'


const accessToken = Cookies.get('accessToken')



const Logout: React.FC = () => {
	const [twoFactor, setTwoFactor] = useState(false)
	const [logged, setLogged] = useState(false)
  const [payload, updatePayload, handleUpdate] = usePayload();
    // const fetchData = async () => {
    //     try {
    //         const authEndpoint = `${config.backend_url}/api/auth/logout`;
    //         handleUpdate();
	// 		window.location.href = authEndpoint;
	// 	}
    //     catch (error) {
	// 		console.error('Error fetching data:', error);
    //     }
    // }
  return (
    <div className='circle'>
        <div className="glass-container-logout">
            <div className="fortytwologo"></div>
        </div>
    </div>
  );
};

export default Logout;
