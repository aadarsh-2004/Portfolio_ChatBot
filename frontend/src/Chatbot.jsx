import React, { useState, useEffect } from "react";
import axios from "axios";


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Chatbot = () => {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  // Add a welcome message on component mount
  useEffect(() => {
    const welcomeMessage = {
      sender: "bot",
      text: "Hi there! I'm your assistant. How can I help you today?",
    };
    setChat([welcomeMessage]);
  }, []);

  const playAudio = (audioBase64) => {
    const audio = new Audio(`data:audio/mp3;base64,${audioBase64}`);
    audio.play();
  };

  const sendMessage = async () => {
    if (!message.trim()) return;

    const newChat = [...chat, { sender: "user", text: message }];
    setChat(newChat);
    setMessage("");
    setIsTyping(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/ask`, {
        question: message,
      });

      // Add the text response to chat
      setChat([
        ...newChat,
        { sender: "bot", text: response.data.answer },
      ]);

      // If the response includes audio, play it
      if (response.data.audio) {
        playAudio(response.data.audio);
      }
    } catch (error) {
      console.error("Error:", error);
      setChat([
        ...newChat,
        { sender: "bot", text: "Sorry, I couldn't process that. Please try again!" },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleMicClick = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Speech recognition is not supported in this browser. Please use Chrome.");
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setMessage(transcript);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsRecording(false);
    };

    recognition.start();
  };

  return (
    <div className="min-h-screen bg-white flex justify-center items-center relative">
      {/* Speak Now Popup */}
      {isRecording && (
        <div className="absolute top-0 left-0 right-0 bottom-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <h2 className="text-2xl font-bold mb-2">🎤 Speak Now</h2>
            <p className="text-gray-700">Your microphone is on. Say something!</p>
          </div>
        </div>
      )}

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
              className={`mb-4 flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.sender === "bot" && (
                <img
                  src="https://img.freepik.com/free-vector/graident-ai-robot-vectorart_78370-4114.jpg"
                  alt="Bot"
                  className="w-8 h-8 border-blue-800 border-2 rounded-full mr-3"
                />
              )}
              <div
                className={`px-4 py-3 rounded-lg max-w-sm ${
                  msg.sender === "user" 
                    ? "bg-blue-500 text-white slide-right"
                    : "bg-gray-200 text-gray-800 slide-left"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="px-4 py-3 rounded-lg bg-gray-200 text-gray-800 animate-pulse">
                Typing<span className="dot1">.</span>
                <span className="dot2">.</span>
                <span className="dot3">.</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Section */}
        <div className="border-t border-gray-300 p-4 flex items-center space-x-3">
          <img
            onClick={handleMicClick}
            src="https://cdn-icons-png.flaticon.com/512/615/615219.png"
            alt="Mic Icon"
            className="w-8 h-8 cursor-pointer hover:scale-110 rounded-full transition-transform"
          />
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
