import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Chatbot = () => {
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  // Add a welcome message on component mount
  useEffect(() => {
    const welcomeMessage = {
      sender: 'bot',
      text: "Hi there! I'm your assistant. How can I help you today?",
    };
    setChat([welcomeMessage]);

    // Optionally play audio for welcome message
    // playAudio(welcomeMessage.text); // Uncomment if you want to play audio for the welcome message
  }, []);

  const playAudio = (audioBase64) => {
    const audio = new Audio(`data:audio/mp3;base64,${audioBase64}`);
    audio.play();
  };

  const sendMessage = async () => {
    if (!message.trim()) return;

    const newChat = [...chat, { sender: 'user', text: message }];
    setChat(newChat);
    setMessage('');
    setIsTyping(true);

    try {
      const response = await axios.post('http://localhost:5000/ask', { question: message });

      // Add the text response to chat
      setChat([
        ...newChat,
        { sender: 'bot', text: response.data.answer },
      ]);

      // If the response includes audio, play it
      if (response.data.audio) {
        playAudio(response.data.audio);
      }

    } catch (error) {
      console.error('Error:', error);
      setChat([
        ...newChat,
        { sender: 'bot', text: "Sorry, I couldn't process that. Please try again!" },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center">
      <div className="w-full max-w-3xl bg-white shadow-lg rounded-2xl overflow-hidden">
        {/* Chat Header */}
        <div className="bg-blue-500 text-white py-4 px-6 flex items-center justify-between">
          <div className="flex items-center">
            <img
              src="https://img.freepik.com/free-vector/graident-ai-robot-vectorart_78370-4114.jpg"
              alt="Bot"
              className="w-10 h-10 rounded-full"
            />
            <h1 className="ml-3 text-xl font-bold">AI Assistant</h1>
          </div>
          <span className="text-sm">Powered by AI</span>
        </div>

        {/* Chat Messages */}
        <div className="p-6 h-96 overflow-y-auto">
          {chat.map((msg, idx) => (
            <div
              key={idx}
              className={`mb-4 flex ${
                msg.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.sender === 'bot' && (
                <img
                  src="https://img.freepik.com/free-vector/graident-ai-robot-vectorart_78370-4114.jpg"
                  alt="Bot"
                  className="w-8 h-8 border-blue-800 border-2 rounded-full mr-3"
                />
              )}
              <div
                className={`px-4 py-3 rounded-lg max-w-sm ${
                  msg.sender === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-800'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="px-4 py-3 rounded-lg bg-gray-200 text-gray-800 animate-pulse">
                Typing<span className="dot1">.</span><span className="dot2">.</span><span className="dot3">.</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Section */}
        <div className="border-t border-gray-300 p-4 flex items-center">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown} // Send message on Enter
            placeholder="Type your message..."
            className="flex-grow bg-gray-200 text-gray-800 px-4 py-2 rounded-lg focus:outline-none"
          />
          <button
            onClick={sendMessage}
            className="ml-3 bg-blue-500 text-white px-7 py-2 rounded-lg hover:scale-105"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
