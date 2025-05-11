// src/components/FloatingVoiceButton.tsx
import React, { useState, useEffect } from 'react';
import { useVoiceChat } from '../hooks/useVoiceChat';
import axios from 'axios';

const chatUrl = import.meta.env.VITE_CHAT_URL;

const FloatingVoiceButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [conversation, setConversation] = useState<Array<{text: string, isUser: boolean}>>([]);
  const [errorToast, setErrorToast] = useState<string | null>(null);
  
  // Handle transcription
  const handleTranscription = async (text: string) => {
    try {
      // Add user message to conversation
      setConversation(prev => [...prev, { text, isUser: true }]);
      
      // Get recent message history for context (last 5 messages)
      const recentMessages = conversation.slice(-5).map(msg => ({
        role: msg.isUser ? 'user' : 'assistant',
        content: msg.text
      }));
      
      // Send to AI service
      const response = await axios.post(chatUrl, {
        message: text,
        history: recentMessages
      }, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true
      });
      
      const aiResponse = response.data.response;
      
      // Return response for speech synthesis
      return aiResponse;
    } catch (error) {
      console.error('Error sending transcribed message:', error);
      setErrorToast('Failed to get AI response. Please try again.');
      return '';
    }
  };
  
  // Handle AI response
  const handleAiResponse = (text: string) => {
    setConversation(prev => [...prev, { text, isUser: false }]);
  };
  
  // Initialize voice chat
  const {
    isRecording,
    isProcessing,
    error,
    lastRecordingTime,
    toggleRecording
  } = useVoiceChat({
    onTranscription: handleTranscription,
    onAiResponse: handleAiResponse
  });
  
  // Toggle panel
  const togglePanel = () => {
    if (!isProcessing) {
      setIsOpen(prev => !prev);
    }
  };
  
  // Handle errors
  useEffect(() => {
    if (error) {
      setErrorToast(error);
      
      const timer = setTimeout(() => {
        setErrorToast(null);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [error]);
  
  // Button color based on state
  const buttonColor = isRecording 
    ? 'bg-red-600' 
    : isProcessing 
      ? 'bg-yellow-500'
      : 'bg-indigo-600';
  
  // Animation class
  const animationClass = (isRecording || isProcessing) ? 'animate-pulse' : '';
  
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Error Toast */}
      {errorToast && (
        <div className="mb-4 p-2 bg-red-100 dark:bg-red-900/60 text-red-800 dark:text-red-200 text-sm rounded-md shadow-md max-w-xs">
          {errorToast}
        </div>
      )}
      
      {/* Conversation Panel */}
      {isOpen && (
        <div className="mb-4 w-80 bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden">
          <div className="bg-indigo-600 dark:bg-indigo-700 p-3 text-white">
            <h3 className="text-lg font-medium">Gebral Voice Assistant</h3>
            {lastRecordingTime && (
              <p className="text-xs text-indigo-200">
                Last interaction: {lastRecordingTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </p>
            )}
          </div>
          
          <div className="p-4 max-h-96 overflow-y-auto">
            {conversation.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                Press the mic button and start talking
              </p>
            ) : (
              <div className="space-y-3">
                {conversation.map((msg, index) => (
                  <div 
                    key={index} 
                    className={`p-3 rounded-lg text-sm ${
                      msg.isUser 
                        ? 'bg-indigo-600 text-white ml-auto max-w-[80%]' 
                        : 'bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-white max-w-[80%]'
                    }`}
                  >
                    {msg.text}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="p-3 bg-gray-50 dark:bg-slate-700 flex items-center justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-300">
              {isRecording 
                ? 'Listening...' 
                : isProcessing 
                  ? 'Processing...' 
                  : 'Press the mic to speak'}
            </span>
            <button
              onClick={() => setConversation([])}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
            >
              Clear
            </button>
          </div>
        </div>
      )}
      
      {/* Main Button */}
      <button
        onClick={isOpen ? toggleRecording : togglePanel}
        className={`${buttonColor} ${animationClass} h-14 w-14 rounded-full shadow-lg flex items-center justify-center text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all`}
      >
        {isOpen ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
        )}
      </button>
      
      {/* Close button */}
      {isOpen && (
        <button
          onClick={togglePanel}
          className="absolute top-0 right-0 -mt-2 -mr-2 bg-gray-200 dark:bg-gray-700 rounded-full p-1 shadow-md text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
      
      {/* Recording animation */}
      {isRecording && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="flex justify-center space-x-1">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-full w-1"
                style={{
                  height: `${6 + i * 2}px`,
                  animation: 'sound-wave 1.2s ease-in-out infinite',
                  animationDelay: `${i * 0.2}s`
                }}
              ></div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FloatingVoiceButton;