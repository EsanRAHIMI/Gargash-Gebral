import React from 'react';
import ErrorBoundary from './ErrorBoundary';
import VehicleHealthCard from './VehicleHealthCard';

const Dashboard: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col xl:flex-row gap-6">
        <div className="w-full xl:w-3/4">
          <ErrorBoundary>
            <VehicleHealthCard />
          </ErrorBoundary>
        </div>
        
        {/* Additional dashboard content can be added here */}
        <div className="w-full xl:w-1/4">
          {/* Sidebar content */}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 