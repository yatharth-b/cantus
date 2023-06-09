'use client'
import { useEffect, useState } from 'react'
import './home.css'
import ChatComponent from './ChatComponent/ChatComponent'
import SpotifyPlayer from './SpotifyPlayer/SpotifyPlayer'

const Page = () => {

  const [accessToken, setAccessToken] = useState<string>('');
  const [bg, setBg] = useState<string>('');
  const [width, setWidth] = useState<number>(1920);

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
          refresh_token: refreshToken
        }),
      })
        .then(response => response.json())
        .then(data => {
          if (data.accessToken) {
  
            // Update the access token and login time in local storage
            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('loginTime', new Date().getTime().toString());
            setAccessToken(data.accessToken);
          } else {
            console.error('Failed to refresh the access token.');
          }
        })
        .catch(error => {
          console.error(error);
        });
    } else {
      setAccessToken(localStorage.getItem('accessToken') ?? "");
    }
  };

  useEffect(() => {
    setWidth(window.innerWidth);
    checkTokenExpiration();
  }, [])

  return (
    <div className='home-container'>
      <div className='home-image' style={{ backgroundImage: `url(${bg})` }}></div>
      <div className='home'>
        <div className='header'>
          <h1 className='header_title'>Cantus<span className='gradient-dot'>.</span></h1>

        </div>
        <div className='home-content'>
          <div className='home-content-left'>
            <div className='prompt-window'>
              <ChatComponent access_token={accessToken}></ChatComponent>
            </div>
          </div>
          {width > 800 && <div className='home-content-right'>
            <SpotifyPlayer access_token={accessToken} setBg={setBg}></SpotifyPlayer>
          </div> }
        </div>
      </div>
    </div>
    
  )
}

export default Page;