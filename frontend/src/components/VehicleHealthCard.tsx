// /frontend/src/components/VehicleHealthCard.tsx
import { useVehicleStatus } from '../hooks/useVehicleStatus'
import VehicleGraphic from './VehicleGraphic'

const VehicleHealthCard = () => {
  const { status, isLoading, error, lastUpdated, refetch } = useVehicleStatus(30000) // 30 seconds refresh

  return (
    <div className="bg-white overflow-hidden shadow-lg rounded-lg border border-gray-100">
      <div className="px-6 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="bg-indigo-100 p-2 rounded-lg mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900">Vehicle Health Status</h3>
          </div>
          <div className="flex items-center">
            <span className="text-sm text-gray-500 mr-3">Auto-refresh: 30s</span>
            <button
              onClick={() => refetch()}
              className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              disabled={isLoading}
            >
              <svg className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>
        
        {isLoading && !status && (
          <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-100">
            <div className="spinner animate-spin inline-block w-10 h-10 border-4 rounded-full border-indigo-600 border-t-transparent"></div>
            <p className="mt-4 text-gray-500 font-medium">Loading vehicle data...</p>
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 p-4 rounded-md mb-6 border-l-4 border-red-500">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{error}</h3>
                <p className="mt-1 text-sm text-red-700">Retrying in 5 seconds...</p>
              </div>
            </div>
          </div>
        )}
        
        {status && (
          <div>
            {/* Vehicle Graphic with Status */}
            <VehicleGraphic 
              engineTemp={status.engine_temp}
              batteryLevel={status.battery_level}
              tirePressure={status.tire_pressure}
            />
            
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100">
              <div className="flex items-center text-indigo-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium">All status indicators update in real-time</span>
              </div>
              <div className="text-sm text-gray-500">
                Last updated: {lastUpdated ? lastUpdated.toLocaleTimeString() : 'Never'}
                {isLoading && status && <span className="ml-2 italic text-indigo-500">Refreshing...</span>}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default VehicleHealthCard