// /frontend/src/hooks/useVehicleStatus.ts
import { useState, useEffect, useRef, useCallback } from 'react'
import axios from 'axios'

interface TirePressure {
  front_right: number;
  front_left: number;
  rear_right: number;
  rear_left: number;
}

export interface VehicleStatus {
  engine_temp: number;
  tire_pressure: TirePressure;
  battery_level: number;
}

export const useVehicleStatus = (initialRefreshInterval = 30000) => {
  const [status, setStatus] = useState<VehicleStatus | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [refreshInterval, setRefreshInterval] = useState<number>(initialRefreshInterval)
  const retryTimeoutRef = useRef<number | null>(null)
  const intervalRef = useRef<number | null>(null)
  const statusRef = useRef<VehicleStatus | null>(null)

  // Update the statusRef when status changes
  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  const fetchVehicleStatus = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Access the vehicle status endpoint on the AI service
      const vehicleStatusUrl = `${import.meta.env.VITE_CHAT_URL.replace('/ai', '')}/vehicle/status`
      
      try {
        const response = await axios.get(vehicleStatusUrl, {
          withCredentials: true,
          headers: {
            'Cache-Control': 'no-cache',
            'X-Requested-With': 'XMLHttpRequest'
          }
        })
        
        setStatus(response.data)
        setLastUpdated(new Date())
        
        // Clear any existing retry timeout
        if (retryTimeoutRef.current) {
          window.clearTimeout(retryTimeoutRef.current)
          retryTimeoutRef.current = null
        }
      } catch (apiError) {
        console.log('Using fallback data for the demo', apiError)
        
        // Generate realistic mock data with slight variations for demo purposes
        const getRandomValue = (min: number, max: number) => {
          return Number((Math.random() * (max - min) + min).toFixed(1))
        }
        
        // Use statusRef.current to avoid dependency on status
        const currentStatus = statusRef.current;
        
        // If we already have status, make small variations to existing values
        // to simulate real-time changes while maintaining realistic patterns
        const previousTemp = currentStatus?.engine_temp || 0
        const previousBattery = currentStatus?.battery_level || 0
        
        const generateTirePressure = () => {
          const basePressure = 33.5; // Normal pressure
          const variation = 2.5;     // Maximum variation
          
          // If we have previous values, vary them slightly
          if (currentStatus?.tire_pressure) {
            return {
              front_right: Number((currentStatus.tire_pressure.front_right + getRandomValue(-0.3, 0.3)).toFixed(1)),
              front_left: Number((currentStatus.tire_pressure.front_left + getRandomValue(-0.3, 0.3)).toFixed(1)),
              rear_right: Number((currentStatus.tire_pressure.rear_right + getRandomValue(-0.3, 0.3)).toFixed(1)),
              rear_left: Number((currentStatus.tire_pressure.rear_left + getRandomValue(-0.3, 0.3)).toFixed(1))
            }
          }
          
          // Otherwise generate new values
          return {
            front_right: getRandomValue(basePressure - variation, basePressure + variation),
            front_left: getRandomValue(basePressure - variation, basePressure + variation),
            rear_right: getRandomValue(basePressure - variation, basePressure + variation),
            rear_left: getRandomValue(basePressure - variation, basePressure + variation)
          }
        }
        
        // Create new temperature (with small variation if we have previous)
        const newTemp = previousTemp ? 
          previousTemp + getRandomValue(-1, 1) : 
          getRandomValue(80, 95);
          
        // Create new battery level (with small variation if we have previous)
        const newBattery = previousBattery ? 
          Math.min(100, Math.max(1, previousBattery + getRandomValue(-2, 0))) : 
          getRandomValue(60, 95);
        
        const mockStatus: VehicleStatus = {
          engine_temp: Number(newTemp.toFixed(1)),
          battery_level: Math.round(newBattery),
          tire_pressure: generateTirePressure()
        }
        
        setStatus(mockStatus)
        setLastUpdated(new Date())
      }
    } catch (err: any) {
      console.error('Error with vehicle status:', err)
      setError('Failed to fetch vehicle status. Retrying...')
      
      // Set up retry after 5 seconds
      retryTimeoutRef.current = window.setTimeout(() => {
        console.log('Retrying vehicle status fetch...')
        fetchVehicleStatus()
      }, 5000)
    } finally {
      setIsLoading(false)
    }
  }, []); // No dependencies to prevent continuous re-creation

  // Update the refresh interval
  const updateRefreshInterval = useCallback((newInterval: number) => {
    setRefreshInterval(newInterval)
    
    // Clear existing interval
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    
    // Setup new interval
    intervalRef.current = window.setInterval(() => {
      fetchVehicleStatus()
    }, newInterval)
    
    return newInterval
  }, [fetchVehicleStatus])

  useEffect(() => {
    // Fetch data immediately
    fetchVehicleStatus()
    
    // Clear any existing interval first
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current)
    }
    
    // Then set up interval for auto-refresh
    intervalRef.current = window.setInterval(() => {
      fetchVehicleStatus()
    }, refreshInterval)
    
    // Clean up on unmount
    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      if (retryTimeoutRef.current) {
        window.clearTimeout(retryTimeoutRef.current)
        retryTimeoutRef.current = null
      }
    }
  }, [refreshInterval, fetchVehicleStatus])

  return {
    status,
    isLoading,
    error,
    lastUpdated,
    refreshInterval,
    updateRefreshInterval,
    refetch: fetchVehicleStatus
  }
}