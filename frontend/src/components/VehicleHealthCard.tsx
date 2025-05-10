// /frontend/src/components/VehicleHealthCard.tsx
import { useVehicleStatus } from '../hooks/useVehicleStatus'

const VehicleHealthCard = () => {
  const { status, isLoading, error, refetch } = useVehicleStatus(30000) // 30 seconds refresh

  const getBatteryColorClass = (level: number) => {
    if (level >= 60) return 'text-green-600'
    if (level >= 30) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getTirePressureColorClass = (pressure: number) => {
    if (pressure >= 32 && pressure <= 35) return 'text-green-600'
    if ((pressure >= 30 && pressure < 32) || (pressure > 35 && pressure <= 36)) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getEngineColorClass = (temp: number) => {
    if (temp >= 80 && temp <= 100) return 'text-green-600'
    if ((temp >= 75 && temp < 80) || (temp > 100 && temp <= 105)) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Vehicle Health Status</h3>
          <div className="flex items-center">
            <span className="text-sm text-gray-500 mr-2">Auto-refresh: 30s</span>
            <button
              onClick={() => refetch()}
              className="inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>
        
        {isLoading && !status && (
          <div className="text-center py-4">
            <div className="spinner animate-spin inline-block w-8 h-8 border-4 rounded-full border-indigo-600 border-t-transparent"></div>
            <p className="mt-2 text-sm text-gray-500">Loading vehicle data...</p>
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 p-4 rounded-md">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{error}</h3>
              </div>
            </div>
          </div>
        )}
        
        {status && (
          <div className="space-y-6">
            {/* Engine Temperature */}
            <div>
              <h4 className="text-sm font-medium text-gray-500">Engine Temperature</h4>
              <div className="mt-1 flex items-baseline justify-between">
                <div className={`text-2xl font-semibold ${getEngineColorClass(status.engine_temp)}`}>
                  {status.engine_temp}°C
                </div>
                <span className="text-sm text-gray-500">Normal: 80-100°C</span>
              </div>
              <div className="mt-1 w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className={`${getEngineColorClass(status.engine_temp).replace('text-', 'bg-')} h-2.5 rounded-full`} 
                  style={{ width: `${Math.min(100, ((status.engine_temp - 70) / 40) * 100)}%` }}
                ></div>
              </div>
            </div>
            
            {/* Battery Level */}
            <div>
              <h4 className="text-sm font-medium text-gray-500">Battery Level</h4>
              <div className="mt-1 flex items-baseline justify-between">
                <div className={`text-2xl font-semibold ${getBatteryColorClass(status.battery_level)}`}>
                  {status.battery_level}%
                </div>
                <span className="text-sm text-gray-500">Normal: 60-100%</span>
              </div>
              <div className="mt-1 w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className={`${getBatteryColorClass(status.battery_level).replace('text-', 'bg-')} h-2.5 rounded-full`} 
                  style={{ width: `${status.battery_level}%` }}
                ></div>
              </div>
            </div>
            
            {/* Tire Pressure */}
            <div>
              <h4 className="text-sm font-medium text-gray-500">Tire Pressure (PSI)</h4>
              <div className="mt-2 grid grid-cols-2 gap-4">
                <div className="flex flex-col items-center">
                  <span className={`text-lg font-medium ${getTirePressureColorClass(status.tire_pressure.front_left)}`}>
                    {status.tire_pressure.front_left}
                  </span>
                  <span className="text-xs text-gray-500">Front Left</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className={`text-lg font-medium ${getTirePressureColorClass(status.tire_pressure.front_right)}`}>
                    {status.tire_pressure.front_right}
                  </span>
                  <span className="text-xs text-gray-500">Front Right</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className={`text-lg font-medium ${getTirePressureColorClass(status.tire_pressure.rear_left)}`}>
                    {status.tire_pressure.rear_left}
                  </span>
                  <span className="text-xs text-gray-500">Rear Left</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className={`text-lg font-medium ${getTirePressureColorClass(status.tire_pressure.rear_right)}`}>
                    {status.tire_pressure.rear_right}
                  </span>
                  <span className="text-xs text-gray-500">Rear Right</span>
                </div>
              </div>
              <div className="mt-1 text-xs text-center text-gray-500">Normal range: 32-35 PSI</div>
            </div>

            <div className="text-xs text-gray-400 text-right">
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default VehicleHealthCard