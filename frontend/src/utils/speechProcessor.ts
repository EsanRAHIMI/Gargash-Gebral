// src/utils/speechProcessor.ts
import axios from 'axios';

// Add Web Speech API type declarations
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
  interpretation: any;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onaudioend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onaudiostart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onnomatch: ((this: SpeechRecognition, ev: Event) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onsoundend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onsoundstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onspeechend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onspeechstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

// Add Web Speech API type declaration
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

// Environment variables
const chatUrl = import.meta.env.VITE_CHAT_URL;

/**
 * Interface for speech synthesis options
 */
export interface SpeechSynthesisOptions {
  voice?: 'shimmer' | 'nova' | 'echo' | 'onyx' | 'fable';
  model?: 'tts-1' | 'tts-1-hd';
  speed?: number; // 0.25 to 4.0
}

/**
 * Interface for speech recognition options
 */
export interface SpeechRecognitionOptions {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
}

/**
 * Types of speech events
 */
export type SpeechEventType = 
  | 'start'        // Speech recognition/synthesis started
  | 'end'          // Speech recognition/synthesis ended
  | 'result'       // Speech recognition result
  | 'error'        // Error in speech processing
  | 'audiostart'   // Audio started
  | 'audioend'     // Audio ended
  | 'playing'      // Audio is playing
  | 'pause'        // Audio is paused
  | 'progress';    // Progress update

/**
 * Speech event with data
 */
export interface SpeechEvent {
  type: SpeechEventType;
  data?: any;
  timestamp: Date;
}

/**
 * Speech processor utility for text-to-speech and speech-to-text
 */
export class SpeechProcessor {
  private recognition: SpeechRecognition | null = null;
  private audioContext: AudioContext | null = null;
  private audioElement: HTMLAudioElement | null = null;
  private eventListeners: Map<SpeechEventType, Function[]> = new Map();
  private isListening: boolean = false;
  private isPlaying: boolean = false;
  private isBrowserSupportedForStt: boolean = false;
  private lastSynthesizedAudioUrl: string | null = null;

  constructor() {
    // Initialize audio context
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      console.warn('AudioContext not supported in this browser');
    }

    // Initialize audio element
    this.audioElement = new Audio();
    this.audioElement.addEventListener('playing', () => this.triggerEvent('playing'));
    this.audioElement.addEventListener('pause', () => this.triggerEvent('pause'));
    this.audioElement.addEventListener('ended', () => {
      this.isPlaying = false;
      this.triggerEvent('end');
    });
    this.audioElement.addEventListener('error', (e) => {
      this.isPlaying = false;
      this.triggerEvent('error', e);
    });

    // Check if browser supports speech recognition
    this.isBrowserSupportedForStt = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
  }

  /**
   * Check if speech recognition is supported
   * @returns Boolean indicating support
   */
  public isSpeechRecognitionSupported(): boolean {
    return this.isBrowserSupportedForStt;
  }

  /**
   * Start speech recognition
   * @param options Speech recognition options
   */
  public startListening(options: SpeechRecognitionOptions = {}): void {
    if (this.isListening) {
      this.stopListening();
    }

    if (!this.isBrowserSupportedForStt) {
      this.triggerEvent('error', new Error('Speech recognition not supported in this browser'));
      return;
    }

    try {
      // Initialize recognition
      const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();

      if (!this.recognition) {
        throw new Error('Failed to initialize speech recognition');
      }

      // Set options
      this.recognition.lang = options.language || 'en-US';
      this.recognition.continuous = options.continuous || false;
      this.recognition.interimResults = options.interimResults || false;

      // Set event handlers
      this.recognition.onstart = () => {
        this.isListening = true;
        this.triggerEvent('start');
      };

      this.recognition.onend = () => {
        this.isListening = false;
        this.triggerEvent('end');
      };

      this.recognition.onresult = (event) => {
        const result = event.results[event.results.length - 1];
        const transcript = result[0].transcript;
        this.triggerEvent('result', {
          transcript,
          isFinal: result.isFinal,
          confidence: result[0].confidence
        });
      };

      this.recognition.onerror = (event) => {
        this.triggerEvent('error', event.error);
      };

      // Start listening
      this.recognition.start();
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      this.triggerEvent('error', error);
    }
  }

  /**
   * Stop speech recognition
   */
  public stopListening(): void {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (error) {
        console.warn('Error stopping recognition:', error);
      }
      this.isListening = false;
    }
  }

  /**
   * Synthesize speech from text using the OpenAI API
   * @param text Text to convert to speech
   * @param options Speech synthesis options
   * @returns Promise with the audio URL
   */
  public async synthesizeSpeech(text: string, options: SpeechSynthesisOptions = {}): Promise<string> {
    try {
      this.triggerEvent('start');

      // Set default values
      const voice = options.voice || 'shimmer';
      const model = options.model || 'tts-1';
      const speed = options.speed || 1.0;

      // Call OpenAI TTS API through our backend endpoint
      const response = await axios.post(
        `${chatUrl}/synthesize`,
        { 
          text,
          voice,
          model,
          speed
        },
        {
          responseType: 'blob',
          withCredentials: true,
          headers: { 'Content-Type': 'application/json' }
        }
      );

      // Create URL for the audio blob
      const audioBlob = new Blob([response.data], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);

      // Store URL for cleanup
      this.lastSynthesizedAudioUrl = audioUrl;

      this.triggerEvent('end');
      return audioUrl;
    } catch (error) {
      console.error('Error synthesizing speech:', error);
      this.triggerEvent('error', error);
      throw error;
    }
  }

  /**
   * Play synthesized speech
   * @param audioUrl URL of audio to play
   * @returns Promise that resolves when audio starts playing
   */
  public async playSpeech(audioUrl: string): Promise<void> {
    if (!this.audioElement) {
      throw new Error('Audio element not initialized');
    }

    try {
      // Stop any current playback
      this.stopSpeech();

      // Set audio source
      this.audioElement.src = audioUrl;
      
      // Play audio
      this.triggerEvent('audiostart');
      this.isPlaying = true;
      
      await this.audioElement.play();
      this.triggerEvent('playing');
    } catch (error) {
      console.error('Error playing speech:', error);
      this.isPlaying = false;
      this.triggerEvent('error', error);
      throw error;
    }
  }

  /**
   * Stop playing speech
   */
  public stopSpeech(): void {
    if (this.audioElement && !this.audioElement.paused) {
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
      this.isPlaying = false;
      this.triggerEvent('audioend');
    }
  }

  /**
   * Transcribe audio from a file
   * @param audioFile File object containing audio
   * @returns Promise with the transcription
   */
  public async transcribeAudio(audioFile: File): Promise<string> {
    try {
      this.triggerEvent('start');

      // Create form data for the file
      const formData = new FormData();
      formData.append('file', audioFile);

      // Call transcription API
      const response = await axios.post(
        `${chatUrl}/transcribe`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true
        }
      );

      this.triggerEvent('end');
      return response.data.text;
    } catch (error) {
      console.error('Error transcribing audio:', error);
      this.triggerEvent('error', error);
      throw error;
    }
  }

  /**
   * Synthesize and play speech in one call
   * @param text Text to speak
   * @param options Speech synthesis options
   * @returns Promise that resolves when speech starts playing
   */
  public async speak(text: string, options: SpeechSynthesisOptions = {}): Promise<void> {
    try {
      const audioUrl = await this.synthesizeSpeech(text, options);
      await this.playSpeech(audioUrl);
    } catch (error) {
      console.error('Error in speak function:', error);
      throw error;
    }
  }

  /**
   * Add event listener
   * @param eventType Type of event to listen for
   * @param callback Function to call when event occurs
   */
  public addEventListener(eventType: SpeechEventType, callback: Function): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, []);
    }
    
    this.eventListeners.get(eventType)!.push(callback);
  }

  /**
   * Remove event listener
   * @param eventType Type of event
   * @param callback Function to remove
   */
  public removeEventListener(eventType: SpeechEventType, callback: Function): void {
    if (!this.eventListeners.has(eventType)) {
      return;
    }
    
    const listeners = this.eventListeners.get(eventType)!;
    const index = listeners.indexOf(callback);
    
    if (index !== -1) {
      listeners.splice(index, 1);
    }
  }

  /**
   * Trigger an event
   * @param eventType Type of event to trigger
   * @param data Optional data to pass to event handlers
   */
  private triggerEvent(eventType: SpeechEventType, data?: any): void {
    if (!this.eventListeners.has(eventType)) {
      return;
    }
    
    const event: SpeechEvent = {
      type: eventType,
      data,
      timestamp: new Date()
    };
    
    this.eventListeners.get(eventType)!.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        console.error(`Error in ${eventType} event listener:`, error);
      }
    });
  }

  /**
   * Check if currently listening
   * @returns Boolean indicating if speech recognition is active
   */
  public isRecognitionActive(): boolean {
    return this.isListening;
  }

  /**
   * Check if currently playing audio
   * @returns Boolean indicating if audio is playing
   */
  public isAudioPlaying(): boolean {
    return this.isPlaying;
  }

  /**
   * Clean up resources
   */
  public dispose(): void {
    // Stop recognition
    this.stopListening();
    
    // Stop audio
    this.stopSpeech();
    
    // Clear event listeners
    this.eventListeners.clear();
    
    // Release audio context
    if (this.audioContext) {
      this.audioContext.close().catch(console.error);
    }
    
    // Revoke any created object URLs
    if (this.lastSynthesizedAudioUrl) {
      URL.revokeObjectURL(this.lastSynthesizedAudioUrl);
    }
  }
}

// Create and export a singleton instance
const speechProcessor = new SpeechProcessor();
export default speechProcessor;