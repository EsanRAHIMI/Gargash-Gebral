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

  const getStatusIcon = (status: string) => {
    if (status === "good") return "✓";
    if (status === "warning") return "!";
    return "×";
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
    <div className="flex flex-col xl:flex-row gap-6">
      {/* Luxury Car SVG visualization - increased width on larger screens */}
      <div className="w-full xl:w-2/3 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 md:p-6 shadow-2xl">
        <svg 
          viewBox="0 0 1000 500" 
          className="w-full h-auto max-h-[450px]"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Subtle grid background with luxury feel */}
          <pattern id="luxury-grid" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#2a3c5a" strokeWidth="0.5"/>
          </pattern>
          <rect width="1000" height="500" fill="url(#luxury-grid)" />
          
          {/* Brand logo */}
          <g transform="translate(80, 60)">
            <circle cx="0" cy="0" r="40" fill="none" stroke="#d4af37" strokeWidth="2" />
            <text x="0" y="0" fontSize="36" fill="#d4af37" fontFamily="Arial, sans-serif" textAnchor="middle" alignmentBaseline="middle" fontWeight="bold">G</text>
            <text x="0" y="40" fontSize="12" fill="#d4af37" fontFamily="Arial, sans-serif" textAnchor="middle" letterSpacing="2">GEBRAL</text>
          </g>
          
          {/* Car Body - Luxury Sedan (top view) */}
          <g className="car-body" transform="translate(120, 100)">
            {/* Vehicle outline with shadow effect */}
            <filter id="car-shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="15" />
              <feOffset dx="0" dy="10" result="offsetblur" />
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.5"/>
              </feComponentTransfer>
              <feMerge>
                <feMergeNode/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>

            {/* Main chassis shadow */}
            <ellipse cx="380" cy="320" rx="350" ry="35" fill="#111827" opacity="0.5" />

            {/* Car Chassis - Luxury Silhouette */}
            <g filter="url(#car-shadow)">
              {/* Main body shape */}
              <path 
                d="M100,220 C100,190 120,180 160,170 L220,120 C280,90 480,90 540,120 L600,170 C640,180 660,190 660,220 L660,240 C660,260 640,280 620,280 L140,280 C120,280 100,260 100,240 Z" 
                fill="url(#luxury-paint)" 
                stroke="#64748b" 
                strokeWidth="1" 
              />

              {/* Define luxury paint gradient */}
              <linearGradient id="luxury-paint" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1e293b" />
                <stop offset="50%" stopColor="#475569" />
                <stop offset="100%" stopColor="#1e293b" />
              </linearGradient>
              
              {/* Hood */}
              <path 
                d="M160,170 L220,120 C280,90 480,90 540,120 L600,170 L160,170 Z" 
                fill="url(#hood-gradient)" 
                stroke="#64748b" 
                strokeWidth="0.5" 
              />

              <linearGradient id="hood-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#334155" />
                <stop offset="50%" stopColor="#475569" />
                <stop offset="100%" stopColor="#334155" />
              </linearGradient>
              
              {/* Windshield */}
              <path 
                d="M180,170 L230,130 C280,105 480,105 530,130 L580,170 Z" 
                fill="#0f172a" 
                stroke="#64748b" 
                strokeWidth="0.5" 
                opacity="0.8" 
              />
              
              {/* Roof */}
              <rect x="180" y="170" width="400" height="50" fill="#0f172a" stroke="#64748b" strokeWidth="0.5" />
              
              {/* Rear Windshield */}
              <path 
                d="M180,220 L180,240 L580,240 L580,220 Z" 
                fill="#0f172a" 
                stroke="#64748b" 
                strokeWidth="0.5" 
                opacity="0.8" 
              />
              
              {/* Luxury Details */}
              <line x1="380" y1="100" x2="380" y2="280" stroke="#94a3b8" strokeWidth="0.5" opacity="0.5" />
              
              {/* Door Handles */}
              <rect x="240" y="200" width="20" height="5" rx="2" fill="#e2e8f0" opacity="0.8" />
              <rect x="500" y="200" width="20" height="5" rx="2" fill="#e2e8f0" opacity="0.8" />
              
              {/* Headlights - luxury style with gradient */}
              <linearGradient id="headlight-glow" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#fef3c7" />
                <stop offset="100%" stopColor="#fef9c3" />
              </linearGradient>
              
              <path d="M160,180 C155,175 150,180 150,185 L150,195 C150,200 155,205 160,200 Z" fill="url(#headlight-glow)" />
              <path d="M600,180 C605,175 610,180 610,185 L610,195 C610,200 605,205 600,200 Z" fill="url(#headlight-glow)" />
              
              {/* Grille - premium style */}
              <rect x="350" y="170" width="60" height="10" rx="2" fill="#0f172a" />
              <rect x="355" y="173" width="50" height="4" rx="1" fill="#cbd5e1" />
              
              {/* Wheels with luxury rims */}
              <g transform="translate(200, 280)">
                <circle cx="0" cy="0" r="40" fill="#0f172a" stroke="#e2e8f0" strokeWidth="1" />
                <circle cx="0" cy="0" r="32" fill="#1e293b" stroke="#94a3b8" strokeWidth="0.5" />
                <circle cx="0" cy="0" r="25" fill={getTireColor(tirePressure.front_left)} opacity="0.9" />
                <circle cx="0" cy="0" r="15" fill="#0f172a" />
                <circle cx="0" cy="0" r="5" fill="#e2e8f0" />
                <text x="0" y="0" fontSize="10" fill="white" textAnchor="middle" dominantBaseline="middle" fontWeight="bold">FL</text>
                
                {/* Luxury rim details */}
                {Array.from({ length: 8 }).map((_, i) => (
                  <line 
                    key={`fl-rim-${i}`}
                    x1="0" 
                    y1="0" 
                    x2={25 * Math.cos(i * Math.PI/4)} 
                    y2={25 * Math.sin(i * Math.PI/4)} 
                    stroke="#cbd5e1" 
                    strokeWidth="1.5" 
                  />
                ))}
                <text x="0" y="55" fontSize="12" fill="#e2e8f0" textAnchor="middle" fontWeight="bold">{tirePressure.front_left}</text>
              </g>
              
              <g transform="translate(560, 280)">
                <circle cx="0" cy="0" r="40" fill="#0f172a" stroke="#e2e8f0" strokeWidth="1" />
                <circle cx="0" cy="0" r="32" fill="#1e293b" stroke="#94a3b8" strokeWidth="0.5" />
                <circle cx="0" cy="0" r="25" fill={getTireColor(tirePressure.front_right)} opacity="0.9" />
                <circle cx="0" cy="0" r="15" fill="#0f172a" />
                <circle cx="0" cy="0" r="5" fill="#e2e8f0" />
                <text x="0" y="0" fontSize="10" fill="white" textAnchor="middle" dominantBaseline="middle" fontWeight="bold">FR</text>
                
                {/* Luxury rim details */}
                {Array.from({ length: 8 }).map((_, i) => (
                  <line 
                    key={`fr-rim-${i}`}
                    x1="0" 
                    y1="0" 
                    x2={25 * Math.cos(i * Math.PI/4)} 
                    y2={25 * Math.sin(i * Math.PI/4)} 
                    stroke="#cbd5e1" 
                    strokeWidth="1.5" 
                  />
                ))}
                <text x="0" y="55" fontSize="12" fill="#e2e8f0" textAnchor="middle" fontWeight="bold">{tirePressure.front_right}</text>
              </g>
              
              <g transform="translate(260, 280)">
                <circle cx="0" cy="0" r="40" fill="#0f172a" stroke="#e2e8f0" strokeWidth="1" />
                <circle cx="0" cy="0" r="32" fill="#1e293b" stroke="#94a3b8" strokeWidth="0.5" />
                <circle cx="0" cy="0" r="25" fill={getTireColor(tirePressure.rear_left)} opacity="0.9" />
                <circle cx="0" cy="0" r="15" fill="#0f172a" />
                <circle cx="0" cy="0" r="5" fill="#e2e8f0" />
                <text x="0" y="0" fontSize="10" fill="white" textAnchor="middle" dominantBaseline="middle" fontWeight="bold">RL</text>
                
                {/* Luxury rim details */}
                {Array.from({ length: 8 }).map((_, i) => (
                  <line 
                    key={`rl-rim-${i}`}
                    x1="0" 
                    y1="0" 
                    x2={25 * Math.cos(i * Math.PI/4)} 
                    y2={25 * Math.sin(i * Math.PI/4)} 
                    stroke="#cbd5e1" 
                    strokeWidth="1.5" 
                  />
                ))}
                <text x="0" y="55" fontSize="12" fill="#e2e8f0" textAnchor="middle" fontWeight="bold">{tirePressure.rear_left}</text>
              </g>
              
              <g transform="translate(500, 280)">
                <circle cx="0" cy="0" r="40" fill="#0f172a" stroke="#e2e8f0" strokeWidth="1" />
                <circle cx="0" cy="0" r="32" fill="#1e293b" stroke="#94a3b8" strokeWidth="0.5" />
                <circle cx="0" cy="0" r="25" fill={getTireColor(tirePressure.rear_right)} opacity="0.9" />
                <circle cx="0" cy="0" r="15" fill="#0f172a" />
                <circle cx="0" cy="0" r="5" fill="#e2e8f0" />
                <text x="0" y="0" fontSize="10" fill="white" textAnchor="middle" dominantBaseline="middle" fontWeight="bold">RR</text>
                
                {/* Luxury rim details */}
                {Array.from({ length: 8 }).map((_, i) => (
                  <line 
                    key={`rr-rim-${i}`}
                    x1="0" 
                    y1="0" 
                    x2={25 * Math.cos(i * Math.PI/4)} 
                    y2={25 * Math.sin(i * Math.PI/4)} 
                    stroke="#cbd5e1" 
                    strokeWidth="1.5" 
                  />
                ))}
                <text x="0" y="55" fontSize="12" fill="#e2e8f0" textAnchor="middle" fontWeight="bold">{tirePressure.rear_right}</text>
              </g>
            </g>

            {/* Status Indicators */}
            {/* Engine Indicator */}
            <g className="indicator-engine" transform="translate(380, 130)">
              <defs>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <circle 
                cx="0" 
                cy="0" 
                r="35" 
                fill={getEngineColor(engineTemp)} 
                opacity="0.2"
                filter="url(#glow)"
              />
              <circle 
                cx="0" 
                cy="0" 
                r="25" 
                fill={getEngineColor(engineTemp)} 
                opacity="0.6"
                stroke="#0f172a"
                strokeWidth="1"
              />
              <text 
                x="0" 
                y="-5" 
                fontSize="10" 
                fill="white" 
                textAnchor="middle" 
                fontWeight="bold"
              >ENGINE</text>
              <text 
                x="0" 
                y="12" 
                fontSize="14" 
                fill="white" 
                textAnchor="middle" 
                fontWeight="bold"
              >{engineTemp}°C</text>
              <circle 
                cx="0" 
                cy="30" 
                r="10" 
                fill="#0f172a" 
                stroke={getEngineColor(engineTemp)}
                strokeWidth="1"
              />
              <text 
                x="0" 
                y="30" 
                fontSize="12" 
                fill={getEngineColor(engineTemp)}
                textAnchor="middle" 
                dominantBaseline="middle"
                fontWeight="bold"
              >{getStatusIcon(getEngineStatus(engineTemp))}</text>
            </g>

            {/* Battery Indicator */}
            <g className="indicator-battery" transform="translate(380, 220)">
              <defs>
                <linearGradient id="battery-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={getBatteryColor(batteryLevel)} stopOpacity="0.7" />
                  <stop offset={`${batteryLevel}%`} stopColor={getBatteryColor(batteryLevel)} stopOpacity="0.7" />
                  <stop offset={`${batteryLevel+0.1}%`} stopColor="#334155" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#334155" stopOpacity="0.3" />
                </linearGradient>
              </defs>
              
              <rect 
                x="-40" 
                y="-15" 
                width="80" 
                height="30"
                rx="4"
                fill="#0f172a"
                stroke="#475569"
                strokeWidth="1"
              />
              <rect 
                x="-10" 
                y="-20" 
                width="20" 
                height="5"
                fill="#475569"
              />
              <rect 
                x="-35" 
                y="-10" 
                width="70" 
                height="20"
                rx="2"
                fill="url(#battery-gradient)"
              />
              
              <text 
                x="0" 
                y="-25" 
                fontSize="10" 
                fill="white" 
                textAnchor="middle" 
                fontWeight="bold"
              >BATTERY</text>
              
              <text 
                x="0" 
                y="5" 
                fontSize="14" 
                fill="white" 
                textAnchor="middle" 
                fontWeight="bold"
              >{batteryLevel}%</text>
              
              <circle 
                cx="0" 
                cy="30" 
                r="10" 
                fill="#0f172a" 
                stroke={getBatteryColor(batteryLevel)}
                strokeWidth="1"
              />
              <text 
                x="0" 
                y="30" 
                fontSize="12" 
                fill={getBatteryColor(batteryLevel)}
                textAnchor="middle" 
                dominantBaseline="middle"
                fontWeight="bold"
              >{getStatusIcon(getBatteryStatus(batteryLevel))}</text>
            </g>
            
            {/* Gentle reflections for luxury feel */}
            <path 
              d="M300,140 C350,130 400,130 450,140" 
              stroke="white" 
              strokeWidth="2" 
              opacity="0.1" 
              fill="none" 
            />
            
            <path 
              d="M250,200 C350,180 450,180 550,200" 
              stroke="white" 
              strokeWidth="3" 
              opacity="0.05" 
              fill="none" 
            />
          </g>
          
          {/* Legend */}
          <g transform="translate(860, 50)">
            <text x="0" y="0" fontSize="14" fill="#e2e8f0" fontWeight="bold">STATUS</text>
            <rect x="0" y="15" width="15" height="15" rx="7.5" fill="#22c55e" />
            <text x="25" y="27" fontSize="12" fill="#e2e8f0">Optimal</text>
            
            <rect x="0" y="40" width="15" height="15" rx="7.5" fill="#eab308" />
            <text x="25" y="52" fontSize="12" fill="#e2e8f0">Warning</text>
            
            <rect x="0" y="65" width="15" height="15" rx="7.5" fill="#ef4444" />
            <text x="25" y="77" fontSize="12" fill="#e2e8f0">Critical</text>
          </g>

          {/* Digital Elements */}
          <g transform="translate(120, 400)">
            <rect x="0" y="0" width="760" height="50" rx="8" fill="#0f172a" stroke="#334155" strokeWidth="1" />
            
            {/* Data connectivity visualization */}
            <g transform="translate(50, 25)">
              <circle cx="0" cy="0" r="15" fill="#020617" stroke="#475569" strokeWidth="1" />
              <path d="M-5,-5 L0,-8 L5,-5 L5,5 L0,8 L-5,5 Z" fill="#22c55e" />
              <text x="25" y="5" fontSize="12" fill="#94a3b8" textAnchor="start">Connected</text>
            </g>

            {/* Time indicator */}
            <g transform="translate(380, 25)">
              <text x="0" y="5" fontSize="18" fill="#cbd5e1" textAnchor="middle" fontFamily="'Courier New', monospace">
                {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </text>
            </g>

            {/* Security status */}
            <g transform="translate(680, 25)">
              <path d="M-10,-8 L0,-8 L10,-8 L10,8 L-10,8 Z" fill="#020617" stroke="#475569" strokeWidth="1" />
              <circle cx="0" cy="0" r="4" fill="#22c55e" />
              <text x="20" y="5" fontSize="12" fill="#94a3b8" textAnchor="start">Secured</text>
            </g>
          </g>
        </svg>
      </div>
      
      {/* Status Details Panel - Modern UI */}
      <div className="w-full xl:w-1/3 bg-white dark:bg-slate-800 rounded-xl p-4 md:p-6 shadow-xl">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Vehicle Diagnostics</h3>
        
        <div className="space-y-6">
          {/* Engine Temperature Panel */}
          <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4 border-l-4" style={{borderColor: getEngineColor(engineTemp)}}>
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="p-2 rounded-full mr-3" style={{backgroundColor: getEngineColor(engineTemp)}}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Engine</h4>
                  <div className="text-sm text-gray-500 dark:text-gray-300">Temperature</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold" style={{color: getEngineColor(engineTemp)}}>
                  {engineTemp}°C
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-300">
                  Optimal: 80-100°C
                </div>
              </div>
            </div>
            
            {/* Status Bar */}
            <div className="mt-3 bg-gray-200 dark:bg-slate-600 rounded-full h-2 overflow-hidden">
              <div 
                className="h-full rounded-full"
                style={{
                  backgroundColor: getEngineColor(engineTemp),
                  width: `${Math.min(100, Math.max(0, ((engineTemp - 60) / 60) * 100))}%`
                }}
              ></div>
            </div>
          </div>
          
          {/* Battery Level Panel */}
          <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4 border-l-4" style={{borderColor: getBatteryColor(batteryLevel)}}>
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="p-2 rounded-full mr-3" style={{backgroundColor: getBatteryColor(batteryLevel)}}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="7" width="16" height="10" rx="2" ry="2" />
                    <line x1="22" y1="11" x2="22" y2="13" />
                    <line x1="18" y1="9" x2="18" y2="15" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Battery</h4>
                  <div className="text-sm text-gray-500 dark:text-gray-300">Power Level</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold" style={{color: getBatteryColor(batteryLevel)}}>
                  {batteryLevel}%
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-300">
                  Optimal: 60-100%
                </div>
              </div>
            </div>
            
            {/* Status Bar */}
            <div className="mt-3 bg-gray-200 dark:bg-slate-600 rounded-full h-2 overflow-hidden">
              <div 
                className="h-full rounded-full"
                style={{
                  backgroundColor: getBatteryColor(batteryLevel),
                  width: `${batteryLevel}%`
                }}
              ></div>
            </div>
          </div>
          
          {/* Tire Pressure Panel */}
          <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4">
            <div className="flex items-center mb-4">
              <div className="p-2 rounded-full mr-3 bg-indigo-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Tire Pressure</h4>
                <div className="text-sm text-gray-500 dark:text-gray-300">
                  Optimal: 32-35 PSI
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Front Left Tire */}
              <div className="relative">
                <div className="absolute top-0 left-0 p-1 bg-gray-800 text-white text-xs rounded">FL</div>
                <div className="pt-5 pb-3 px-3 bg-gray-100 dark:bg-slate-800 rounded-lg border" style={{borderColor: getTireColor(tirePressure.front_left)}}>
                  <div className="flex justify-center">
                    <span className="text-2xl font-bold" style={{color: getTireColor(tirePressure.front_left)}}>
                      {tirePressure.front_left}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 self-end ml-1">PSI</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-slate-600 rounded-full h-1.5 mt-2">
                    <div 
                      className="h-full rounded-full" 
                      style={{
                        backgroundColor: getTireColor(tirePressure.front_left),
                        width: `${Math.min(100, Math.max(0, ((tirePressure.front_left - 25) / 15) * 100))}%`
                      }}
                    ></div>
                  </div>
                </div>
              </div>
              
              {/* Front Right Tire */}
              <div className="relative">
                <div className="absolute top-0 left-0 p-1 bg-gray-800 text-white text-xs rounded">FR</div>
                <div className="pt-5 pb-3 px-3 bg-gray-100 dark:bg-slate-800 rounded-lg border" style={{borderColor: getTireColor(tirePressure.front_right)}}>
                  <div className="flex justify-center">
                    <span className="text-2xl font-bold" style={{color: getTireColor(tirePressure.front_right)}}>
                      {tirePressure.front_right}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 self-end ml-1">PSI</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-slate-600 rounded-full h-1.5 mt-2">
                    <div 
                      className="h-full rounded-full" 
                      style={{
                        backgroundColor: getTireColor(tirePressure.front_right),
                        width: `${Math.min(100, Math.max(0, ((tirePressure.front_right - 25) / 15) * 100))}%`
                      }}
                    ></div>
                  </div>
                </div>
              </div>
              
              {/* Rear Left Tire */}
              <div className="relative">
                <div className="absolute top-0 left-0 p-1 bg-gray-800 text-white text-xs rounded">RL</div>
                <div className="pt-5 pb-3 px-3 bg-gray-100 dark:bg-slate-800 rounded-lg border" style={{borderColor: getTireColor(tirePressure.rear_left)}}>
                  <div className="flex justify-center">
                    <span className="text-2xl font-bold" style={{color: getTireColor(tirePressure.rear_left)}}>
                      {tirePressure.rear_left}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 self-end ml-1">PSI</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-slate-600 rounded-full h-1.5 mt-2">
                    <div 
                      className="h-full rounded-full" 
                      style={{
                        backgroundColor: getTireColor(tirePressure.rear_left),
                        width: `${Math.min(100, Math.max(0, ((tirePressure.rear_left - 25) / 15) * 100))}%`
                      }}
                    ></div>
                  </div>
                </div>
              </div>
              
              {/* Rear Right Tire */}
              <div className="relative">
                <div className="absolute top-0 left-0 p-1 bg-gray-800 text-white text-xs rounded">RR</div>
                <div className="pt-5 pb-3 px-3 bg-gray-100 dark:bg-slate-800 rounded-lg border" style={{borderColor: getTireColor(tirePressure.rear_right)}}>
                  <div className="flex justify-center">
                    <span className="text-2xl font-bold" style={{color: getTireColor(tirePressure.rear_right)}}>
                      {tirePressure.rear_right}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 self-end ml-1">PSI</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-slate-600 rounded-full h-1.5 mt-2">
                    <div 
                      className="h-full rounded-full" 
                      style={{
                        backgroundColor: getTireColor(tirePressure.rear_right),
                        width: `${Math.min(100, Math.max(0, ((tirePressure.rear_right - 25) / 15) * 100))}%`
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleGraphic;