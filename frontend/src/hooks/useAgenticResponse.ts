// src/hooks/useAgenticResponse.ts
import { useState, useCallback, useRef } from 'react';
import axios from 'axios';
import { MappedEmotion } from './useDriverEmotionAI';
import speechProcessor from '../utils/speechProcessor';

const CHAT_URL = import.meta.env.VITE_CHAT_URL || 'http://localhost:5003/ai';

// Response types based on emotional states
type ResponseType = 'alert' | 'concern' | 'support' | 'encourage' | 'emergency';

// Response history entry
interface ResponseEntry {
  message: string;
  responseType: ResponseType;
  timestamp: Date;
  emotion: MappedEmotion;
  attentionScore: number;
  played: boolean;
  isPlaying: boolean;
}

// Response history state
interface ResponseHistory {
  responses: ResponseEntry[];
  lastResponse: ResponseEntry | null;
}

/**
 * Hook for generating context-aware GPT responses to driver emotions
 */
export const useAgenticResponse = () => {
  // Response history state
  const [responseHistory, setResponseHistory] = useState<ResponseHistory>({
    responses: [],
    lastResponse: null
  });
  
  // Loading and error states
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Response cooldown to avoid too frequent responses
  const cooldownRef = useRef<boolean>(false);
  const emergencyModeRef = useRef<boolean>(false);
  
  // Last detected emotion for change detection
  const lastEmotionRef = useRef<{
    emotion: MappedEmotion;
    attentionScore: number;
    timestamp: Date;
  }>({
    emotion: 'neutral',
    attentionScore: 100,
    timestamp: new Date()
  });
  
  /**
   * Determine appropriate response type based on emotion and attention
   */
  const determineResponseType = (
    emotion: MappedEmotion, 
    attentionScore: number,
    faceDetected: boolean
  ): ResponseType => {
    // Emergency situation - no face detected for too long
    if (!faceDetected && emotion === 'no-face') {
      return 'emergency';
    }
    
    // Immediate alert situations - distracted, extremely tired, or very low attention
    if (emotion === 'distracted' || attentionScore < 30 || (emotion === 'tired' && attentionScore < 40)) {
      return 'alert';
    }
    
    // Concern situations - angry, moderately tired, or moderate attention issues
    if (emotion === 'angry' || (emotion === 'tired' && attentionScore < 60) || attentionScore < 50) {
      return 'concern';
    }
    
    // Support situations - sad or anxious
    if (emotion === 'sad' || emotion === 'anxious') {
      return 'support';
    }
    
    // Encourage situations - neutral or happy with good attention
    return 'encourage';
  };
  
  /**
   * Generate context-aware prompts for GPT-4o
   */
  const generatePrompt = (
    emotion: MappedEmotion,
    attentionScore: number,
    responseType: ResponseType
  ): string => {
    let basePrompt = `You are Gebral, an in-car AI co-pilot with the shimmer voice. You're trained to respond to the driver's emotional state. The driver is currently detected as '${emotion}' with an attention score of ${attentionScore}/100. `;
    
    basePrompt += "Keep your response short (under 100 words) and conversational. Be empathetic but professional. ";
    
    // Add specific instructions based on response type
    switch (responseType) {
      case 'alert':
        basePrompt += "IMPORTANT: The driver needs immediate attention! Provide a direct, clear alert about their distraction or low attention. Use a firm but caring tone. Suggest they focus on the road or consider pulling over safely. Keep it very brief and direct.";
        break;
      case 'concern':
        basePrompt += "The driver may be angry, tired, or showing concerning attention levels. Express genuine concern for their wellbeing. Suggest practical solutions like taking a break, deep breathing, or adjusting the temperature. Avoid being pushy.";
        break;
      case 'support':
        basePrompt += "The driver appears sad or anxious. Provide gentle emotional support and reassurance. Suggest coping strategies like breathing exercises or listening to calming music. Keep your tone warm and empathetic.";
        break;
      case 'encourage':
        basePrompt += "The driver appears to be doing well. Offer positive reinforcement about their driving or a brief, uplifting comment. Keep it natural and not overly cheerful. You might mention the weather, suggest a good music choice, or simply acknowledge their good state.";
        break;
      case 'emergency':
        basePrompt += "EMERGENCY SITUATION! The driver may be unresponsive or has looked away from the road for too long. Use a loud, clear voice to attempt to get their attention. State that emergency protocols may be activated if they don't respond. Be very direct and urgent.";
        break;
    }
    
    return basePrompt;
  };
  
  /**
   * Calculate if we should generate a new response based on changed conditions
   */
  const shouldGenerateResponse = (
    newEmotion: MappedEmotion,
    newAttentionScore: number,
    faceDetected: boolean
  ): boolean => {
    // Always respond to emergency situations
    if (!faceDetected && newEmotion === 'no-face') {
      // If we're already in emergency mode, don't spam responses
      if (emergencyModeRef.current) return false;
      emergencyModeRef.current = true;
      return true;
    } else {
      // Reset emergency mode when face is detected again
      emergencyModeRef.current = false;
    }
    
    // Skip if in cooldown period
    if (cooldownRef.current) return false;
    
    const lastEmotion = lastEmotionRef.current.emotion;
    const lastAttentionScore = lastEmotionRef.current.attentionScore;
    const timeSinceLastUpdate = new Date().getTime() - lastEmotionRef.current.timestamp.getTime();
    
    // If it's been less than 5 seconds since the last response, don't generate a new one
    if (timeSinceLastUpdate < 5000) return false;
    
    // Always respond to significant attention drops
    if (lastAttentionScore - newAttentionScore > 20) return true;
    
    // Respond to emotion changes
    if (lastEmotion !== newEmotion) return true;
    
    // For low attention states, respond more frequently
    if (newAttentionScore < 50 && timeSinceLastUpdate > 15000) return true;
    
    // For normal states, only respond occasionally
    if (timeSinceLastUpdate > 45000) return true;
    
    return false;
  };
  
  /**
   * Generate and play a response based on emotion and attention
   */
  const generateResponse = useCallback(async (
    emotion: MappedEmotion,
    attentionScore: number,
    responseType: ResponseType
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Set cooldown to prevent response spam
      cooldownRef.current = true;
      setTimeout(() => {
        cooldownRef.current = false;
      }, 3000);
      
      // Generate prompt
      const prompt = generatePrompt(emotion, attentionScore, responseType);
      
      // Get response from GPT-4o
      let responseText: string;
      
      try {
        // Call AI service
        const response = await axios.post(CHAT_URL, {
          message: prompt,
          system: "You are a car AI assistant that detects driver emotions. Keep responses under 100 words.",
          model: "gpt-4o"
        }, {
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000 // 10 second timeout
        });
        
        responseText = response.data?.response || '';
        
        // Clean up response - remove quotes if present
        responseText = responseText.replace(/^["']|["']$/g, '');
      } catch (error) {
        console.error('Error getting AI response:', error);
        
        // Use fallback responses if AI service fails
        responseText = getFallbackResponse(emotion, attentionScore, responseType);
      }
      
      // Create response entry
      const responseEntry: ResponseEntry = {
        message: responseText,
        responseType,
        timestamp: new Date(),
        emotion,
        attentionScore,
        played: false,
        isPlaying: false
      };
      
      // Update state
      setResponseHistory(prev => ({
        responses: [...prev.responses, responseEntry],
        lastResponse: responseEntry
      }));
      
      // Play the response
      await playResponse(responseEntry);
      
      // Update last emotion reference
      lastEmotionRef.current = {
        emotion,
        attentionScore,
        timestamp: new Date()
      };
      
    } catch (error) {
      console.error('Error generating response:', error);
      setError('Failed to generate response');
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  /**
   * Play response using speech synthesis
   */
  const playResponse = async (response: ResponseEntry) => {
    try {
      // Mark as playing
      setResponseHistory(prev => ({
        ...prev,
        lastResponse: { ...response, isPlaying: true }
      }));
      
      // Use the speech processor to play the response
      await speechProcessor.speak(response.message, { 
        voice: 'shimmer',
        model: 'tts-1',
        speed: response.responseType === 'emergency' ? 1.2 : 1.0
      });
      
      // Mark as played
      setResponseHistory(prev => ({
        ...prev,
        lastResponse: { ...response, played: true, isPlaying: false }
      }));
      
    } catch (error) {
      console.error('Error playing response:', error);
      
      // Mark as not playing even if there was an error
      setResponseHistory(prev => ({
        ...prev,
        lastResponse: { ...response, isPlaying: false }
      }));
    }
  };
  
  /**
   * Get fallback responses if AI service fails
   */
  const getFallbackResponse = (
    emotion: MappedEmotion,
    attentionScore: number,
    responseType: ResponseType
  ): string => {
    // Simple fallback responses for each type
    switch (responseType) {
      case 'alert':
        return "Please keep your eyes on the road. Your attention level is low. Consider pulling over if you need a break.";
      case 'concern':
        return "I've noticed you may be feeling tired or frustrated. Would you like me to suggest a rest stop nearby?";
      case 'support':
        return "It seems like you might be feeling a bit down. Would you like me to play some uplifting music?";
      case 'encourage':
        return "You're driving well and seem to be in good spirits. Let me know if you need anything.";
      case 'emergency':
        return "ATTENTION! Please respond! If you don't respond, emergency protocols will be activated. Are you alright?";
      default:
        return "I'm here to assist you with your drive. Let me know if you need anything.";
    }
  };
  
  /**
   * Replay the last response
   */
  const playLastResponse = useCallback(async () => {
    if (!responseHistory.lastResponse || responseHistory.lastResponse.isPlaying) {
      return;
    }
    
    await playResponse(responseHistory.lastResponse);
  }, [responseHistory.lastResponse]);
  
  /**
   * Handle emotion updates from the detection system
   */
  const handleEmotionUpdate = useCallback((
    emotion: MappedEmotion,
    attentionScore: number,
    faceDetected: boolean
  ) => {
    // Determine if we should generate a new response
    if (shouldGenerateResponse(emotion, attentionScore, faceDetected)) {
      // Determine response type
      const responseType = determineResponseType(emotion, attentionScore, faceDetected);
      
      // Generate response
      generateResponse(emotion, attentionScore, responseType);
    }
  }, [generateResponse]);
  
  return {
    responseHistory,
    isLoading,
    error,
    playLastResponse,
    handleEmotionUpdate
  };
};

export default useAgenticResponse;