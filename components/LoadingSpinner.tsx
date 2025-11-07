
import React from 'react';

export const LoadingSpinner: React.FC = () => (
    <div className="flex items-center justify-center" aria-label="Carregando taxas de câmbio">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-cyan-400"></div>
    </div>
);