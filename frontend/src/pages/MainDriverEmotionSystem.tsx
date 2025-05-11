// src/pages/MainDriverEmotionSystem.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LoadingSpinner from '../components/LoadingSpinner';
import DriverEmotionOverlay from '../components/DriverEmotionOverlay';
import { useDriverEmotionAI, MappedEmotion } from '../hooks/useDriverEmotionAI';
import { useAgenticResponse } from '../hooks/useAgenticResponse';
import { useEmergencyProtocol } from '../hooks/useEmergencyProtocol';
import EmotionDemoComponent from '../components/EmotionDemoComponent';

const MainDriverEmotionSystem: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  
  // State for simulation mode
  const [simulationMode, setSimulationMode] = useState<boolean>(false);
  
  // Last event for logging
  const [lastEvent, setLastEvent] = useState<string>('');
  
  // Setup references for system state
  const [systemState, setSystemState] = useState<{
    currentEmotion: MappedEmotion;
    attentionScore: number;
    faceDetected: boolean;
    lastEmotionChange: Date;
  }>({
    currentEmotion: 'neutral',
    attentionScore: 100,
    faceDetected: true,
    lastEmotionChange: new Date()
  });
  
  // Initialize emergency protocol (30 second countdown)
  const emergencyProtocol = useEmergencyProtocol(30);
  
  // Initialize agentic response
  const agenticResponse = useAgenticResponse();
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, isLoading, navigate]);
  
  // Handle emotion updates from simulation
  const handleSimulatorInput = (emotion: MappedEmotion, attention: number) => {
    // Update system state
    setSystemState({
      currentEmotion: emotion,
      attentionScore: attention,
      faceDetected: emotion !== 'no-face',
      lastEmotionChange: new Date()
    });
    
    // Log the simulated emotion update
    setLastEvent(`Simulated: ${emotion} (Attention: ${attention})`);
    
    // Handle emotion update in agentic response system
    agenticResponse.handleEmotionUpdate(
      emotion,
      attention,
      emotion !== 'no-face'
    );
    
    // Handle emergency protocol if needed
    if (emotion === 'no-face') {
      emergencyProtocol.startEmergencyCountdown();
    } else {
      emergencyProtocol.handleDriverResponse();
    }
  };
  
  // Handle emotion updates from real detection
  const handleEmotionUpdate = (
    emotion: MappedEmotion,
    attentionScore: number,
    faceDetected: boolean
  ) => {
    // Update system state
    setSystemState({
      currentEmotion: emotion,
      attentionScore: attentionScore,
      faceDetected: faceDetected,
      lastEmotionChange: new Date()
    });
    
    // Log the detected emotion update
    setLastEvent(`Detected: ${emotion} (Attention: ${attentionScore})`);
  };
  
  // Toggle simulation mode
  const toggleSimulationMode = () => {
    setSimulationMode(prev => !prev);
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-slate-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-900 flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Driver Emotion AI System</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Real-time emotion detection, context-aware responses, and driver safety monitoring
            </p>
          </div>
          
          {/* Mode toggle */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-4 mb-6 flex justify-between items-center">
            <div className="text-gray-700 dark:text-gray-200 font-medium">
              {simulationMode ? "Simulation Mode" : "Camera Detection Mode"}
            </div>
            <div className="flex items-center">
              <span className="mr-3 text-sm text-gray-600 dark:text-gray-400">
                Camera
              </span>
              <button 
                onClick={toggleSimulationMode} 
                className={`relative inline-flex items-center h-6 rounded-full w-11 ${
                  simulationMode ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span className="sr-only">Toggle mode</span>
                <span 
                  className={`inline-block w-4 h-4 transform rounded-full bg-white transition ${
                    simulationMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className="ml-3 text-sm text-gray-600 dark:text-gray-400">
                Simulation
              </span>
            </div>
          </div>
          
          {/* Driver Emotion System */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow overflow-hidden mb-6">
            {simulationMode ? (
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Emotion Simulation</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Use the controls below to simulate different driver emotional states and test the system's responses.
                </p>
                
                <EmotionDemoComponent onEmotionSelect={handleSimulatorInput} />
                
                {/* Response display */}
                <div className="mt-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">System Response</h3>
                  
                  {agenticResponse.responseHistory.lastResponse ? (
                    <div className={`p-4 rounded-lg border-l-4 ${
                      agenticResponse.responseHistory.lastResponse.responseType === 'alert' ? 'bg-red-50 dark:bg-red-900/20 border-red-600' :
                      agenticResponse.responseHistory.lastResponse.responseType === 'concern' ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-500' :
                      agenticResponse.responseHistory.lastResponse.responseType === 'support' ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500' :
                      agenticResponse.responseHistory.lastResponse.responseType === 'encourage' ? 'bg-green-50 dark:bg-green-900/20 border-green-500' :
                      agenticResponse.responseHistory.lastResponse.responseType === 'emergency' ? 'bg-red-50 dark:bg-red-900/30 border-red-700' :
                      'bg-gray-50 dark:bg-gray-700 border-gray-600'
                    }`}>
                      <div className="flex justify-between items-start mb-2">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {agenticResponse.responseHistory.lastResponse.responseType.charAt(0).toUpperCase() + 
                           agenticResponse.responseHistory.lastResponse.responseType.slice(1)} Response
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {agenticResponse.responseHistory.lastResponse.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                      
                      <p className="text-gray-700 dark:text-gray-300 mb-2">
                        {agenticResponse.responseHistory.lastResponse.message}
                      </p>
                      
                      <div className="flex justify-between items-center">
                        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                          </svg>
                          Voice: {agenticResponse.responseHistory.lastResponse.isPlaying ? 'Playing...' : 'Ready'}
                        </div>
                        
                        <button 
                          onClick={() => agenticResponse.playLastResponse()}
                          className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center"
                          disabled={agenticResponse.responseHistory.lastResponse.isPlaying}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                          </svg>
                          Replay
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-gray-500 dark:text-gray-400 text-center">
                      No responses yet. Try simulating different emotions.
                    </div>
                  )}
                </div>
                
                {/* Emergency status */}
                {emergencyProtocol.state.isActive && (
                  <div className="mt-6 bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg p-4">
                    <div className="flex items-center text-red-600 dark:text-red-400 font-bold mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Emergency Protocol Active
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 mb-2">
                      {emergencyProtocol.state.countdownSeconds > 0 
                        ? `Countdown: ${emergencyProtocol.state.countdownSeconds} seconds remaining` 
                        : 'Emergency contacts have been notified'}
                    </p>
                    <button 
                      onClick={() => emergencyProtocol.handleDriverResponse()}
                      className="w-full py-2 bg-red-600 text-white font-bold rounded hover:bg-red-700"
                    >
                      Cancel Emergency
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // Real camera detection mode
              <DriverEmotionOverlay 
                refreshRate={2000}
                showControls={true}
                onEmotionUpdate={handleEmotionUpdate}
              />
            )}
          </div>
          
          {/* System Events & Logs */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">System Events</h2>
            
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <div className="bg-gray-50 dark:bg-gray-700 py-2 px-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Event Log</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Mode: {simulationMode ? 'Simulation' : 'Camera Detection'}
                  </div>
                </div>
              </div>
              
              <div className="p-4 max-h-40 overflow-y-auto bg-gray-100 dark:bg-slate-900 font-mono text-sm">
                <div className="text-gray-600 dark:text-gray-400">
                  [System] Driver emotion system initialized. {new Date().toLocaleTimeString()}
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  [Config] Refresh rate: 2000ms, Emergency countdown: 30s
                </div>
                {lastEvent && (
                  <div className="text-indigo-600 dark:text-indigo-400">
                    [Event] {lastEvent}
                  </div>
                )}
                {agenticResponse.responseHistory.lastResponse && (
                  <div className="text-green-600 dark:text-green-400">
                    [Response] Type: {agenticResponse.responseHistory.lastResponse.responseType}, 
                    Time: {agenticResponse.responseHistory.lastResponse.timestamp.toLocaleTimeString()}
                  </div>
                )}
                {emergencyProtocol.state.isActive && (
                  <div className="text-red-600 dark:text-red-400">
                    [Emergency] Protocol active. Countdown: {emergencyProtocol.state.countdownSeconds}s
                  </div>
                )}
                {agenticResponse.error && (
                  <div className="text-red-600 dark:text-red-400">
                    [Error] Response: {agenticResponse.error}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Documentation */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">About Driver Emotion AI</h2>
            
            <div className="prose dark:prose-invert max-w-none">
              <p>
                The Driver Emotion Recognition &amp; Response System continuously monitors the driver's emotional state through 
                real-time facial analysis, providing adaptive responses and safety interventions when needed.
              </p>
              
              <h3>Key Features</h3>
              <ul>
                <li><strong>Real-time Emotion Detection</strong> - Identifies neutral, angry, tired, sad, anxious, happy, or distracted states</li>
                <li><strong>Adaptive AI Responses</strong> - Context-aware GPT-4o generated responses tailored to emotional state</li>
                <li><strong>Voice Interaction</strong> - Natural voice communication using the "shimmer" voice</li>
                <li><strong>Emergency Protocol</strong> - Automatically triggers safety protocols when driver is unresponsive</li>
                <li><strong>Attention Scoring</strong> - Calculates a dynamic "Driver Attention Score" to quantify focus level</li>
              </ul>
              
              <h3>How It Works</h3>
              <p>
                The system uses TensorFlow.js with BlazeFace to detect facial features and classify emotions based on 
                expressions, eye openness, and other visual cues. It calculates an attention score based on emotional 
                state and tracks patterns over time to detect tiredness or distraction.
              </p>
              <p>
                When concerning emotional states or low attention are detected, the system generates context-appropriate 
                responses using GPT-4o and delivers them through natural voice synthesis. In critical situations, 
                the emergency protocol activates to ensure driver safety.
              </p>
              
              <h3>Privacy Note</h3>
              <p>
                All face processing happens locally in your browser. No video or images are stored or transmitted.
                Location data is only accessed during emergency situations and is not shared unless explicitly 
                authorized during an emergency.
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default MainDriverEmotionSystem;