// /frontend/src/components/VehicleGraphic.tsx
import React from 'react';

interface VehicleGraphicProps {
  engineTemp: number;
  batteryLevel: number;
  tirePressure: {
    front_left: number;
    front_right: number;
    rear_left: number;
    rear_right: number;
  };
}

const VehicleGraphic: React.FC<VehicleGraphicProps> = ({
  engineTemp,
  batteryLevel,
  tirePressure,
}) => {
  // Helper functions to determine status colors
  const getEngineColor = (temp: number) => {
    if (temp >= 80 && temp <= 100) return "#22c55e"; // green-500
    if ((temp >= 75 && temp < 80) || (temp > 100 && temp <= 105)) return "#eab308"; // yellow-500
    return "#ef4444"; // red-500
  };

  const getBatteryColor = (level: number) => {
    if (level >= 60) return "#22c55e"; // green-500
    if (level >= 30) return "#eab308"; // yellow-500
    return "#ef4444"; // red-500
  };

  const getTireColor = (pressure: number) => {
    if (pressure >= 32 && pressure <= 35) return "#22c55e"; // green-500
    if ((pressure >= 30 && pressure < 32) || (pressure > 35 && pressure <= 36)) return "#eab308"; // yellow-500
    return "#ef4444"; // red-500
  };

  const getStatusIcon = (value: string) => {
    if (value === "good") return "✅";
    if (value === "warning") return "⚠️";
    return "❌";
  };

  const getEngineStatus = (temp: number) => {
    if (temp >= 80 && temp <= 100) return "good";
    if ((temp >= 75 && temp < 80) || (temp > 100 && temp <= 105)) return "warning";
    return "danger";
  };

  const getBatteryStatus = (level: number) => {
    if (level >= 60) return "good";
    if (level >= 30) return "warning";
    return "danger";
  };

  const getTireStatus = (pressure: number) => {
    if (pressure >= 32 && pressure <= 35) return "good";
    if ((pressure >= 30 && pressure < 32) || (pressure > 35 && pressure <= 36)) return "warning";
    return "danger";
  };

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Premium Car SVG visualization */}
      <div className="w-full md:w-1/2 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 shadow-inner">
        <svg 
          viewBox="0 0 800 400" 
          className="w-full h-auto drop-shadow-lg"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Background Layer - subtle grid */}
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f0f0f0" strokeWidth="1"/>
          </pattern>
          <rect width="800" height="400" fill="url(#grid)" />
          
          {/* Car Body - Modern Sedan */}
          <g className="car-body" transform="translate(100, 100) scale(1.2)">
            {/* Car Shadow */}
            <ellipse cx="250" cy="255" rx="230" ry="25" fill="#ddd" opacity="0.5" />
            
            {/* Car Chassis */}
            <path d="M30,200 C30,180 100,160 130,160 L170,100 C220,80 280,80 330,100 L370,160 C430,160 470,180 470,200 L470,210 C470,230 450,240 450,240 L50,240 C50,240 30,230 30,210 Z" 
                  fill="#3b82f6" stroke="#1e40af" strokeWidth="2" />
            
            {/* Hood */}
            <path d="M130,160 L170,100 C220,80 280,80 330,100 L370,160 L130,160 Z" 
                  fill="#2563eb" stroke="#1e40af" strokeWidth="1" />
                  
            {/* Windshield */}
            <path d="M150,160 L180,110 C220,95 280,95 320,110 L350,160 Z" 
                  fill="#f8fafc" stroke="#64748b" strokeWidth="1" opacity="0.8" />
            
            {/* Roof */}
            <rect x="150" y="160" width="200" height="40" fill="#2563eb" stroke="#1e40af" strokeWidth="1" />
            
            {/* Rear Windshield */}
            <path d="M150,200 L150,220 L350,220 L350,200 Z" 
                  fill="#f8fafc" stroke="#64748b" strokeWidth="1" opacity="0.8" />
            
            {/* Car Doors */}
            <line x1="250" y1="160" x2="250" y2="240" stroke="#1e40af" strokeWidth="2" />
            <rect x="170" y="180" width="60" height="20" rx="2" fill="#1d4ed8" stroke="#1e40af" strokeWidth="1" />
            <rect x="270" y="180" width="60" height="20" rx="2" fill="#1d4ed8" stroke="#1e40af" strokeWidth="1" />
            
            {/* Headlights */}
            <ellipse cx="130" cy="170" rx="15" ry="10" fill="#fef3c7" stroke="#d97706" strokeWidth="1" />
            <ellipse cx="370" cy="170" rx="15" ry="10" fill="#fef3c7" stroke="#d97706" strokeWidth="1" />
            
            {/* Grille */}
            <rect x="220" y="240" width="60" height="10" rx="5" fill="#1e293b" />
            
            {/* Bumpers */}
            <rect x="100" y="230" width="40" height="10" rx="5" fill="#64748b" />
            <rect x="360" y="230" width="40" height="10" rx="5" fill="#64748b" />
            
            {/* Wheels - Front Left with dynamic colors based on tire pressure */}
            <g transform="translate(130, 240)">
              <circle cx="0" cy="0" r="30" fill="#0f172a" stroke="#020617" strokeWidth="2" />
              <circle cx="0" cy="0" r="20" fill={getTireColor(tirePressure.front_left)} strokeWidth="1" />
              <circle cx="0" cy="0" r="15" fill="#0f172a" strokeWidth="1" />
              <circle cx="0" cy="0" r="5" fill="#64748b" />
              <text x="0" y="5" fontSize="12" fill="white" textAnchor="middle" fontWeight="bold">FL</text>
              <text x="0" y="45" fontSize="10" fill="#0f172a" textAnchor="middle" fontWeight="bold">{tirePressure.front_left}</text>
            </g>
            
            {/* Wheels - Front Right with dynamic colors */}
            <g transform="translate(370, 240)">
              <circle cx="0" cy="0" r="30" fill="#0f172a" stroke="#020617" strokeWidth="2" />
              <circle cx="0" cy="0" r="20" fill={getTireColor(tirePressure.front_right)} strokeWidth="1" />
              <circle cx="0" cy="0" r="15" fill="#0f172a" strokeWidth="1" />
              <circle cx="0" cy="0" r="5" fill="#64748b" />
              <text x="0" y="5" fontSize="12" fill="white" textAnchor="middle" fontWeight="bold">FR</text>
              <text x="0" y="45" fontSize="10" fill="#0f172a" textAnchor="middle" fontWeight="bold">{tirePressure.front_right}</text>
            </g>
            
            {/* Engine Indicator */}
            <g transform="translate(250, 130)">
              <circle cx="0" cy="0" r="30" fill={getEngineColor(engineTemp)} fillOpacity="0.9" stroke="#0f172a" strokeWidth="2" />
              <path d="M-15,-5 L-10,-10 L10,-10 L15,-5 L15,5 L10,10 L-10,10 L-15,5 Z" fill="#0f172a" />
              <text x="0" y="0" fontSize="10" fill="white" textAnchor="middle" fontWeight="bold">ENGINE</text>
              <text x="0" y="30" fontSize="12" fill="#0f172a" textAnchor="middle" fontWeight="bold" 
                    className="drop-shadow-sm">{engineTemp}°C</text>
            </g>
            
            {/* Battery Indicator */}
            <g transform="translate(250, 200)">
              <rect x="-25" y="-15" width="50" height="30" rx="5" fill={getBatteryColor(batteryLevel)} fillOpacity="0.9" stroke="#0f172a" strokeWidth="2" />
              <rect x="-10" y="-20" width="20" height="5" fill={getBatteryColor(batteryLevel)} stroke="#0f172a" strokeWidth="1" />
              
              {/* Battery Terminals */}
              <rect x="-20" y="-8" width="15" height="6" fill="#0f172a" />
              <rect x="5" y="-8" width="15" height="6" fill="#0f172a" />
              
              <text x="0" y="5" fontSize="10" fill="white" textAnchor="middle" fontWeight="bold">BATT</text>
              <text x="0" y="25" fontSize="12" fill="#0f172a" textAnchor="middle" fontWeight="bold" 
                    className="drop-shadow-sm">{batteryLevel}%</text>
            </g>
            
            {/* Rear Wheels */}
            <g transform="translate(130, 240)">
              {/* Already defined above as Front Left */}
            </g>
            
            <g transform="translate(370, 240)">
              {/* Already defined above as Front Right */}
            </g>
            
            {/* Rear Left Wheel */}
            <g transform="translate(160, 240)">
              <circle cx="0" cy="0" r="30" fill="#0f172a" stroke="#020617" strokeWidth="2" />
              <circle cx="0" cy="0" r="20" fill={getTireColor(tirePressure.rear_left)} strokeWidth="1" />
              <circle cx="0" cy="0" r="15" fill="#0f172a" strokeWidth="1" />
              <circle cx="0" cy="0" r="5" fill="#64748b" />
              <text x="0" y="5" fontSize="12" fill="white" textAnchor="middle" fontWeight="bold">RL</text>
              <text x="0" y="45" fontSize="10" fill="#0f172a" textAnchor="middle" fontWeight="bold">{tirePressure.rear_left}</text>
            </g>
            
            {/* Rear Right Wheel */}
            <g transform="translate(340, 240)">
              <circle cx="0" cy="0" r="30" fill="#0f172a" stroke="#020617" strokeWidth="2" />
              <circle cx="0" cy="0" r="20" fill={getTireColor(tirePressure.rear_right)} strokeWidth="1" />
              <circle cx="0" cy="0" r="15" fill="#0f172a" strokeWidth="1" />
              <circle cx="0" cy="0" r="5" fill="#64748b" />
              <text x="0" y="5" fontSize="12" fill="white" textAnchor="middle" fontWeight="bold">RR</text>
              <text x="0" y="45" fontSize="10" fill="#0f172a" textAnchor="middle" fontWeight="bold">{tirePressure.rear_right}</text>
            </g>

            {/* License Plate */}
            <rect x="230" y="230" width="40" height="15" rx="2" fill="white" stroke="#64748b" strokeWidth="1" />
            <text x="250" y="241" fontSize="10" fill="#0f172a" textAnchor="middle" fontWeight="bold">GEBRAL</text>
            
            {/* Reflections on car - for premium look */}
            <path d="M150,140 C200,120 300,120 350,140" stroke="white" strokeWidth="2" opacity="0.3" fill="none" />
            <path d="M150,180 C200,170 300,170 350,180" stroke="white" strokeWidth="2" opacity="0.2" fill="none" />
          </g>
          
          {/* Legend */}
          <g transform="translate(650, 50)">
            <text x="0" y="0" fontSize="14" fill="#0f172a" fontWeight="bold">Status Legend</text>
            <rect x="0" y="15" width="15" height="15" fill="#22c55e" rx="2" />
            <text x="25" y="27" fontSize="12" fill="#0f172a">Normal</text>
            
            <rect x="0" y="40" width="15" height="15" fill="#eab308" rx="2" />
            <text x="25" y="52" fontSize="12" fill="#0f172a">Warning</text>
            
            <rect x="0" y="65" width="15" height="15" fill="#ef4444" rx="2" />
            <text x="25" y="77" fontSize="12" fill="#0f172a">Critical</text>
          </g>
        </svg>
      </div>
      
      {/* Status Details */}
      <div className="w-full md:w-1/2 bg-white rounded-lg p-6 shadow-md">
        <h4 className="text-lg font-medium text-gray-900 mb-4">System Status</h4>
        <div className="divide-y divide-gray-200">
          <div className="py-3 flex justify-between items-center">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3" 
                   style={{backgroundColor: getEngineColor(engineTemp)}}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <span className="font-medium text-gray-900">Engine Temperature</span>
                <div className="text-sm text-gray-500">Normal: 80-100°C</div>
              </div>
            </div>
            <div className="text-2xl font-semibold" style={{color: getEngineColor(engineTemp)}}>
              {engineTemp}°C {getStatusIcon(getEngineStatus(engineTemp))}
            </div>
          </div>
          
          <div className="py-3 flex justify-between items-center">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3" 
                   style={{backgroundColor: getBatteryColor(batteryLevel)}}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm11 1H2v8l4-2 3 2 3-3 1 1V6zm1-2a1 1 0 100 2 1 1 0 000-2z" />
                </svg>
              </div>
              <div>
                <span className="font-medium text-gray-900">Battery Level</span>
                <div className="text-sm text-gray-500">Normal: 60-100%</div>
              </div>
            </div>
            <div className="text-2xl font-semibold" style={{color: getBatteryColor(batteryLevel)}}>
              {batteryLevel}% {getStatusIcon(getBatteryStatus(batteryLevel))}
            </div>
          </div>
          
          <div className="py-3">
            <div className="flex items-center mb-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3 bg-gray-800">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <span className="font-medium text-gray-900">Tire Pressure (PSI)</span>
                <div className="text-sm text-gray-500">Normal: 32-35 PSI</div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div className="bg-gray-50 p-3 rounded-lg flex justify-between">
                <span className="font-medium">Front Left</span>
                <span className="font-semibold" style={{color: getTireColor(tirePressure.front_left)}}>
                  {tirePressure.front_left} {getStatusIcon(getTireStatus(tirePressure.front_left))}
                </span>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg flex justify-between">
                <span className="font-medium">Front Right</span>
                <span className="font-semibold" style={{color: getTireColor(tirePressure.front_right)}}>
                  {tirePressure.front_right} {getStatusIcon(getTireStatus(tirePressure.front_right))}
                </span>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg flex justify-between">
                <span className="font-medium">Rear Left</span>
                <span className="font-semibold" style={{color: getTireColor(tirePressure.rear_left)}}>
                  {tirePressure.rear_left} {getStatusIcon(getTireStatus(tirePressure.rear_left))}
                </span>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg flex justify-between">
                <span className="font-medium">Rear Right</span>
                <span className="font-semibold" style={{color: getTireColor(tirePressure.rear_right)}}>
                  {tirePressure.rear_right} {getStatusIcon(getTireStatus(tirePressure.rear_right))}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleGraphic;