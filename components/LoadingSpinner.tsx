
import React from 'react';

export const LoadingSpinner: React.FC = () => (
    <div className="absolute inset-0 bg-gray-800/50 backdrop-blur-sm flex items-center justify-center rounded-2xl z-10">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
);
