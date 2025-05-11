// src/components/DriverEmotionOverlay.tsx
import React, { useEffect, useState } from 'react';
import { useDriverEmotionAI, MappedEmotion } from '../hooks/useDriverEmotionAI';
import { useAgenticResponse } from '../hooks/useAgenticResponse';
import { useEmergencyProtocol } from '../hooks/useEmergencyProtocol';

interface DriverEmotionOverlayProps {
  refreshRate?: number;
  showControls?: boolean;
  onEmotionUpdate?: (emotion: MappedEmotion, attentionScore: number, faceDetected: boolean) => void;
}

const DriverEmotionOverlay: React.FC<DriverEmotionOverlayProps> = ({
  refreshRate = 2000, // 2 seconds default
  showControls = true,
  onEmotionUpdate
}) => {
  // Emotion detection with webcam
  const emotionAI = useDriverEmotionAI(refreshRate);
  
  // Response generation
  const agenticResponse = useAgenticResponse();
  
  // Emergency protocol
  const emergencyProtocol = useEmergencyProtocol(30); // 30 second countdown
  
  // Response transcript visibility
  const [showTranscript, setShowTranscript] = useState(true);
  
  // Handle face and emotion updates
  useEffect(() => {
    if (!emotionAI.isInitialized) return;
    
    // Call callback if provided
    if (onEmotionUpdate) {
      onEmotionUpdate(
        emotionAI.currentEmotion,
        emotionAI.attentionScore,
        emotionAI.faceDetected
      );
    }
    
    // Handle emotion in response system
    agenticResponse.handleEmotionUpdate(
      emotionAI.currentEmotion,
      emotionAI.attentionScore,
      emotionAI.faceDetected
    );
    
    // Handle emergency protocol if needed
    if (!emotionAI.faceDetected && emotionAI.currentEmotion === 'no-face') {
      emergencyProtocol.startEmergencyCountdown();
    } else if (emotionAI.faceDetected) {
      emergencyProtocol.handleDriverResponse();
    }
  }, [emotionAI.currentEmotion, emotionAI.attentionScore, emotionAI.faceDetected, emotionAI.isInitialized]);
  
  // Get emotion color
  const getEmotionColor = (emotion: MappedEmotion): string => {
    switch(emotion) {
      case 'neutral': return 'text-blue-400';
      case 'happy': return 'text-green-400';
      case 'sad': return 'text-blue-600';
      case 'angry': return 'text-red-500';
      case 'anxious': return 'text-yellow-400';
      case 'tired': return 'text-purple-400';
      case 'distracted': return 'text-orange-400';
      case 'no-face': return 'text-red-600';
      default: return 'text-gray-400';
    }
  };
  
  // Get attention score color
  const getAttentionColor = (score: number): string => {
    if (score >= 70) return 'bg-green-500';
    if (score >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };
  
  // Get response type color
  const getResponseTypeColor = (type: string): string => {
    switch(type) {
      case 'alert': return 'border-red-600 bg-red-900 bg-opacity-20';
      case 'concern': return 'border-orange-500 bg-orange-900 bg-opacity-20';
      case 'support': return 'border-blue-500 bg-blue-900 bg-opacity-20';
      case 'encourage': return 'border-green-500 bg-green-900 bg-opacity-20';
      case 'emergency': return 'border-red-700 bg-red-900 bg-opacity-30';
      default: return 'border-gray-600 bg-gray-700';
    }
  };
  
  return (
    <div className="bg-gray-900 rounded-xl overflow-hidden shadow-2xl border border-gray-800">
      {/* Header */}
      <div className="bg-gray-800 p-4 border-b border-gray-700 flex justify-between items-center">
        <div className="flex items-center">
          <div className="bg-indigo-600 p-2 rounded-lg mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Driver Emotion Detection</h3>
            <p className="text-xs text-gray-400">Real-time monitoring & adaptive responses</p>
          </div>
        </div>
        {showControls && (
          <div className="flex space-x-2">
            <button 
              onClick={() => emergencyProtocol.resetEmergencyState()}
              className="px-2 py-1 bg-red-600 rounded text-white text-xs hover:bg-red-700"
              title="Reset emergency state"
            >
              Reset
            </button>
            <button 
              onClick={() => emotionAI.startDetection()}
              className="px-2 py-1 bg-green-600 rounded text-white text-xs hover:bg-green-700"
              title="Restart detection"
            >
              Restart
            </button>
          </div>
        )}
      </div>
      
      {/* Main content */}
      <div className="flex flex-col md:flex-row">
        {/* Camera Feed */}
        <div className="md:w-1/2 relative bg-black">
          {emotionAI.isInitialized ? (
            <>
              <div className="relative" style={{ aspectRatio: '4/3' }}>
                <video 
                  ref={emotionAI.videoRef}
                  className="absolute inset-0 h-full w-full object-cover"
                  autoPlay
                  playsInline
                  muted
                />
                <canvas 
                  ref={emotionAI.canvasRef}
                  className="absolute inset-0 h-full w-full"
                  width={640}
                  height={480}
                />
                
                {/* Emotion indicator */}
                <div className="absolute top-2 left-2 bg-black bg-opacity-60 px-3 py-1 rounded-full text-sm font-bold">
                  <span className={getEmotionColor(emotionAI.currentEmotion)}>
                    {emotionAI.currentEmotion.charAt(0).toUpperCase() + emotionAI.currentEmotion.slice(1)}
                  </span>
                </div>
                
                {/* Attention score */}
                <div className="absolute bottom-2 left-2 right-2 bg-black bg-opacity-60 px-3 py-1 rounded-lg">
                  <div className="flex justify-between items-center text-xs text-gray-300 mb-1">
                    <span>Attention Score</span>
                    <span className={`font-bold ${
                      emotionAI.attentionScore >= 70 ? 'text-green-400' :
                      emotionAI.attentionScore >= 40 ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>
                      {emotionAI.attentionScore}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${getAttentionColor(emotionAI.attentionScore)}`}
                      style={{ width: `${emotionAI.attentionScore}%` }}
                    />
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="w-full" style={{ aspectRatio: '4/3' }}>
              <div className="h-full flex items-center justify-center bg-gray-800">
                {emotionAI.error ? (
                  <div className="text-center p-4">
                    <div className="text-red-400 mb-2 text-lg">Camera Error</div>
                    <div className="text-sm text-gray-400 mb-4">{emotionAI.error}</div>
                    <button
                      onClick={() => emotionAI.startDetection()}
                      className="px-4 py-2 bg-indigo-600 rounded hover:bg-indigo-700 text-white"
                    >
                      Try Again
                    </button>
                  </div>
                ) : (
                  <div className="text-center p-4">
                    <div className="animate-spin h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <div className="text-gray-400">Initializing camera...</div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Last update time */}
          <div className="absolute bottom-0 right-0 bg-black bg-opacity-60 px-2 py-1 text-xs text-gray-300 rounded-tl-md">
            Updated: {emotionAI.lastUpdated.toLocaleTimeString()}
          </div>
          
          {/* Emergency overlay */}
          {emergencyProtocol.state.isActive && (
            <div className={`absolute inset-0 bg-red-900 bg-opacity-30 flex items-center justify-center ${
              emergencyProtocol.state.countdownSeconds === 0 ? 'animate-pulse' : ''
            }`}>
              <div className="bg-black bg-opacity-70 p-6 rounded-lg max-w-xs text-center">
                <div className="text-red-500 text-2xl font-bold mb-2">Emergency Protocol</div>
                
                {emergencyProtocol.state.countdownSeconds > 0 ? (
                  <>
                    <div className="text-white mb-2">Driver attention required in:</div>
                    <div className="text-4xl text-red-400 font-bold mb-4">{emergencyProtocol.state.countdownSeconds}s</div>
                    <button 
                      onClick={() => emergencyProtocol.handleDriverResponse()}
                      className="w-full py-2 bg-white text-red-700 font-bold rounded hover:bg-gray-100"
                    >
                      I'm Alert - Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <div className="text-white mb-2">Emergency contacts notified</div>
                    <div className="text-sm text-gray-300 mb-4">
                      GPS location has been shared with emergency services
                    </div>
                    <button 
                      onClick={() => emergencyProtocol.handleDriverResponse()}
                      className="w-full py-2 bg-white text-red-700 font-bold rounded hover:bg-gray-100"
                    >
                      I'm OK - Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Response & Metrics */}
        <div className="md:w-1/2 bg-gray-900 p-4">
          {/* Emotion metrics */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            {Object.entries(emotionAI.emotionScores).slice(0, -1).map(([emotion, score]) => (
              <div 
                key={emotion}
                className="bg-gray-800 rounded p-2 flex flex-col items-center justify-center"
              >
                <div className={`text-xs font-medium mb-1 ${getEmotionColor(emotion as MappedEmotion)}`}>
                  {emotion.charAt(0).toUpperCase() + emotion.slice(1)}
                </div>
                <div className="w-full bg-gray-700 h-1 rounded overflow-hidden">
                  <div 
                    className={getEmotionColor(emotion as MappedEmotion).replace('text-', 'bg-')}
                    style={{ width: `${score * 100}%`, height: '100%' }}
                  />
                </div>
              </div>
            ))}
          </div>
          
          {/* AI Response with voice toggle */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-white font-medium">AI Response</h4>
              <button 
                onClick={() => setShowTranscript(!showTranscript)}
                className="text-xs flex items-center text-gray-400 hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 mr-1 ${showTranscript ? 'text-blue-400' : 'text-gray-500'}`} viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                {showTranscript ? 'Hide Transcript' : 'Show Transcript'}
              </button>
            </div>
            
            {agenticResponse.responseHistory.lastResponse ? (
              <div className={`p-3 rounded-lg border-l-4 ${
                getResponseTypeColor(agenticResponse.responseHistory.lastResponse.responseType)
              }`}>
                <div className="flex justify-between items-start mb-1">
                  <div className="text-xs font-medium text-gray-300">
                    {agenticResponse.responseHistory.lastResponse.responseType.charAt(0).toUpperCase() + 
                     agenticResponse.responseHistory.lastResponse.responseType.slice(1)}
                  </div>
                  <div className="text-xs text-gray-400">
                    {agenticResponse.responseHistory.lastResponse.timestamp.toLocaleTimeString()}
                  </div>
                </div>
                
                {showTranscript && (
                  <p className="text-sm text-white mb-1">
                    {agenticResponse.responseHistory.lastResponse.message}
                  </p>
                )}
                
                <div className="flex justify-between items-center">
                  {agenticResponse.responseHistory.lastResponse.isPlaying ? (
                    <div className="flex items-center text-xs text-blue-300">
                      <div className="mr-1">
                        <div className="flex space-x-1">
                          {[1, 2, 3].map(i => (
                            <div 
                              key={i}
                              className="bg-blue-400 w-1 rounded-full animate-pulse"
                              style={{ 
                                height: `${3 + i * 2}px`,
                                animationDelay: `${i * 0.1}s`
                              }}
                            ></div>
                          ))}
                        </div>
                      </div>
                      <span>Playing voice response...</span>
                    </div>
                  ) : (
                    <div className="text-xs text-gray-400">
                      Voice response {agenticResponse.responseHistory.lastResponse.played ? 'played' : 'ready'}
                    </div>
                  )}
                  
                  <button 
                    onClick={() => agenticResponse.playLastResponse()}
                    className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center"
                    disabled={agenticResponse.responseHistory.lastResponse.isPlaying}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                    Play
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-gray-800 p-3 rounded-lg text-gray-400 text-center text-sm">
                No responses yet
              </div>
            )}
          </div>
          
          {/* Response History */}
          <div>
            <h4 className="text-white font-medium mb-2">Response History</h4>
            
            <div className="h-32 overflow-y-auto pr-1">
              {agenticResponse.responseHistory.responses.length > 0 ? (
                <div className="space-y-2">
                  {/* Display most recent first */}
                  {[...agenticResponse.responseHistory.responses]
                    .reverse()
                    .slice(0, 5) // Show only last 5 responses
                    .map((response, index) => (
                      <div 
                        key={index}
                        className={`p-2 rounded border-l-2 bg-opacity-10 text-xs ${
                          getResponseTypeColor(response.responseType)
                        }`}
                      >
                        <div className="flex justify-between text-gray-400 mb-1">
                          <span>{response.responseType}</span>
                          <span>{response.timestamp.toLocaleTimeString()}</span>
                        </div>
                        <p className="text-gray-300 truncate">
                          {response.message}
                        </p>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="bg-gray-800 p-3 rounded-lg text-gray-400 text-center text-sm">
                  No response history
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer with status indicators */}
      <div className="bg-gray-800 border-t border-gray-700 px-4 py-2 flex justify-between items-center">
        <div className="flex items-center text-xs">
          <div className={`h-2 w-2 rounded-full mr-1 ${emotionAI.isInitialized ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-gray-400">Camera: {emotionAI.isInitialized ? 'Active' : 'Inactive'}</span>
        </div>
        
        <div className="flex items-center text-xs">
          <div className={`h-2 w-2 rounded-full mr-1 ${emergencyProtocol.state.isActive ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></div>
          <span className="text-gray-400">
            {emergencyProtocol.state.isActive 
              ? `Emergency: Active (${emergencyProtocol.state.countdownSeconds}s)` 
              : 'Emergency: Inactive'}
          </span>
        </div>
        
        <div className="flex items-center text-xs">
          <div className={`h-2 w-2 rounded-full mr-1 ${
            emotionAI.attentionScore >= 70 ? 'bg-green-500' :
            emotionAI.attentionScore >= 40 ? 'bg-yellow-500' :
            'bg-red-500'
          }`}></div>
          <span className="text-gray-400">Driver Attention: {emotionAI.attentionScore}%</span>
        </div>
      </div>
    </div>
  );
};

export default DriverEmotionOverlay;