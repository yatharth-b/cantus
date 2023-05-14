import React, { useEffect, useState } from 'react';

const SpotifyPlayer = ({ access_token, setBg } : {access_token : string, setBg : any}) => {
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
        setBg(data.item.album.images[0].url);
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
  }, [access_token]);

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

export default SpotifyPlayer;