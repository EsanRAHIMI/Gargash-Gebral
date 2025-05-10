// /frontend/src/hooks/useVehicleStatus.ts
import { useState, useEffect } from 'react'
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

export const useVehicleStatus = (refreshInterval = 30000) => {
  const [status, setStatus] = useState<VehicleStatus | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const fetchVehicleStatus = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const vehicleStatusUrl = `${import.meta.env.VITE_BACKEND_URL}/vehicle/status`
      const response = await axios.get(vehicleStatusUrl, {
        withCredentials: true // Include cookies for authentication
      })
      
      setStatus(response.data)
    } catch (err: any) {
      console.error('Error fetching vehicle status:', err)
      setError('Failed to fetch vehicle status. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Fetch data immediately
    fetchVehicleStatus()
    
    // Then set up interval for auto-refresh
    const intervalId = setInterval(() => {
      fetchVehicleStatus()
    }, refreshInterval)
    
    // Clean up on unmount
    return () => clearInterval(intervalId)
  }, [refreshInterval])

  return {
    status,
    isLoading,
    error,
    refetch: fetchVehicleStatus
  }
}