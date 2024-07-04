import React, { useState, useEffect } from 'react';
import './Chat.css'; // Import your CSS file for styling
import { FaSun, FaMoon, FaPaperPlane } from 'react-icons/fa'; // Import icons

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [darkMode, setDarkMode] = useState(false); // Dark mode as default
  const suggestedQuestions = [
    'Who is Lionel Messi?',
    'Top scorers in 2023.',
    'who has the most assists in 2023',
    'Who plays for Manchester City?',
    'best player',
    'How many goals did Robert Lewandowski score?',
    'how many matches were played by Bruno Fernandes',
    // Add more suggested questions as needed
  ];

  useEffect(() => {
    document.body.className = darkMode ? 'dark-mode' : 'light-mode';
  }, [darkMode]);

  // Simulate typing indicator effect
  useEffect(() => {
    if (isTyping) {
      const typingTimeout = setTimeout(() => {
        setIsTyping(false);
      }, 1000); // Show typing indicator for 1 second
      return () => clearTimeout(typingTimeout);
    }
  }, [isTyping]);

  const handleSend = async () => {
    if (input.trim()) {
      // Add user's message to chat window
      const userMessage = { text: input, sender: 'user' };
      setMessages((prevMessages) => [...prevMessages, userMessage]);
      setInput(''); // Clear input field
      setIsTyping(true); // Show typing indicator

      try {
        // Send user's question to backend and get bot's answer
        const response = await fetch('http://192.168.0.169:3001/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ question: input }),
        });

        if (!response.ok) {
          const errorMessage = await response.text();
          throw new Error(`Network response was not ok: ${errorMessage}`);
        }

        const data = await response.json();
        const botMessage = { text: data.answer, sender: 'bot' };
        setMessages((prevMessages) => [...prevMessages, botMessage]); // Adding bot's response
      } catch (error) {
        console.error('Error sending message:', error.message);
      }
    }
  };

  const handleSuggestedQuestionClick = (question) => {
    setInput(question); // Set input field value to the clicked suggested question
  };

  return (
    <div className="chat-container">
      <h1 className="heading">S⚽CCER GPT</h1>
      <div className="suggested-questions">
        {suggestedQuestions.map((question, index) => (
          <div key={index} className="suggested-question" onClick={() => handleSuggestedQuestionClick(question)}>
            {question}
          </div>
        ))}
      </div>
      <div className="settings-container">
        <button 
          className="dark-mode-toggle"
          onClick={() => setDarkMode((prevMode) => !prevMode)}
        >
          {darkMode ? <FaMoon /> : <FaSun />}
        </button>
      </div>
      <div className="chat-window">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}`}>
            <div className="message-content">
              <span>{msg.text}</span>
            </div>
          </div>
        ))}
        {isTyping && <div className="typing-indicator"><span></span><span></span><span></span></div>}
      </div>
      <div className="input-container">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type your message..."
          className="input-field"
        />
        <button onClick={handleSend} className="send-button"><FaPaperPlane /></button>
      </div>
    </div>
  );
};

export default Chat;
