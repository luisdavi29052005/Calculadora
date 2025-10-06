
import React from 'react';
import type { CalculationInput, CalculationResult } from '../types';

interface TotalResultCardProps {
    totalBRL: number;
    results: Record<number, CalculationResult | null>;
    inputs: CalculationInput[];
}

const DetailRow: React.FC<{ label: string; value: string; className?: string }> = ({ label, value, className = '' }) => (
    <div className={`flex justify-between items-center py-2 ${className}`}>
        <span className="text-gray-400">{label}</span>
        <span className="font-medium text-gray-200">{value}</span>
    </div>
);

export const TotalResultCard: React.FC<TotalResultCardProps> = ({ totalBRL, results, inputs }) => {
    const renderBreakdown = (id: number) => {
        const result = results[id];
        const input = inputs.find(i => i.id === id);
        if (!result || !input) return null;

        const feeSymbol = new Intl.NumberFormat('en-US', { style: 'currency', currency: input.currency }).format(result.paypalFeeForeign);

        return (
            <div key={id} className="bg-gray-800/50 rounded-lg p-4 flex-1 min-w-[280px]">
                <h3 className="font-bold text-lg text-indigo-400 mb-2 border-b border-gray-700 pb-2">From {input.currency}</h3>
                <DetailRow label="Original Amount" value={`${new Intl.NumberFormat('en-US', { style: 'currency', currency: input.currency }).format(result.baseValue)}`} />
                <DetailRow label="PayPal Fee" value={feeSymbol} />
                <DetailRow label="Effective Rate" value={`R$ ${result.rateWithSpread.toFixed(4)}`} />
                <DetailRow label="Total Loss" value={result.totalLossBRL.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} className="text-red-400" />
                <div className="mt-3 pt-3 border-t border-gray-600 flex justify-between items-center">
                     <span className="text-gray-300 font-semibold">Net BRL</span>
                    <span className="text-green-400 font-bold text-lg">{result.finalBRL.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                </div>
            </div>
        );
    };

    return (
        <div className="w-full bg-gray-800/70 backdrop-blur-lg border border-gray-700 rounded-2xl p-6 md:p-8 shadow-2xl transition-all duration-300">
            <div className="text-center mb-6">
                <h2 className="text-xl text-gray-400 mb-2">Total Estimated Earnings</h2>
                <p className="text-5xl md:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-green-300 to-teal-400">
                    {totalBRL.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 md:gap-6 justify-center">
                {inputs.map(input => renderBreakdown(input.id))}
            </div>
        </div>
    );
};
