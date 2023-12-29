import './About.css'
import Cookies from 'js-cookie';
import React, { useEffect, useState } from 'react'
import userEvent from '@testing-library/user-event';
import usePayload from '../../react_hooks/use_auth'
import { config } from '../../config';
import ReactAudioPlayer from 'react-audio-player';
import { User, Match } from '../../THREE/Utils/backend_types';


const About: React.FC = () => {
  const [payload, updatePayload, handleUpdate] = usePayload();

  const [data, setData] = useState<User | null>(null)
  const [matches, setMatches] = useState<Match[] | null>(null)
  const	[display, setDisplay] = useState<boolean>(false);

  const [isEditingUsername, setIsEditingUsername] = useState(false)
  const [editUsernameValue, setEditUsernameValue] = useState('')
  useEffect(() => {
    const requestProfile = async () => {
      try {//fetch Profile
        const response = await fetch(`${config.backend_url}/api/user/me`, {
          method: 'GET',
          credentials: 'include',
        });

        if (response.ok) {
          const result = await response.json()
          setData(result)
        } else {
          console.error('Could not get profile:', response.status);
        }
      } catch (error) {
        console.error('Error fetching profile Token:', error);
      }
    };

    const requestMatchHist = async () => {
      try {//fetch Matches
        const response = await fetch(`${config.backend_url}/api/user/matches`, {
          method: 'GET',
          credentials: 'include',
        });

        if (response.ok) {
          const result = await response.json()
          setMatches(result)
        } else {
          console.error('Could not get matches:', response.status);
        }
      } catch (error) {
        console.error('Error fetching profile Token:', error);
      }
    };

    requestProfile();
    requestMatchHist();
  }, [])

  function changePfP(event: any) {
    if (!data)
      return

    const file = event.target.files[0]
    const reader = new FileReader();

    const sendFile = async (image_b64: string) => {
      try {
        const response = await fetch(`${config.backend_url}/api/user/me`, {
          method: 'PATCH',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            image: `data:image/png;base64,${image_b64}`
          }),
        });

        if (response.ok) {
          const result = await response.json()
          setData(result)
        } else {
          console.error('Failed to upload file.');
        }
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    }

    reader.onload = () => {
      const res = reader.result as string
      const base64String = res.split(',')[1]
      sendFile(base64String)
    };

    reader.readAsDataURL(file);

  }

  function handleKeyDown(e: any) {
    if (e.key === 'Enter') {
      setIsEditingUsername(false)
      const sendUsername = async () => {
        try {
          const response = await fetch(`${config.backend_url}/api/user/me`, {
            method: 'PATCH',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              username: editUsernameValue
            }),
          });
  
          if (response.ok) {
            const result = await response.json()
            setData(result)
          } else {
            console.error('Failed to update username.');
          }
        } catch (error) {
          console.error('Error uploading username:', error);
        }
      }
      sendUsername()
    }
  }

  function changeNick(e: any) {
    if (!data)
      return

    //No sql injec
    if (!(/^[a-zA-Z0-9]*$/.test(e.target.value))) {
      return
    }

    setEditUsernameValue(e.target.value)
  }

  return (
    <div>
        <div className="about-box">
            <div className='about-box-two'>
                    <h1>ft_transcendence</h1>
                    <span>
                    We are thrilled to introduce our final project, the culmination of our tronc commun journey at 42. Dive into the world of classic gaming as we bring you a modern twist to the legendary video game Pong.
                    
                    Project Name: FT_TRANSCENDENCE
                    Objective: Reimagining Pong for the web, combining both frontend and backend development.
                    Technologies Used: ????.
                    
                    Frontend Experience:
                    
                    Our frontend design prioritizes a seamless user experience. Whether you're on your desktop, tablet, or smartphone, the responsive design ensures an immersive gameplay experience. The interface is intuitive, marrying functionality with a visually appealing design.
                    
                    Backend Architecture:
                    Powered by Nest.js, our backend boasts a robust and scalable architecture. It facilitates real-time communication, enabling a synchronous multiplayer experience. We've designed it to handle the intricacies of multiplayer interactions, ensuring low-latency and high-performance gameplay.

                    Key Features:

                    Real-time Multiplayer: Engage in thrilling multiplayer battles with friends.
                    Responsive Design: Enjoy Pong seamlessly across various devices.
                    Scalable Backend: Our backend ensures smooth gameplay across multiple instances.

                    Challenges & Solutions:
                    Our journey wasn't without challenges. Synchronizing game states and optimizing performance for real-time gameplay posed hurdles. However, through efficient algorithms, WebSocket technology, and rigorous testing, we overcame these challenges, delivering a polished product.

                    Conclusion:
                    FT_TRANSCENDENCE represents not just a project but a testament to our growth and expertise gained during the tronc commun. We invite you to experience the nostalgia of Pong in a modern web environment. Thank you for being part of our journey.

                    Let the FT_TRANSCENDENCE adventure begin! 🚀
                    </span>
            </div>
        </div>
        <div className="about-box-devs">
            <div className='about-box-two-devs'>
                <h1>Developers</h1>
                <img src="https://cdn.intra.42.fr/users/0b703617db894934054b5e1eca7c7eda/afuchs.jpg" alt="Alexis"></img>
                <h2>Alexis</h2>
                <img src="https://cdn.intra.42.fr/users/a5e81b42b8d91e63773eb39dcf618ef6/dpaulino.jpg" alt="Duarte"></img>
                <h2>Duarte</h2>
                <img src="https://cdn.intra.42.fr/users/137e6361715edb331aa855c8bf8042e8/reclaire.jpg" alt="Remi"></img>
                <h2>Remi</h2>
                <img src="https://cdn.intra.42.fr/users/751a2fcb2c330725887e9fe258a72bee/carlda-s.jpg" alt="Carlos"></img>
                <h2>Carlos</h2>
            </div>
        </div>
    </div>
  );
};

export default About;
