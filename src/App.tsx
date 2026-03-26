import React, { useState } from 'react';
import './App.css';
import LandingPage from './components/LandingPage';
import NutriThriveChatbot from './components/NutriThriveChatbot';

function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'chatbot'>('landing');

  const handleNavigateToChatbot = () => {
    setCurrentView('chatbot');
  };

  const handleBackToHome = () => {
    setCurrentView('landing');
  };

  return (
    <div className="App">
      {currentView === 'landing' ? (
        <LandingPage onGetStarted={handleNavigateToChatbot} />
      ) : (
        <NutriThriveChatbot onBackToHome={handleBackToHome} />
      )}
    </div>
  );
}

export default App;