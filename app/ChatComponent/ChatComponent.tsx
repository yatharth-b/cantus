import React, { useState } from 'react';

const ChatComponent = ({ access_token } : { access_token : string }) => {
  const [messages, setMessages] = useState<any>([]);
  const [serverMessages, setServerMessages] = useState<any>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isDisabled, setIsDisabled] = useState(false);
  const [error, setError] = useState<any>();
  const [worked, setWorked] = useState(true);

  const handleInputChange = (event : any) => {
    setNewMessage(event.target.value);
  };

  const get_resp = async (user_message: string, serverMessagesTemp : any) => {
    console.log(serverMessages)
    const response = await fetch('/api/exec', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages : serverMessagesTemp,
      })
    })
    return response.json();
  }

  const replaceConsoleLog = (code : string) => {
    // Use a regular expression with the 'g' flag to replace all occurrences
    return code.replace(/console\.log/g, 'assis');
  }

  function assis(mess : string) {
    setMessages((oldMessages : any) => {
      return [...oldMessages, { role: 'assistant', content: mess }]
    });
  }

  const handleSendMessage = () => {
    if (newMessage.trim() !== '') {

      setMessages([...messages, { role: 'user', content: newMessage }]);
      const newServerMessages = [...serverMessages, { role: 'user', content: `${worked ? "That worked! Keep sending js code and js code only." : `Following error occurred with the code you provided:${error}`} ${newMessage}`}]
      setServerMessages(newServerMessages)
      const tempMessage = newMessage;
      setNewMessage('');
      setIsDisabled(true);
      get_resp(tempMessage, newServerMessages).then((data) => {
        setServerMessages((oldServerMessages : any) => {
          return [...oldServerMessages, {
            role: 'assistant',
            content: data.message
          }]
        });
        data.message = replaceConsoleLog(data.message);
        try {
          eval(data.message)
          setWorked(true);
        } catch (e) {
          console.log(e)
          setMessages((oldMessages : any) => {
            return [...oldMessages, { role: 'assistant', content: "An error occured, please try another request." }]
          });
          setWorked(false);
          setError(e);
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
      <div className='input-container'>
        <div className="input-field">
          <textarea
            placeholder={isDisabled ? "Brewing immaculate vibes" : "Type your request (make sure you're playing something on Spotify)..."}
            value={newMessage}
            onChange={handleInputChange}
            className='chat-input'
            disabled={isDisabled}
          />
          <img src='/send.svg' className='send-icon' onClick={() => {
            handleSendMessage();
          }}></img>
          
        </div>
        {isDisabled && <div className="pig-container">
          <p className="pig-svg">🐷</p>
        </div>}
        
      </div>
      
    </div>
  );
};

export default ChatComponent;