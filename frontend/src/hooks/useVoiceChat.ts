// src/hooks/useVoiceChat.ts
import { useState, useRef, useCallback, useEffect } from 'react';
import axios from 'axios';

interface UseVoiceChatProps {
  onTranscription: (text: string) => Promise<string>;
  onAiResponse: (text: string) => void;
}

interface VoiceChatState {
  isRecording: boolean;
  isProcessing: boolean;
  error: string | null;
  lastRecordingTime: Date | null;
}

const chatUrl = import.meta.env.VITE_CHAT_URL;

export const useVoiceChat = ({ onTranscription, onAiResponse }: UseVoiceChatProps) => {
  const [state, setState] = useState<VoiceChatState>({
    isRecording: false,
    isProcessing: false,
    error: null,
    lastRecordingTime: null
  });
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio element for playback
  useEffect(() => {
    audioRef.current = new Audio();
    
    return () => {
      // Cleanup on unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Start recording function
  const startRecording = useCallback(async () => {
    try {
      // Reset state
      setState(prev => ({ 
        ...prev, 
        isRecording: true, 
        error: null,
        lastRecordingTime: new Date()
      }));
      audioChunksRef.current = [];
      
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      // Create media recorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      // Handle data available event
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      // Handle recording stop event
      mediaRecorder.onstop = async () => {
        // Process the recorded audio
        if (audioChunksRef.current.length > 0) {
          await processAudio();
        }
      };
      
      // Start recording
      mediaRecorder.start();
    } catch (error) {
      console.error('Error starting recording:', error);
      setState(prev => ({ 
        ...prev, 
        isRecording: false,
        error: 'Microphone access denied or not available' 
      }));
    }
  }, []);

  // Stop recording function
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && state.isRecording) {
      mediaRecorderRef.current.stop();
      
      // Stop all media tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      setState(prev => ({ 
        ...prev, 
        isRecording: false,
        isProcessing: true 
      }));
    }
  }, [state.isRecording]);

  // Process the recorded audio
  const processAudio = async () => {
    try {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      
      // Create form data for the API request
      const formData = new FormData();
      formData.append('file', audioBlob, 'recording.webm');
      formData.append('model', 'whisper-1');
      
      // Send to OpenAI for transcription
      const response = await axios.post(
        `${chatUrl}/transcribe`, 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          withCredentials: true
        }
      );
      
      const transcribedText = response.data.text;
      
      // If we got text, send it to the chat
      if (transcribedText && transcribedText.trim()) {
        // Call the callback with transcribed text and get AI response
        const aiResponse = await onTranscription(transcribedText);
        
        // If we got a response, play it as voice
        if (aiResponse && aiResponse.trim()) {
          await playVoiceResponse(aiResponse);
        } else {
          setState(prev => ({ ...prev, isProcessing: false }));
        }
      } else {
        setState(prev => ({ 
          ...prev, 
          isProcessing: false,
          error: 'No speech detected. Please try again.' 
        }));
      }
    } catch (error) {
      console.error('Error processing audio:', error);
      setState(prev => ({ 
        ...prev, 
        isProcessing: false,
        error: 'Failed to process voice. Please try again or use text input.' 
      }));
    }
  };

  // Play the assistant's voice response
  const playVoiceResponse = async (text: string) => {
    try {
      setState(prev => ({ ...prev, isProcessing: true }));
      
      // Request speech synthesis from OpenAI
      const response = await axios.post(
        `${chatUrl}/synthesize`,
        { text },
        {
          responseType: 'blob',
          withCredentials: true
        }
      );
      
      // Create URL for the audio blob
      const audioBlob = new Blob([response.data], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Set the audio source and play
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        
        // Add the "ended" event listener
        const onEnded = () => {
          // Clean up
          URL.revokeObjectURL(audioUrl);
          audioRef.current?.removeEventListener('ended', onEnded);
          setState(prev => ({ ...prev, isProcessing: false }));
          
          // Add response to the chat
          onAiResponse(text);
        };
        
        audioRef.current.addEventListener('ended', onEnded);
        
        // Add a slight delay for more natural conversation
        setTimeout(() => {
          audioRef.current?.play().catch(error => {
            console.error('Error playing audio:', error);
            setState(prev => ({ ...prev, isProcessing: false }));
            onAiResponse(text); // Still add text response even if audio fails
          });
        }, 800);
      }
    } catch (error) {
      console.error('Error playing voice response:', error);
      setState(prev => ({ 
        ...prev, 
        isProcessing: false,
        error: 'Failed to play voice response' 
      }));
      
      // Still add the response as text
      onAiResponse(text);
    }
  };

  // Toggle recording state
  const toggleRecording = useCallback(() => {
    if (state.isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [state.isRecording, startRecording, stopRecording]);

  return {
    isRecording: state.isRecording,
    isProcessing: state.isProcessing,
    error: state.error,
    lastRecordingTime: state.lastRecordingTime,
    toggleRecording,
    playVoiceResponse
  };
};