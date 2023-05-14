'use client';
import './login.css';
import Client from '../Client/Client'
import Image from 'next/image';

export default function login() {
  
  const clientId = '49fc19d81cdb43dca2e0b0b2f0ee1a0d';
  const redirectUri = 'https://cantus.fly.dev/callback'; // Replace with your actual redirect URI
  const scopes = [
    'ugc-image-upload',
    'user-read-recently-played',
    'user-top-read',
    'user-read-playback-position',
    'user-read-playback-state',
    'user-modify-playback-state',
    'user-read-currently-playing',
    'app-remote-control',
    'streaming',
    'playlist-modify-public',
    'playlist-modify-private',
    'playlist-read-private',
    'playlist-read-collaborative',
    'user-follow-modify',
    'user-follow-read',
    'user-library-modify',
    'user-library-read',
    'user-read-email',
    'user-read-private'
  ]; // Add more scopes as needed

  const SpotifyButton = () => {
    
    const handleLogin = () => {
      var text = '';
      var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

      for (var i = 0; i < 16; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
      }

      localStorage.setItem('state', text);

      const url = `https://accounts.spotify.com/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes.join(' '))}&response_type=code&show_dialog=true&state=${text}`;
      window.location.href = url;
    };

    return (
      <Client>
        <div className='login-button' onClick={() => {
          handleLogin();
        }}>
          <img src='/spotify.png' className='spotify-logo'></img>
          <p className='login-prompt'>Talk to your music</p>
        </div>
      </Client>
    );
  };


  return (
    <div className='login_page'>
      <div className="hero_title">
        <h1>Cantus<span className='gradient-dot'>.</span></h1>
      </div>
      <SpotifyButton></SpotifyButton>
    </div>
  )
}