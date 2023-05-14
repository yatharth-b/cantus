'use client'
import React, { useEffect } from 'react';

const CallbackPage = () => {
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    console.log(code, state)
    const storedState = localStorage.getItem('state');
    
    fetch('/api/auth', {
      method: 'POST',
      body: JSON.stringify({
        code,
        state
      }),
    }).then((response : any) => {
      console.log(response)
      response.json().then((data : any) => {
        console.log(data)
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('loginTime', new Date().getTime().toString())
        window.location.href = '/'
      });
    })}, []);

  return <div>Authenticating...</div>;
};

export default CallbackPage;