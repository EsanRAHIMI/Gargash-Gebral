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

  // Process the recorded audio
  const processAudio = async () => {
    try {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      console.log(`Recording complete: audio blob size ${audioBlob.size} bytes`);
      
      if (audioBlob.size === 0) {
        throw new Error("No audio data recorded");
      }
      
      // Create form data for the API request
      const formData = new FormData();
      formData.append('file', audioBlob, 'recording.webm');
      
      console.log(`Sending audio to ${chatUrl}/transcribe`);
      
      // Send to OpenAI for transcription with better error handling
      try {
        const response = await axios.post(
          `${chatUrl}/transcribe`, 
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            },
            withCredentials: true,
            timeout: 30000 // 30 second timeout
          }
        );
        
        const transcribedText = response.data?.text;
        console.log(`Transcription result: "${transcribedText}"`);
        
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
      } catch (error: any) {
        console.error('Transcription API error:', error);
        
        // Enhanced error detail for debugging
        let errorDetail = 'Unknown error';
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          errorDetail = `Server responded with ${error.response.status}: ${JSON.stringify(error.response.data)}`;
        } else if (error.request) {
          // The request was made but no response was received
          errorDetail = `No response from server: ${error.request}`;
        } else {
          // Something happened in setting up the request
          errorDetail = `Request error: ${error.message}`;
        }
        
        console.error(`Detailed error: ${errorDetail}`);
        throw new Error(`Transcription failed: ${errorDetail}`);
      }
    } catch (error: any) {
      console.error('Error processing audio:', error);
      setState(prev => ({ 
        ...prev, 
        isProcessing: false,
        error: 'Failed to process voice. Please try again or use text input.' 
      }));
    }
  };

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
      
      console.log("Requesting microphone access...");
      
      // First check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Audio recording not supported in this browser");
      }
      
      // Add more specific constraints for better compatibility
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100
        } 
      });
      
      console.log("Microphone access granted");
      streamRef.current = stream;
      
      // Check for MediaRecorder support
      if (!window.MediaRecorder) {
        throw new Error("MediaRecorder not supported in this browser");
      }
      
      // Determine supported MIME types
      const supportedTypes = [
        'audio/webm',
        'audio/webm;codecs=opus',
        'audio/ogg;codecs=opus',
        'audio/mp4'
      ];
      
      let selectedType = '';
      for (const type of supportedTypes) {
        if (MediaRecorder.isTypeSupported(type)) {
          selectedType = type;
          break;
        }
      }
      
      if (!selectedType) {
        console.warn("No supported MIME types found, falling back to default");
        selectedType = 'audio/webm'; // Default fallback
      }
      
      console.log(`Using MIME type: ${selectedType}`);
      
      // Create media recorder with selected MIME type
      const mediaRecorder = new MediaRecorder(stream, { 
        mimeType: selectedType,
        audioBitsPerSecond: 128000
      });
      
      mediaRecorderRef.current = mediaRecorder;
      
      // Add explicit error handler
      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        setState(prev => ({ 
          ...prev, 
          isRecording: false,
          error: 'Error recording audio' 
        }));
      };
      
      // Handle data available event
      mediaRecorder.ondataavailable = (event) => {
        console.log(`Received audio chunk: ${event.data.size} bytes`);
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      // Handle recording stop event
      mediaRecorder.onstop = async () => {
        console.log(`Recording stopped with ${audioChunksRef.current.length} chunks`);
        // Process the recorded audio
        if (audioChunksRef.current.length > 0) {
          await processAudio();
        } else {
          setState(prev => ({ 
            ...prev, 
            isProcessing: false,
            error: 'No audio recorded. Please check your microphone and try again.' 
          }));
        }
      };
      
      // Start recording with timeslice for more frequent data chunks
      mediaRecorder.start(1000); // Get data every second
      console.log("Recording started");
    } catch (error) {
      console.error('Error starting recording:', error);
      setState(prev => ({ 
        ...prev, 
        isRecording: false,
        error: error instanceof Error ? error.message : 'Microphone access denied or not available' 
      }));
    }
  }, [processAudio]);

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

  // Play the assistant's voice response
  const playVoiceResponse = async (text: string) => {
    try {
      setState(prev => ({ ...prev, isProcessing: true }));
      
      console.log("Requesting speech synthesis for text:", text.substring(0, 50) + "...");
      
      // Request speech synthesis with timeout and retries
      let retryCount = 0;
      const maxRetries = 2;
      let audioBlob = null;
      
      while (retryCount <= maxRetries && !audioBlob) {
        try {
          // Add timestamp to prevent caching
          const timestamp = new Date().getTime();
          const response = await axios.post(
            `${chatUrl}/synthesize?t=${timestamp}`,
            { text },
            {
              responseType: 'blob',
              withCredentials: true,
              timeout: 15000, // 15 second timeout
              headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache'
              }
            }
          );
          
          if (response.status === 200 && response.data.size > 0) {
            audioBlob = new Blob([response.data], { type: 'audio/mpeg' });
            console.log(`Received audio blob, size: ${audioBlob.size} bytes`);
          } else {
            throw new Error(`Invalid response: status ${response.status}, size ${response.data?.size || 0}`);
          }
        } catch (retryError) {
          retryCount++;
          console.error(`Speech synthesis attempt ${retryCount}/${maxRetries} failed:`, retryError);
          
          if (retryCount <= maxRetries) {
            // Wait before retrying (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
          } else {
            throw retryError; // Rethrow after max retries
          }
        }
      }
      
      if (!audioBlob || audioBlob.size === 0) {
        throw new Error("Received empty audio data");
      }
      
      // Create URL for the audio blob
      const audioUrl = URL.createObjectURL(audioBlob);
      console.log("Created audio URL:", audioUrl);
      
      // Set the audio source and play
      if (audioRef.current) {
        // Create new Audio element each time to avoid stale state
        audioRef.current = new Audio(audioUrl);
        
        // Add the "ended" event listener
        const onEnded = () => {
          // Clean up
          URL.revokeObjectURL(audioUrl);
          audioRef.current?.removeEventListener('ended', onEnded);
          setState(prev => ({ ...prev, isProcessing: false }));
          
          // Add response to the chat
          onAiResponse(text);
        };
        
        // Add event listener for errors
        const onError = (e: ErrorEvent) => {
          console.error("Audio playback error:", e);
          URL.revokeObjectURL(audioUrl);
          audioRef.current?.removeEventListener('ended', onEnded);
          audioRef.current?.removeEventListener('error', onError);
          setState(prev => ({ ...prev, isProcessing: false }));
          
          // Still add the text response even if audio fails
          onAiResponse(text);
        };
        
        audioRef.current.addEventListener('ended', onEnded);
        audioRef.current.addEventListener('error', onError);
        
        // Add a slight delay for more natural conversation
        setTimeout(() => {
          // Force load and play
          audioRef.current?.load();
          const playPromise = audioRef.current?.play();
          
          if (playPromise) {
            playPromise.catch(error => {
              console.error('Error playing audio:', error);
              setState(prev => ({ ...prev, isProcessing: false }));
              onAiResponse(text); // Still add text response even if audio fails
            });
          }
        }, 800);
      }
    } catch (error) {
      console.error('Error playing voice response:', error);
      setState(prev => ({ 
        ...prev, 
        isProcessing: false,
        error: 'Failed to play voice response. Showing text instead.' 
      }));
      
      // Still add the response as text
      onAiResponse(text);
    }
  };

  // Toggle recording function
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
    toggleRecording
  };
};