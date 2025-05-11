// /frontend/src/components/VehicleHealthCard.tsx
import { useVehicleStatus } from '../hooks/useVehicleStatus'
import VehicleGraphic from './VehicleGraphic'
import React, { useState, useEffect } from 'react'
import LoadingSpinner from './LoadingSpinner'

const VehicleHealthCard = () => {
  const { 
    status, 
    isLoading, 
    error, 
    lastUpdated, 
    refreshInterval: currentRefreshInterval,
    updateRefreshInterval,
    refetch 
  } = useVehicleStatus(30000) // 30 seconds refresh
  
  const [selectedInterval, setSelectedInterval] = useState<number>(30000);

  // Handle refresh interval change
  const handleRefreshChange = (interval: number) => {
    setSelectedInterval(interval);
    updateRefreshInterval(interval);
  };

  // Set initial selected interval when the component mounts
  useEffect(() => {
    if (currentRefreshInterval) {
      setSelectedInterval(currentRefreshInterval);
    }
  }, [currentRefreshInterval]);

  return (
    <div className="bg-white dark:bg-slate-900 overflow-hidden shadow-xl rounded-xl border border-gray-100 dark:border-gray-800">
      <div className="px-6 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="bg-indigo-600 p-2 rounded-lg mr-3 shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Vehicle Health Status</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Real-time diagnostics and monitoring</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <button
                onClick={() => handleRefreshChange(15000)}
                className={`px-2 py-1 text-xs rounded-md ${selectedInterval === 15000 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}
              >
                15s
              </button>
              <button
                onClick={() => handleRefreshChange(30000)}
                className={`px-2 py-1 text-xs rounded-md ${selectedInterval === 30000 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}
              >
                30s
              </button>
              <button
                onClick={() => handleRefreshChange(60000)}
                className={`px-2 py-1 text-xs rounded-md ${selectedInterval === 60000 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}
              >
                60s
              </button>
            </div>
            <button
              onClick={() => refetch()}
              className={`inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white ${isLoading ? 'bg-indigo-500' : 'bg-indigo-600 hover:bg-indigo-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors`}
              disabled={isLoading}
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              )}
            </button>
          </div>
        </div>
        
        {isLoading && !status && (
          <div className="text-center py-16 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-100 dark:border-gray-700">
            <LoadingSpinner size="lg" color="primary" />
            <p className="mt-4 text-gray-500 dark:text-gray-400 font-medium">Loading vehicle diagnostics...</p>
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-xl mb-6 border-l-4 border-red-500 dark:border-red-700">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-red-400 dark:text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-red-800 dark:text-red-400">{error}</h3>
                <p className="mt-2 text-sm text-red-700 dark:text-red-300">We're experiencing difficulties connecting to your vehicle. Retrying automatically...</p>
                <button 
                  onClick={() => refetch()} 
                  className="mt-3 inline-flex items-center px-3 py-1.5 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}
        
        {status && (
          <div>
            {/* Vehicle Graphic with Status */}
            {status.engine_temp !== undefined && 
             status.battery_level !== undefined && 
             status.tire_pressure && 
             Object.keys(status.tire_pressure).length === 4 &&
             typeof status.engine_temp === 'number' && !isNaN(status.engine_temp) &&
             typeof status.battery_level === 'number' && !isNaN(status.battery_level) &&
             typeof status.tire_pressure.front_left === 'number' && !isNaN(status.tire_pressure.front_left) &&
             typeof status.tire_pressure.front_right === 'number' && !isNaN(status.tire_pressure.front_right) &&
             typeof status.tire_pressure.rear_left === 'number' && !isNaN(status.tire_pressure.rear_left) &&
             typeof status.tire_pressure.rear_right === 'number' && !isNaN(status.tire_pressure.rear_right) ? (
              <VehicleGraphic 
                engineTemp={status.engine_temp}
                batteryLevel={status.battery_level}
                tirePressure={status.tire_pressure}
              />
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">داده‌های خودرو ناقص است. لطفاً دوباره تلاش کنید.</p>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-center text-indigo-600 dark:text-indigo-400 mb-3 sm:mb-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium">Vehicle diagnostics refresh every {selectedInterval/1000}s</span>
              </div>
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Last updated: {lastUpdated ? lastUpdated.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'}) : 'Never'}
                {isLoading && status && <span className="ml-2 italic text-indigo-500 dark:text-indigo-400">Refreshing...</span>}
              </div>
            </div>
            
            {/* Additional Health Metrics (optional expandable section) */}
            <div className="mt-6">
              <HealthMetricsSection />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Optional expandable section for additional health metrics
const HealthMetricsSection: React.FC = () => {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <div className="border border-gray-100 dark:border-gray-800 rounded-lg overflow-hidden">
      <button 
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex justify-between items-center bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
      >
        <div className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <span className="font-medium text-gray-900 dark:text-white">Additional Diagnostics</span>
        </div>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className={`h-5 w-5 text-gray-500 transition-transform ${expanded ? 'transform rotate-180' : ''}`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {expanded && (
        <div className="p-4 bg-white dark:bg-slate-900 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Fuel Level */}
          <div className="bg-gray-50 dark:bg-slate-800 p-3 rounded-lg">
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Fuel Level</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">78%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '78%' }}></div>
            </div>
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">Estimated range: 450 km</div>
          </div>
          
          {/* Oil Life */}
          <div className="bg-gray-50 dark:bg-slate-800 p-3 rounded-lg">
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Oil Life</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">65%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
              <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '65%' }}></div>
            </div>
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">Service due in: 5,200 km</div>
          </div>
          
          {/* Coolant Level */}
          <div className="bg-gray-50 dark:bg-slate-800 p-3 rounded-lg">
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Coolant Level</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">Normal</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '95%' }}></div>
            </div>
          </div>
          
          {/* Brake Pads */}
          <div className="bg-gray-50 dark:bg-slate-800 p-3 rounded-lg">
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Brake Pads</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">82%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '82%' }}></div>
            </div>
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">Front: 85% | Rear: 79%</div>
          </div>
          
          {/* Last Service */}
          <div className="md:col-span-2 bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span className="text-sm font-medium text-gray-900 dark:text-white">Last Service: 15 Mar 2025 at Gargash Motor Clinic</span>
            </div>
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex justify-between">
              <span>Next service recommended: 11 Jun 2025</span>
              <button className="text-indigo-600 dark:text-indigo-400 font-medium hover:text-indigo-700 dark:hover:text-indigo-300">
                Schedule Service
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleHealthCard;