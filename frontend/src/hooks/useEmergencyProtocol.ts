// src/hooks/useEmergencyProtocol.ts
import { useState, useRef, useCallback, useEffect } from 'react';
import speechProcessor from '../utils/speechProcessor';

interface EmergencyContact {
  name: string;
  phoneNumber: string;
  relation: string;
}

interface EmergencyState {
  isActive: boolean;
  countdownSeconds: number;
  notificationSent: boolean;
  location: {
    latitude: number | null;
    longitude: number | null;
    timestamp: Date | null;
  };
  emergencyContacts: EmergencyContact[];
}

/**
 * Hook for managing emergency protocols when driver becomes unresponsive
 * @param countdownDuration Duration of countdown in seconds before emergency is triggered
 */
export const useEmergencyProtocol = (countdownDuration: number = 30) => {
  // Emergency state
  const [state, setState] = useState<EmergencyState>({
    isActive: false,
    countdownSeconds: countdownDuration,
    notificationSent: false,
    location: {
      latitude: null,
      longitude: null,
      timestamp: null
    },
    emergencyContacts: [
      { name: 'Emergency Services', phoneNumber: '911', relation: 'Emergency' },
      { name: 'John Smith', phoneNumber: '+1234567890', relation: 'Family' },
      { name: 'Sarah Johnson', phoneNumber: '+1987654321', relation: 'Friend' }
    ]
  });
  
  // Refs for intervals and timeouts
  const countdownIntervalRef = useRef<number | null>(null);
  const emergencyTimeoutRef = useRef<number | null>(null);
  const lastAlertTimeRef = useRef<Date | null>(null);
  
  // Cancel active countdowns and resets
  const clearActiveTimers = useCallback(() => {
    if (countdownIntervalRef.current) {
      window.clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    
    if (emergencyTimeoutRef.current) {
      window.clearTimeout(emergencyTimeoutRef.current);
      emergencyTimeoutRef.current = null;
    }
  }, []);
  
  /**
   * Start emergency countdown
   */
  const startEmergencyCountdown = useCallback(() => {
    // Don't start if already active
    if (state.isActive) return;
    
    // Don't re-trigger too frequently
    if (lastAlertTimeRef.current) {
      const timeSinceLastAlert = new Date().getTime() - lastAlertTimeRef.current.getTime();
      if (timeSinceLastAlert < 5000) return; // 5 second cooldown
    }
    
    // Clear any existing timers
    clearActiveTimers();
    
    // Reset state
    setState(prev => ({
      ...prev,
      isActive: true,
      countdownSeconds: countdownDuration,
      notificationSent: false
    }));
    
    // Play initial alert
    playEmergencyAlert("Attention required. Please respond or emergency protocol will activate.");
    
    // Start countdown interval
    countdownIntervalRef.current = window.setInterval(() => {
      setState(prev => {
        // If countdown reaches 0, stop interval and send notification
        if (prev.countdownSeconds <= 1) {
          if (countdownIntervalRef.current) {
            window.clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
          }
          
          // Trigger location capture and notification after countdown
          captureLocationAndNotify();
          
          return {
            ...prev,
            countdownSeconds: 0
          };
        }
        
        // Every 10 seconds, play another alert
        if (prev.countdownSeconds % 10 === 0) {
          playEmergencyAlert(`Emergency protocol activating in ${prev.countdownSeconds} seconds. Please respond.`);
        }
        
        // Decrement countdown
        return {
          ...prev,
          countdownSeconds: prev.countdownSeconds - 1
        };
      });
    }, 1000);
    
    // Update last alert time
    lastAlertTimeRef.current = new Date();
  }, [countdownDuration, state.isActive, clearActiveTimers]);
  
  /**
   * Play emergency alert using speech synthesis
   */
  const playEmergencyAlert = async (message: string) => {
    try {
      await speechProcessor.speak(message, {
        voice: 'shimmer',
        speed: 1.2,
        model: 'tts-1'
      });
    } catch (error) {
      console.error('Error playing emergency alert:', error);
    }
  };
  
  /**
   * Capture location and notify emergency contacts
   */
  const captureLocationAndNotify = useCallback(async () => {
    try {
      // Check if geolocation is available
      if (navigator.geolocation) {
        // Get current position
        navigator.geolocation.getCurrentPosition(
          (position) => {
            // Update state with location
            setState(prev => ({
              ...prev,
              location: {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                timestamp: new Date()
              }
            }));
            
            // Send notification (simulated)
            sendEmergencyNotification(
              position.coords.latitude,
              position.coords.longitude
            );
          },
          (error) => {
            console.error('Error getting location:', error);
            
            // Send notification with unknown location
            sendEmergencyNotification(null, null);
          }
        );
      } else {
        console.error('Geolocation not supported');
        
        // Send notification with unknown location
        sendEmergencyNotification(null, null);
      }
    } catch (error) {
      console.error('Error in location capture:', error);
      
      // Send notification with unknown location
      sendEmergencyNotification(null, null);
    }
  }, []);
  
  /**
   * Send emergency notification to contacts (simulated)
   */
  const sendEmergencyNotification = useCallback(async (
    latitude: number | null,
    longitude: number | null
  ) => {
    try {
      // Play final emergency message
      await playEmergencyAlert("Driver unresponsive. Emergency contacts being notified with your current location.");
      
      // Set notification as sent
      setState(prev => ({
        ...prev,
        notificationSent: true
      }));
      
      // In a real implementation, this would send notifications
      // to emergency contacts and/or emergency services
      console.log('EMERGENCY NOTIFICATION SENT:');
      console.log('Location:', latitude, longitude);
      console.log('Contacts:', state.emergencyContacts);
      
      // Show alert in browser for demo purposes
      setTimeout(() => {
        alert('EMERGENCY DEMO: Notifications would be sent to emergency contacts.');
      }, 2000);
      
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }, [state.emergencyContacts]);
  
  /**
   * Handle driver response to emergency
   */
  const handleDriverResponse = useCallback(() => {
    // If no emergency is active, do nothing
    if (!state.isActive) return;
    
    // Clear active timers
    clearActiveTimers();
    
    // Reset state
    setState(prev => ({
      ...prev,
      isActive: false,
      countdownSeconds: countdownDuration,
      notificationSent: false
    }));
    
    // Play confirmation message
    playEmergencyAlert("Emergency protocol canceled. Thank you for responding.");
  }, [state.isActive, countdownDuration, clearActiveTimers]);
  
  /**
   * Force reset emergency state (for testing)
   */
  const resetEmergencyState = useCallback(() => {
    // Clear active timers
    clearActiveTimers();
    
    // Reset state
    setState(prev => ({
      ...prev,
      isActive: false,
      countdownSeconds: countdownDuration,
      notificationSent: false
    }));
  }, [countdownDuration, clearActiveTimers]);
  
  /**
   * Add emergency contact
   */
  const addEmergencyContact = useCallback((contact: EmergencyContact) => {
    setState(prev => ({
      ...prev,
      emergencyContacts: [...prev.emergencyContacts, contact]
    }));
  }, []);
  
  /**
   * Remove emergency contact
   */
  const removeEmergencyContact = useCallback((index: number) => {
    setState(prev => ({
      ...prev,
      emergencyContacts: prev.emergencyContacts.filter((_, i) => i !== index)
    }));
  }, []);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      clearActiveTimers();
    };
  }, [clearActiveTimers]);
  
  return {
    state,
    startEmergencyCountdown,
    handleDriverResponse,
    resetEmergencyState,
    addEmergencyContact,
    removeEmergencyContact
  };
};

export default useEmergencyProtocol;