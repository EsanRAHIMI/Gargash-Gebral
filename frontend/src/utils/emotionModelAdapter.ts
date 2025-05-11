// src/utils/emotionModelAdapter.ts
import * as tf from '@tensorflow/tfjs';
import * as blazeface from '@tensorflow-models/blazeface';

/**
 * Emotion types supported by the model
 */
export type RawEmotion = 
  | 'neutral' 
  | 'happy' 
  | 'sad' 
  | 'angry' 
  | 'fearful'
  | 'disgusted'
  | 'surprised';

/**
 * Our mapped emotion states
 */
export type MappedEmotion = 
  | 'neutral' 
  | 'happy' 
  | 'sad' 
  | 'angry' 
  | 'anxious' 
  | 'tired' 
  | 'distracted'
  | 'no-face';

/**
 * Face detection result with bounding box
 */
export interface FaceDetection {
  topLeft: [number, number];
  bottomRight: [number, number];
  landmarks: number[][];
  probability: number;
}

/**
 * Raw emotion scores from the model
 */
export interface EmotionScores {
  neutral: number;
  happy: number;
  sad: number;
  angry: number;
  fearful: number;
  disgusted: number;
  surprised: number;
}

/**
 * Eye position data
 */
export interface EyePosition {
  x: number;
  y: number;
  openProbability: number;
}

/**
 * Face bounding box
 */
export interface FaceBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Processed emotion data
 */
export interface EmotionData {
  primaryEmotion: MappedEmotion;
  scores: Record<MappedEmotion, number>;
  eyesOpen: boolean;
  attentionScore: number;
  faceDetected: boolean;
  eyePositions?: EyePosition[];
  faceBox?: FaceBox;
}

/**
 * Adapter class for handling TensorFlow.js emotion detection models
 */
export class EmotionModelAdapter {
  private faceDetector: blazeface.BlazeFaceModel | null = null;
  private isLoaded: boolean = false;
  private isLoading: boolean = false;
  private modelLoadError: string | null = null;
  
  // Tracking for blink detection
  private blinkHistory: boolean[] = [];
  private eyeOpenThreshold: number = 0.3;
  private blinkHistorySize: number = 10;
  
  // Tracking for distraction detection
  private facePositionHistory: { x: number, y: number }[] = [];
  private facePositionHistorySize: number = 5;
  private distractionThreshold: number = 30; // pixels

  /**
   * Initialize and load the required models
   * @returns Promise that resolves when models are loaded
   */
  public async loadModels(): Promise<void> {
    // Skip if already loaded or loading
    if (this.isLoaded || this.isLoading) {
      return;
    }

    this.isLoading = true;
    this.modelLoadError = null;

    try {
      // Ensure TensorFlow.js is initialized
      if (tf.getBackend() !== 'webgl') {
        await tf.setBackend('webgl');
      }
      console.log('Using TensorFlow.js backend:', tf.getBackend());

      // Load BlazeFace model for face detection
      this.faceDetector = await blazeface.load();
      console.log('Face detection model loaded');

      this.isLoaded = true;
      console.log('All models loaded successfully');
    } catch (error) {
      console.error('Error loading models:', error);
      this.modelLoadError = error instanceof Error ? error.message : 'Unknown error loading models';
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Process a video frame to detect faces and emotions
   * @param video HTML video element containing the camera feed
   * @returns Promise with emotion data
   */
  public async processFrame(video: HTMLVideoElement): Promise<EmotionData> {
    // Ensure models are loaded
    if (!this.isLoaded) {
      throw new Error('Models not loaded. Call loadModels() first.');
    }

    if (!this.faceDetector) {
      throw new Error('Face detector not initialized properly.');
    }

    // Default response when no face is detected
    const noFaceResponse: EmotionData = {
      primaryEmotion: 'no-face',
      scores: this.createDefaultScores(),
      eyesOpen: false,
      attentionScore: 0,
      faceDetected: false
    };

    try {
      // Detect faces in the video frame
      const predictions = await this.faceDetector.estimateFaces(video);

      // Return default response if no faces detected
      if (!predictions || predictions.length === 0) {
        this.updateBlinkHistory(false); // No face = eyes closed
        return noFaceResponse;
      }

      // Process the largest face (assumed to be the driver)
      // Convert blazeface prediction to our format
      const prediction = predictions[0];
      
      // Extract face bounding box
      const topLeft = prediction.topLeft as [number, number];
      const bottomRight = prediction.bottomRight as [number, number];
      const width = bottomRight[0] - topLeft[0];
      const height = bottomRight[1] - topLeft[1];
      
      const faceBox: FaceBox = {
        x: topLeft[0],
        y: topLeft[1],
        width: width,
        height: height
      };
      
      // Track face position for distraction detection
      this.updateFacePositionHistory({
        x: topLeft[0] + width / 2, 
        y: topLeft[1] + height / 2
      });
      
      // Extract landmarks (especially eyes)
      const landmarks = prediction.landmarks as number[][];
      if (!landmarks || landmarks.length < 2) {
        throw new Error('Invalid landmarks data');
      }
      const leftEye = landmarks[1] as [number, number];
      const rightEye = landmarks[0] as [number, number];
      
      // Estimate if eyes are open based on face aspect ratio and other heuristics
      const eyesOpen = this.estimateEyesOpen(prediction);
      this.updateBlinkHistory(eyesOpen);
      
      // Extract eye positions for visualization
      const eyePositions: EyePosition[] = [
        { x: leftEye[0], y: leftEye[1], openProbability: eyesOpen ? 0.9 : 0.1 },
        { x: rightEye[0], y: rightEye[1], openProbability: eyesOpen ? 0.9 : 0.1 }
      ];
      
      // Simulate emotion classification since we don't have a real emotion model
      const emotionScores = this.simulateEmotionClassification(prediction, eyesOpen);
      
      // Map raw emotions to our emotion states
      const mappedScores = this.mapEmotionScores(emotionScores);
      
      // Check for distraction
      const isDistracted = this.checkForDistraction();
      if (isDistracted) {
        mappedScores.distracted = Math.max(mappedScores.distracted, 0.7);
      }
      
      // Check for tiredness based on blink frequency
      const isTired = this.checkForTiredness();
      if (isTired) {
        mappedScores.tired = Math.max(mappedScores.tired, 0.7);
      }
      
      // Determine primary emotion (highest score)
      const primaryEmotion = this.getPrimaryEmotion(mappedScores);
      
      // Calculate attention score
      const attentionScore = this.calculateAttentionScore(mappedScores, eyesOpen);

      return {
        primaryEmotion,
        scores: mappedScores,
        eyesOpen,
        attentionScore,
        faceDetected: true,
        eyePositions,
        faceBox
      };
    } catch (error) {
      console.error('Error processing video frame:', error);
      return noFaceResponse;
    }
  }

  /**
   * Estimate if eyes are open based on face landmarks
   * @param face Face detection with landmarks
   * @returns Boolean indicating if eyes are open
   */
  private estimateEyesOpen(face: blazeface.NormalizedFace): boolean {
    // In a real implementation, we would analyze eye landmarks in detail
    // For this prototype, we'll use a combination of heuristics:
    
    // 1. Use face aspect ratio as a proxy (eyes closed tends to make face appear narrower)
    const topLeft = face.topLeft as [number, number];
    const bottomRight = face.bottomRight as [number, number];
    const width = bottomRight[0] - topLeft[0];
    const height = bottomRight[1] - topLeft[1];
    const aspectRatio = width / height;
    
    // 2. Add some randomness but bias toward open eyes (more realistic)
    const randomFactor = Math.random() * 0.2;
    
    // Eyes are likely closed if aspect ratio is smaller than typical + random factor
    // This threshold would need calibration in a real system
    const isLikelyClosed = aspectRatio < 0.85 + randomFactor;
    
    // 3. Add time-based variation (simulate occasional blinks)
    const timeBased = (Date.now() % 5000) > 4800; // Blink briefly every 5 seconds
    
    // Combine factors - closed if aspect ratio suggests closed OR if it's blink time
    return !(isLikelyClosed || timeBased);
  }
  
  /**
   * Update blink history to track patterns over time
   */
  private updateBlinkHistory(eyesOpen: boolean): void {
    this.blinkHistory.push(eyesOpen);
    if (this.blinkHistory.length > this.blinkHistorySize) {
      this.blinkHistory.shift();
    }
  }
  
  /**
   * Check for tiredness based on blink patterns
   */
  private checkForTiredness(): boolean {
    // If we don't have enough history, return false
    if (this.blinkHistory.length < this.blinkHistorySize) {
      return false;
    }
    
    // Count closed eyes in history
    const closedCount = this.blinkHistory.filter(open => !open).length;
    
    // If more than 30% of recent frames show closed eyes, probably tired
    return closedCount > this.blinkHistorySize * 0.3;
  }
  
  /**
   * Update face position history to track movement over time
   */
  private updateFacePositionHistory(position: { x: number, y: number }): void {
    this.facePositionHistory.push(position);
    if (this.facePositionHistory.length > this.facePositionHistorySize) {
      this.facePositionHistory.shift();
    }
  }
  
  /**
   * Check for distraction based on face movement patterns
   */
  private checkForDistraction(): boolean {
    // If we don't have enough history, return false
    if (this.facePositionHistory.length < this.facePositionHistorySize) {
      return false;
    }
    
    // Calculate movement between frames
    let totalMovement = 0;
    for (let i = 1; i < this.facePositionHistory.length; i++) {
      const prev = this.facePositionHistory[i - 1];
      const curr = this.facePositionHistory[i];
      
      // Calculate distance between consecutive positions
      const dx = curr.x - prev.x;
      const dy = curr.y - prev.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      totalMovement += distance;
    }
    
    // Average movement per frame
    const avgMovement = totalMovement / (this.facePositionHistory.length - 1);
    
    // If movement is above threshold, probably distracted
    return avgMovement > this.distractionThreshold;
  }

  /**
   * Simulate emotion classification for testing (without a real model)
   * @param face Face detection result
   * @param eyesOpen Whether eyes are detected as open
   * @returns Simulated emotion scores
   */
  private simulateEmotionClassification(face: blazeface.NormalizedFace, eyesOpen: boolean): EmotionScores {
    // Base probabilities (will be normalized)
    let scores: EmotionScores = {
      neutral: 0.6,    // Most of the time, fairly neutral
      happy: 0.1,      // Sometimes happy
      sad: 0.05,       // Occasionally sad
      angry: 0.05,     // Occasionally angry
      fearful: 0.05,   // Occasionally fearful
      disgusted: 0.05, // Occasionally disgusted
      surprised: 0.1   // Sometimes surprised
    };
    
    // Add time-based variations to make it more dynamic
    const time = Date.now();
    const cycle = (time % 60000) / 60000; // 0-1 over a minute
    
    // Long cycle variations
    if (cycle < 0.2) {
      // More likely to be neutral/happy at the start of the cycle
      scores.neutral += 0.2;
      scores.happy += 0.1;
    } else if (cycle < 0.4) {
      // Then trending toward surprise
      scores.surprised += 0.2;
      scores.neutral -= 0.1;
    } else if (cycle < 0.6) {
      // Then maybe some negative emotions
      scores.angry += 0.15;
      scores.disgusted += 0.05;
    } else if (cycle < 0.8) {
      // Then some sadness/fear
      scores.sad += 0.15;
      scores.fearful += 0.1;
    } else {
      // Back to neutral at the end
      scores.neutral += 0.3;
    }
    
    // Adjust based on eye state
    if (!eyesOpen) {
      // If eyes closed, increase tired-related emotions
      scores.neutral += 0.2;
      scores.surprised -= 0.05;
    }
    
    // Normalize to sum to 1.0
    const total = Object.values(scores).reduce((sum, val) => sum + val, 0);
    Object.keys(scores).forEach(key => {
      scores[key as keyof EmotionScores] /= total;
    });
    
    return scores;
  }

  /**
   * Map raw emotion scores to our emotion states
   * @param rawScores Raw emotion scores from the model
   * @returns Mapped emotion scores
   */
  private mapEmotionScores(rawScores: EmotionScores): Record<MappedEmotion, number> {
    return {
      'neutral': rawScores.neutral,
      'happy': rawScores.happy,
      'sad': rawScores.sad,
      'angry': rawScores.angry,
      'anxious': (rawScores.fearful + rawScores.disgusted) / 2,
      'tired': (rawScores.neutral * 0.3) + (rawScores.surprised * 0.7),
      'distracted': 0.1, // Would be based on gaze direction in a real implementation
      'no-face': 0
    };
  }

  /**
   * Get the primary emotion (highest score)
   * @param scores Mapped emotion scores
   * @returns Primary emotion
   */
  private getPrimaryEmotion(scores: Record<MappedEmotion, number>): MappedEmotion {
    let maxScore = -1;
    let primaryEmotion: MappedEmotion = 'neutral';

    // Find emotion with highest score
    for (const [emotion, score] of Object.entries(scores)) {
      if (emotion !== 'no-face' && score > maxScore) {
        maxScore = score;
        primaryEmotion = emotion as MappedEmotion;
      }
    }

    return primaryEmotion;
  }

  /**
   * Calculate attention score based on emotions and eye state
   * @param scores Emotion scores
   * @param eyesOpen Boolean indicating if eyes are open
   * @returns Attention score (0-100)
   */
  private calculateAttentionScore(scores: Record<MappedEmotion, number>, eyesOpen: boolean): number {
    // Start with base score
    let score = 100;

    // Reduce score for concerning emotions
    if (scores.angry > 0.4) score -= 30;
    if (scores.tired > 0.4) score -= 40;
    if (scores.sad > 0.3) score -= 15;
    if (scores.anxious > 0.4) score -= 20;
    if (scores.distracted > 0.3) score -= 35;
    
    // Eyes closed is a major attention issue
    if (!eyesOpen) score -= 50;

    // Ensure score stays within 0-100 range
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Create default scores with all zeros
   * @returns Default emotion scores
   */
  private createDefaultScores(): Record<MappedEmotion, number> {
    return {
      'neutral': 0,
      'happy': 0,
      'sad': 0,
      'angry': 0,
      'anxious': 0,
      'tired': 0,
      'distracted': 0,
      'no-face': 1 // Set to 1 for no-face state
    };
  }

  /**
   * Get loading status
   * @returns Boolean indicating if models are currently loading
   */
  public isModelLoading(): boolean {
    return this.isLoading;
  }

  /**
   * Get model loaded status
   * @returns Boolean indicating if models are loaded
   */
  public isModelLoaded(): boolean {
    return this.isLoaded;
  }

  /**
   * Get model loading error
   * @returns Error message or null if no error
   */
  public getModelLoadError(): string | null {
    return this.modelLoadError;
  }
}

export default EmotionModelAdapter;