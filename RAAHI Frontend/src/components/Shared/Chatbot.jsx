import React, { useState } from 'react';

const Chatbot = () => {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      text: "Hi there! How can I help you today? I can tell you about our features, safety tips, or famous destinations in India.",
      sender: 'bot'
    }
  ]);
  const [userInput, setUserInput] = useState('');

  // Mock responses for different types of questions
  const mockResponses = {
    safety: [
      "Safety is our top priority! The RAAHI system provides real-time safety alerts, emergency contacts, and risk zone mapping to keep tourists safe.",
      "Here are some safety tips: Always register your travel plans, keep emergency contacts handy, and stay updated with local alerts through our system.",
      "Our panic button feature instantly connects you to local authorities and emergency services. Your location is automatically shared for quick response."
    ],
    features: [
      "RAAHI offers Digital Tourist ID, real-time safety alerts, emergency help, risk zone mapping, and 24/7 support for all tourists.",
      "Key features include: Panic button for emergencies, live risk zone updates, tourist registration system, and direct contact with local authorities.",
      "Our system integrates with police, tourism departments, and emergency services to provide comprehensive tourist safety coverage."
    ],
    destinations: [
      "India has amazing destinations! Popular safe tourist spots include Goa beaches, Kerala backwaters, Rajasthan palaces, and hill stations like Shimla and Darjeeling.",
      "Some must-visit places: Taj Mahal in Agra, Golden Temple in Amritsar, backwaters of Kerala, and the beaches of Goa. Always check safety alerts before traveling!",
      "For adventure tourism, consider Rishikesh for river rafting, Manali for mountain activities, and Andaman islands for water sports. Safety first!"
    ],
    help: [
      "I can help you with information about tourist safety, RAAHI system features, emergency procedures, and popular destinations in India.",
      "Need assistance? I can explain how to use the panic button, register as a tourist, or understand safety alerts. What would you like to know?",
      "For technical support with the app, registration issues, or emergency procedures, I'm here to help! Ask me anything about tourist safety."
    ],
    default: [
      "I'm here to help with tourist safety and travel information in India. Could you ask me about safety features, destinations, or how to use RAAHI?",
      "As your travel assistant Rahi, I specialize in tourist safety, system features, and Indian destinations. How can I assist you with your travel needs?",
      "I'd be happy to help! I can provide information about safety tips, emergency procedures, tourist destinations, or RAAHI system features."
    ]
  };

  const getResponseCategory = (message) => {
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('safety') || lowerMessage.includes('safe') || lowerMessage.includes('danger') || lowerMessage.includes('emergency') || lowerMessage.includes('panic')) {
      return 'safety';
    }
    if (lowerMessage.includes('feature') || lowerMessage.includes('app') || lowerMessage.includes('system') || lowerMessage.includes('raahi') || lowerMessage.includes('how')) {
      return 'features';
    }
    if (lowerMessage.includes('destination') || lowerMessage.includes('place') || lowerMessage.includes('visit') || lowerMessage.includes('travel') || lowerMessage.includes('tourist')) {
      return 'destinations';
    }
    if (lowerMessage.includes('help') || lowerMessage.includes('support') || lowerMessage.includes('assist')) {
      return 'help';
    }
    return 'default';
  };

  const toggleChatbot = () => {
    setIsChatbotOpen(!isChatbotOpen);
  };

  const handleSend = async () => {
    if (userInput.trim() === '') return;

    const newUserMessage = { text: userInput.trim(), sender: 'user' };
    setMessages(prevMessages => [...prevMessages, newUserMessage]);
    setUserInput('');

    // Add typing indicator
    const typingIndicator = { text: '...', sender: 'bot', isTyping: true };
    setMessages(prevMessages => [...prevMessages, typingIndicator]);

    // Simulate API delay
    setTimeout(() => {
      const category = getResponseCategory(newUserMessage.text);
      const responses = mockResponses[category];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      setMessages(prevMessages => 
        prevMessages.filter(msg => !msg.isTyping).concat({ text: randomResponse, sender: 'bot' })
      );
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <>
      <button id="chatbot-toggler" className="chatbot-toggler" onClick={toggleChatbot}>
        <span className="material-symbols-rounded">smart_toy</span>
      </button>
      <div id="chatbot-popup" className={`chatbot-popup ${isChatbotOpen ? 'show' : ''}`}>
        <header className="chat-header">
          <h3 className="header-text">Rahi</h3>
          <button id="close-btn" className="close-btn" onClick={toggleChatbot}>
            <span className="material-symbols-rounded">close</span>
          </button>
        </header>
        <div className="chat-body" id="chat-body">
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.sender}`}>
              {msg.isTyping ? '...' : msg.text}
            </div>
          ))}
        </div>
        <footer className="chat-footer">
          <input 
            type="text" 
            id="user-input" 
            placeholder="Type a message..." 
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button id="send-btn" onClick={handleSend}>
            <span className="material-symbols-rounded">send</span>
          </button>
        </footer>
      </div>
    </>
  );
};

export default Chatbot;