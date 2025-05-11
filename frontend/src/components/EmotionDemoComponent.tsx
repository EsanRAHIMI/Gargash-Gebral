// src/components/EmotionDemoComponent.tsx
import React, { useState, useEffect } from 'react';
import { MappedEmotion } from '../utils/emotionModelAdapter';
import speechProcessor from '../utils/speechProcessor';

interface EmotionDemoProps {
  onEmotionSelect: (emotion: MappedEmotion, attentionScore: number) => void;
}

/**
 * Component for demonstrating different emotional states
 * This is useful for testing the system without a camera
 */
const EmotionDemoComponent: React.FC<EmotionDemoProps> = ({ onEmotionSelect }) => {
  // Selected emotion and attention score
  const [selectedEmotion, setSelectedEmotion] = useState<MappedEmotion>('neutral');
  const [attentionScore, setAttentionScore] = useState<number>(90);
  
  // Simulation states
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [scenarioIndex, setScenarioIndex] = useState<number>(0);
  
  // Predefined scenarios to demonstrate
  const scenarios = [
    { name: "Driver starts getting tired", 
      steps: [
        { emotion: 'neutral', score: 95, duration: 4000 },
        { emotion: 'neutral', score: 80, duration: 3000 },
        { emotion: 'tired', score: 70, duration: 3000 },
        { emotion: 'tired', score: 50, duration: 3000 },
        { emotion: 'tired', score: 30, duration: 4000 },
        { emotion: 'no-face', score: 10, duration: 8000 },
        { emotion: 'neutral', score: 60, duration: 3000 }
      ]
    },
    { name: "Driver gets angry in traffic",
      steps: [
        { emotion: 'neutral', score: 90, duration: 3000 },
        { emotion: 'neutral', score: 75, duration: 2000 },
        { emotion: 'angry', score: 60, duration: 3000 },
        { emotion: 'angry', score: 40, duration: 4000 },
        { emotion: 'angry', score: 20, duration: 5000 },
        { emotion: 'neutral', score: 40, duration: 3000 },
        { emotion: 'neutral', score: 70, duration: 3000 }
      ]
    },
    { name: "Driver becomes anxious",
      steps: [
        { emotion: 'neutral', score: 85, duration: 3000 },
        { emotion: 'anxious', score: 70, duration: 3000 },
        { emotion: 'anxious', score: 50, duration: 4000 },
        { emotion: 'anxious', score: 35, duration: 5000 },
        { emotion: 'neutral', score: 60, duration: 3000 }
      ]
    },
    { name: "Driver gets distracted",
      steps: [
        { emotion: 'neutral', score: 90, duration: 3000 },
        { emotion: 'distracted', score: 60, duration: 3000 },
        { emotion: 'no-face', score: 40, duration: 4000 },
        { emotion: 'no-face', score: 20, duration: 5000 },
        { emotion: 'neutral', score: 80, duration: 3000 }
      ]
    },
    { name: "Driver becomes sad",
      steps: [
        { emotion: 'neutral', score: 85, duration: 3000 },
        { emotion: 'sad', score: 70, duration: 3000 },
        { emotion: 'sad', score: 50, duration: 4000 },
        { emotion: 'sad', score: 40, duration: 5000 },
        { emotion: 'neutral', score: 60, duration: 3000 }
      ]
    }
  ];

  // Apply selected emotion
  useEffect(() => {
    onEmotionSelect(selectedEmotion, attentionScore);
  }, [selectedEmotion, attentionScore, onEmotionSelect]);

  // Run scenario simulation
  useEffect(() => {
    if (!isSimulating) {
      return;
    }

    let stepIndex = 0;
    const scenario = scenarios[scenarioIndex];

    // Function to process each step
    const processStep = async () => {
      if (!isSimulating || stepIndex >= scenario.steps.length) {
        setIsSimulating(false);
        return;
      }

      const step = scenario.steps[stepIndex];
      setSelectedEmotion(step.emotion as MappedEmotion);
      setAttentionScore(step.score);

      // Wait for the specified duration
      await new Promise(resolve => setTimeout(resolve, step.duration));

      // Move to next step
      stepIndex++;
      
      // Continue if still simulating
      if (isSimulating) {
        processStep();
      }
    };

    // Start processing steps
    processStep();

    // Clean up on unmount or when simulation stops
    return () => {
      setIsSimulating(false);
    };
  }, [isSimulating, scenarioIndex, scenarios, onEmotionSelect]);

  // Handle emotion selection
  const handleEmotionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedEmotion(e.target.value as MappedEmotion);
  };

  // Handle attention score change
  const handleAttentionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAttentionScore(parseInt(e.target.value));
  };

  // Start scenario simulation
  const startSimulation = () => {
    setIsSimulating(true);
  };

  // Stop simulation
  const stopSimulation = () => {
    setIsSimulating(false);
  };

  // Handle scenario selection
  const handleScenarioChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setScenarioIndex(parseInt(e.target.value));
  };

  // Test speech synthesis
  const testSpeech = async () => {
    try {
      await speechProcessor.speak(`This is a test message for the ${selectedEmotion} state with attention score ${attentionScore}.`, { voice: 'shimmer' });
    } catch (error) {
      console.error('Error testing speech:', error);
    }
  };

  // Render component
  return (
    <div className="bg-gray-800 rounded-lg p-4 shadow-lg">
      <h3 className="text-white font-bold mb-4 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        Emotion Simulation Controls
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Manual controls */}
        <div className="bg-gray-700 p-3 rounded-lg">
          <h4 className="text-gray-300 font-medium mb-2">Manual Control</h4>
          
          <div className="mb-3">
            <label className="block text-gray-400 text-sm mb-1">Emotion</label>
            <select 
              value={selectedEmotion}
              onChange={handleEmotionChange}
              disabled={isSimulating}
              className="w-full bg-gray-600 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="neutral">Neutral</option>
              <option value="happy">Happy</option>
              <option value="sad">Sad</option>
              <option value="angry">Angry</option>
              <option value="anxious">Anxious</option>
              <option value="tired">Tired</option>
              <option value="distracted">Distracted</option>
              <option value="no-face">No Face</option>
            </select>
          </div>
          
          <div className="mb-3">
            <label className="block text-gray-400 text-sm mb-1">
              Attention Score: {attentionScore}
            </label>
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={attentionScore}
              onChange={handleAttentionChange}
              disabled={isSimulating}
              className="w-full"
            />
          </div>
          
          <button
            onClick={testSpeech}
            className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Test Speech
          </button>
        </div>
        
        {/* Scenario simulation */}
        <div className="bg-gray-700 p-3 rounded-lg">
          <h4 className="text-gray-300 font-medium mb-2">Scenario Simulation</h4>
          
          <div className="mb-3">
            <label className="block text-gray-400 text-sm mb-1">Scenario</label>
            <select 
              value={scenarioIndex}
              onChange={handleScenarioChange}
              disabled={isSimulating}
              className="w-full bg-gray-600 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {scenarios.map((scenario, index) => (
                <option key={index} value={index}>
                  {scenario.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex space-x-2">
            {!isSimulating ? (
              <button
                onClick={startSimulation}
                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 flex-1"
              >
                Start Simulation
              </button>
            ) : (
              <button
                onClick={stopSimulation}
                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 flex-1"
              >
                Stop Simulation
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Current state display */}
      <div className="bg-gray-700 p-3 rounded-lg">
        <h4 className="text-gray-300 font-medium mb-2">Current State</h4>
        
        <div className="flex justify-between items-center">
          <div>
            <div className="text-sm text-gray-400">Emotion</div>
            <div className={`font-bold ${
              selectedEmotion === 'neutral' ? 'text-blue-400' :
              selectedEmotion === 'happy' ? 'text-green-400' :
              selectedEmotion === 'sad' ? 'text-blue-600' :
              selectedEmotion === 'angry' ? 'text-red-500' :
              selectedEmotion === 'anxious' ? 'text-yellow-400' :
              selectedEmotion === 'tired' ? 'text-purple-400' :
              selectedEmotion === 'distracted' ? 'text-orange-400' :
              'text-red-600'
            }`}>
              {selectedEmotion.charAt(0).toUpperCase() + selectedEmotion.slice(1)}
            </div>
          </div>
          
          <div>
            <div className="text-sm text-gray-400">Attention Score</div>
            <div className={`font-bold ${
              attentionScore >= 70 ? 'text-green-400' :
              attentionScore >= 40 ? 'text-yellow-400' :
              'text-red-400'
            }`}>
              {attentionScore}
            </div>
          </div>
          
          <div>
            <div className="text-sm text-gray-400">Status</div>
            <div className="font-bold text-green-400">
              {isSimulating ? 'Simulating...' : 'Manual'}
            </div>
          </div>
        </div>
      </div>
      
      {/* Scenario steps display */}
      {isSimulating && (
        <div className="mt-4 bg-gray-700 p-3 rounded-lg">
          <h4 className="text-gray-300 font-medium mb-2">Scenario Steps</h4>
          <div className="text-sm text-gray-400">
            {scenarios[scenarioIndex].steps.map((step, index) => (
              <div 
                key={index}
                className={`py-1 ${
                  selectedEmotion === step.emotion && Math.abs(attentionScore - step.score) < 5
                    ? 'bg-gray-600 font-bold text-white'
                    : ''
                }`}
              >
                {index + 1}. {step.emotion} (Score: {step.score}) - {(step.duration / 1000).toFixed(1)}s
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmotionDemoComponent;