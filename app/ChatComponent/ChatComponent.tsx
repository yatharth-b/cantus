import React, { useState } from 'react';

const ChatComponent = ({ access_token } : { access_token : string }) => {
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

export default ChatComponent;