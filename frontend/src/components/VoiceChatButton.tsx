// src/components/VoiceChatButton.tsx
import React, { useState, useEffect } from 'react';
import { useVoiceChat } from '../hooks/useVoiceChat';

interface VoiceChatButtonProps {
  onSendMessage: (text: string) => Promise<string>;
  disabled?: boolean;
}

const VoiceChatButton: React.FC<VoiceChatButtonProps> = ({ onSendMessage, disabled = false }) => {
  const [errorToast, setErrorToast] = useState<string | null>(null);
  
  // This function will be called when transcription is complete
  const handleTranscription = async (text: string) => {
    try {
      // Send the transcribed text as a message
      return await onSendMessage(text);
    } catch (error) {
      console.error('Error sending transcribed message:', error);
      return '';
    }
  };
  
  // This function will be called after voice response is played
  const handleAiResponse = (text: string) => {
    // The response is already added to the chat by the parent component
    // This is just a callback for any additional actions after playback
  };
  
  // Initialize the voice chat hook
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
  
  // Handle errors
  useEffect(() => {
    if (error) {
      setErrorToast(error);
      
      // Auto-dismiss error toast after 5 seconds
      const timer = setTimeout(() => {
        setErrorToast(null);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [error]);
  
  // Calculate the animation class for the recording button
  const buttonAnimationClass = isRecording 
    ? 'animate-pulse bg-red-600' 
    : isProcessing 
      ? 'animate-pulse bg-yellow-500'
      : 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600';
  
  // Calculate status text
  const statusText = isRecording 
    ? 'Listening...' 
    : isProcessing 
      ? 'Processing...'
      : 'Talk to Assistant';
  
  // Format the last recording time
  const formattedTime = lastRecordingTime 
    ? lastRecordingTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null;
  
  return (
    <div className="relative">
      {/* Error Toast */}
      {errorToast && (
        <div className="absolute bottom-full mb-2 w-64 p-2 bg-red-100 dark:bg-red-900/60 text-red-800 dark:text-red-200 text-sm rounded-md shadow-md">
          {errorToast}
        </div>
      )}
      
      <div className="flex flex-col items-center">
        {/* Voice Button */}
        <button
          type="button"
          onClick={toggleRecording}
          disabled={disabled || isProcessing}
          className={`flex items-center justify-center p-3 rounded-full shadow-md transition-all duration-300 ${buttonAnimationClass} ${disabled || isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          aria-label={statusText}
        >
          {/* Microphone Icon */}
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-6 w-6 text-white" 
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
        </button>
        
        {/* Status Text */}
        <span className="text-xs mt-2 text-gray-600 dark:text-gray-400">
          {statusText}
        </span>
        
        {/* Last Recording Time */}
        {formattedTime && !isRecording && !isProcessing && (
          <span className="text-xs mt-1 text-gray-500 dark:text-gray-500">
            Last heard: {formattedTime}
          </span>
        )}
        
        {/* Recording Indicator Wave Animation (visible only when recording) */}
        {isRecording && (
          <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2">
            <div className="flex justify-center space-x-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <div 
                  key={i}
                  className="bg-red-600 rounded-full"
                  style={{
                    width: '2px',
                    animationDelay: `${i * 0.1}s`,
                    height: `${4 + i * 2}px`,
                    animation: 'sound-wave 1.2s ease-in-out infinite'
                  }}
                ></div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceChatButton;