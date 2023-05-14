'use client'
import Image from 'next/image'
import styles from './page.module.css'
import { useEffect, useRef, useState } from 'react'
import './home.css'

const Page = () => {

  const checkTokenExpiration = () => {
    const loginTime = localStorage.getItem('loginTime');
    const refreshToken = localStorage.getItem('refreshToken');
  
    if (!loginTime || !refreshToken) {
      window.location.href = '/login';
      return;
    }
  
    const currentTime = new Date().getTime();
    const expirationTime = parseInt(loginTime) + 3600 * 1000;
  
    if (currentTime >= expirationTime) {
      // Access token has expired, refresh it using the refresh token
      fetch('/api/refresh', {
        method: 'POST',
        body: JSON.stringify({
          refreshToken
        }),
      })
        .then(response => response.json())
        .then(data => {
          if (data.accessToken) {
  
            // Update the access token and login time in local storage
            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('loginTime', new Date().getTime().toString());
          } else {
            console.error('Failed to refresh the access token.');
          }
        })
        .catch(error => {
          console.error(error);
        });
    }
  };

  useEffect(() => {
    checkTokenExpiration();
  }, [])

  return (
    <div className='home'>
      <div className='header'>
        <h1 className='header_title'>Cantus<span className='gradient-dot'>.</span></h1>

      </div>
      <div className='home-content'>
        <div className='home-content-left'>
          <div className='prompt-window'>
            <ChatComponent></ChatComponent>
          </div>
        </div>
        <div className='home-content-right'>
          <SpotifyPlayer access_token={localStorage.getItem('accessToken') ?? ""}></SpotifyPlayer>
        </div> 
      </div>
    </div>
  )
}

const SpotifyPlayer = ({ access_token } : {access_token : string}) => {
  console.log(access_token)
  const [currTrack, setCurrTrack] = useState<any>();

  useEffect(() => {
    const fetchPlaybackState = async () => {
      try {
        const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
          headers: {
            Authorization: `Bearer ${access_token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch playback state');
        }

        const data = await response.json();
        setCurrTrack(data.item);
      } catch (error : any) {
        console.error('Failed to fetch playback state:', error.message);
      }
    };

    // Fetch the playback state initially
    fetchPlaybackState();

    // Set an interval to periodically fetch the playback state
    const interval = setInterval(fetchPlaybackState, 5000); // Fetch every 5 seconds

    // Clean up the interval on component unmount
    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <>
      <h1 className='player-heading'>Playing now:</h1>
      {currTrack ? 
      <div className='spotify-player'>
        <img src={currTrack.album.images[0].url} className='album-cover'></img>
        <div className='track-info'>
          <h1 className='track-name'>{currTrack.name}</h1>
          <h2 className='track-artist'>{currTrack.artists[0].name}</h2>
          <h2 className='track-album'>{currTrack.album.name}</h2>
        </div>
      </div> : <></>}
    </>
    
  );
};

const ChatComponent = () => {
  const [messages, setMessages] = useState<any>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isDisabled, setIsDisabled] = useState(false);

  const handleInputChange = (event : any) => {
    setNewMessage(event.target.value);
  };

  const get_resp = async (user_message: string) => {
    const response = await fetch('/api/exec', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: [{
          role: 'user',
          content: user_message
        }]
      })
    })
    return response.json();
  }

  const replaceConsoleLog = (code : string) => {
    // Use a regular expression with the 'g' flag to replace all occurrences
    return code.replace(/console\.log/g, 'assis');
  }

  function assis(mess : string) {
    console.log(messages)
    setMessages((oldMessages : any) => {
      console.log(oldMessages);
      return [...oldMessages, { role: 'assistant', content: mess }]
    });
  }

  const handleSendMessage = () => {
    if (newMessage.trim() !== '') {

      setMessages([...messages, { role: 'user', content: newMessage }]);
      const tempMessage = newMessage;
      setNewMessage('');
      setIsDisabled(true);
      get_resp(tempMessage).then((data) => {
        let access_token = localStorage.getItem('accessToken');
        data.message = replaceConsoleLog(data.message);
        try {
          eval(data.message)
        } catch (e) {
          console.log(e)
        }
        setIsDisabled(false);
        });
      }
  };

  return (
    <div className='chat-component' onKeyDown={(event : any) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault(); 
        handleSendMessage();
      }
    }}>
      <div className='messages-container'>
        <div className="chat-messages">
          {messages.map((message : any, index : number) => (
            <div key={index} className={`message ${message.role}`}>
              {message.content}
            </div>
          ))}
        </div>
      </div>
      <div className="input-field">
        <textarea
          placeholder="Type your message..."
          value={newMessage}
          onChange={handleInputChange}
          className='chat-input'
          disabled={isDisabled}
        />
        <img src='/send.svg' className='send-icon' onClick={() => {
          handleSendMessage();
        }}></img>
      </div>
    </div>
  );
};

export default Page;