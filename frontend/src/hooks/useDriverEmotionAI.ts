// src/hooks/useDriverEmotionAI.ts
import { useState, useEffect, useRef, useCallback } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as blazeface from '@tensorflow-models/blazeface';
import { EmotionModelAdapter, MappedEmotion } from '../utils/emotionModelAdapter';

// Standard refresh rate (in milliseconds)
const DEFAULT_REFRESH_RATE = 2000; // 2 seconds

// Initialize TensorFlow and ensure WebGL backend is used
tf.setBackend('webgl').catch(e => console.error('Failed to set backend:', e));

/**
 * Hook for driver emotion detection using webcam feed
 * @param refreshRate How often to update emotion detection (ms)
 * @returns State and controls for emotion detection
 */
export const useDriverEmotionAI = (refreshRate = DEFAULT_REFRESH_RATE) => {
  // References to HTML elements
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  // Reference to detection interval
  const detectionIntervalRef = useRef<number | null>(null);
  
  // References to models
  const emotionModelRef = useRef<EmotionModelAdapter | null>(null);
  
  // State for detection status
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // State for detected emotions
  const [currentEmotion, setCurrentEmotion] = useState<MappedEmotion>('neutral');
  const [attentionScore, setAttentionScore] = useState<number>(100);
  const [faceDetected, setFaceDetected] = useState<boolean>(false);
  const [eyesOpen, setEyesOpen] = useState<boolean>(true);
  const [emotionScores, setEmotionScores] = useState<Record<MappedEmotion, number>>({
    'neutral': 1,
    'happy': 0,
    'sad': 0,
    'angry': 0,
    'anxious': 0,
    'tired': 0,
    'distracted': 0,
    'no-face': 0
  });
  
  // Timestamp of last update
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  /**
   * Initialize emotion model
   */
  const initializeEmotionModel = useCallback(async () => {
    try {
      if (!emotionModelRef.current) {
        emotionModelRef.current = new EmotionModelAdapter();
      }
      
      await emotionModelRef.current.loadModels();
      console.log('Emotion model initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize emotion model:', error);
      setError('Failed to initialize emotion detection model. Please try again.');
      return false;
    }
  }, []);
  
  /**
   * Initialize the webcam stream
   */
  const initializeCamera = useCallback(async () => {
    try {
      // Check if already initialized
      if (streamRef.current) {
        return true;
      }
      
      // Request camera access
      const constraints = {
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      // Set video source
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Wait for video to be ready
        await new Promise<void>((resolve) => {
          if (videoRef.current) {
            videoRef.current.onloadedmetadata = () => {
              if (videoRef.current) {
                videoRef.current.play().then(() => resolve()).catch(e => {
                  console.error('Error playing video:', e);
                  setError('Failed to play video stream. Please try again.');
                });
              }
            };
          } else {
            resolve();
          }
        });
      }
      
      console.log('Camera initialized successfully');
      return true;
    } catch (error) {
      console.error('Error accessing camera:', error);
      
      // Provide a user-friendly error message
      if (error instanceof DOMException) {
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          setError('Camera access denied. Please allow camera access to use emotion detection.');
        } else if (error.name === 'NotFoundError') {
          setError('No camera found. Please make sure your device has a working camera.');
        } else if (error.name === 'NotReadableError' || error.name === 'AbortError') {
          setError('Cannot access camera. It may be in use by another application.');
        } else {
          setError(`Camera error: ${error.message}`);
        }
      } else {
        setError('Failed to access camera. Please check your device and permissions.');
      }
      
      return false;
    }
  }, []);
  
  /**
   * Process a single frame for emotion detection
   */
  const processFrame = useCallback(async () => {
    if (!videoRef.current || !emotionModelRef.current || !canvasRef.current) {
      return;
    }
    
    try {
      // Process the current video frame
      const emotionData = await emotionModelRef.current.processFrame(videoRef.current);
      
      // Update state with detection results
      setCurrentEmotion(emotionData.primaryEmotion);
      setAttentionScore(emotionData.attentionScore);
      setFaceDetected(emotionData.faceDetected);
      setEyesOpen(emotionData.eyesOpen);
      setEmotionScores(emotionData.scores);
      setLastUpdated(new Date());
      
      // If canvas is available, draw the detection overlay
      if (canvasRef.current) {
        drawDetectionOverlay(canvasRef.current, emotionData);
      }
    } catch (error) {
      console.error('Error processing frame:', error);
    }
  }, []);
  
  /**
   * Draw detection overlay on canvas
   */
  const drawDetectionOverlay = (canvas: HTMLCanvasElement, emotionData: any) => {
    const ctx = canvas.getContext('2d');
    if (!ctx || !videoRef.current) return;
    
    // Clear previous drawings
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // If no face detected, don't draw anything
    if (!emotionData.faceDetected) return;
    
    // Get video dimensions
    const videoWidth = videoRef.current.videoWidth;
    const videoHeight = videoRef.current.videoHeight;
    
    // Calculate scale factors
    const scaleX = canvas.width / videoWidth;
    const scaleY = canvas.height / videoHeight;
    
    // Draw bounding box if we have face detection data
    if (emotionData.faceBox) {
      const { x, y, width, height } = emotionData.faceBox;
      
      // Scale coordinates to canvas size
      const boxX = x * scaleX;
      const boxY = y * scaleY;
      const boxWidth = width * scaleX;
      const boxHeight = height * scaleY;
      
      // Choose color based on attention score
      let boxColor = '#4ade80'; // Green for good attention
      if (emotionData.attentionScore < 40) {
        boxColor = '#ef4444'; // Red for poor attention
      } else if (emotionData.attentionScore < 70) {
        boxColor = '#f59e0b'; // Yellow for medium attention
      }
      
      // Draw face bounding box
      ctx.strokeStyle = boxColor;
      ctx.lineWidth = 2;
      ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);
      
      // Add indicator for primary emotion
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(boxX, boxY - 25, boxWidth, 25);
      ctx.fillStyle = boxColor;
      ctx.font = '16px Arial';
      ctx.fillText(
        emotionData.primaryEmotion.charAt(0).toUpperCase() + emotionData.primaryEmotion.slice(1),
        boxX + 5, 
        boxY - 7
      );
      
      // Draw eyes indicators if available
      if (emotionData.eyePositions) {
        for (const eye of emotionData.eyePositions) {
          const eyeX = eye.x * scaleX;
          const eyeY = eye.y * scaleY;
          
          // Draw circle for eye
          ctx.beginPath();
          ctx.arc(eyeX, eyeY, 5, 0, 2 * Math.PI);
          ctx.fillStyle = emotionData.eyesOpen ? '#4ade80' : '#ef4444';
          ctx.fill();
        }
      }
    }
  };
  
  /**
   * Start emotion detection
   */
  const startDetection = useCallback(async () => {
    // Reset any previous state
    setError(null);
    setIsLoading(true);
    
    // Stop any existing intervals
    if (detectionIntervalRef.current) {
      window.clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
    
    try {
      // Initialize models
      const modelInitialized = await initializeEmotionModel();
      if (!modelInitialized) {
        throw new Error('Failed to initialize models');
      }
      
      // Initialize camera
      const cameraInitialized = await initializeCamera();
      if (!cameraInitialized) {
        throw new Error('Failed to initialize camera');
      }
      
      // Process initial frame
      await processFrame();
      
      // Set up interval for continuous detection
      detectionIntervalRef.current = window.setInterval(processFrame, refreshRate);
      
      // Update state
      setIsInitialized(true);
      setIsLoading(false);
    } catch (error) {
      console.error('Error starting detection:', error);
      setIsInitialized(false);
      setIsLoading(false);
      if (error instanceof Error && !error.message.includes('Failed to')) {
        setError('Failed to start emotion detection. Please try again.');
      }
    }
  }, [initializeEmotionModel, initializeCamera, processFrame, refreshRate]);
  
  /**
   * Stop emotion detection
   */
  const stopDetection = useCallback(() => {
    // Clear detection interval
    if (detectionIntervalRef.current) {
      window.clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
    
    // Stop and release camera stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    // Clear video source
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    // Update state
    setIsInitialized(false);
  }, []);
  
  // Initialize detection on mount if autoStart is true
  useEffect(() => {
    startDetection();
    
    // Clean up on unmount
    return () => {
      stopDetection();
    };
  }, [startDetection, stopDetection]);
  
  // Update refresh rate if changed
  useEffect(() => {
    // Skip if not initialized
    if (!isInitialized || !detectionIntervalRef.current) return;
    
    // Update interval
    window.clearInterval(detectionIntervalRef.current);
    detectionIntervalRef.current = window.setInterval(processFrame, refreshRate);
    
    // Clean up on unmount
    return () => {
      if (detectionIntervalRef.current) {
        window.clearInterval(detectionIntervalRef.current);
      }
    };
  }, [refreshRate, isInitialized, processFrame]);
  
  return {
    // State
    isInitialized,
    isLoading,
    error,
    currentEmotion,
    attentionScore,
    faceDetected,
    eyesOpen,
    emotionScores,
    lastUpdated,
    
    // Controls
    startDetection,
    stopDetection,
    
    // Refs
    videoRef,
    canvasRef
  };
};

// Export emotion types
export type { MappedEmotion } from '../utils/emotionModelAdapter';