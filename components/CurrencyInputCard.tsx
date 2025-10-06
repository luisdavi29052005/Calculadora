
import React from 'react';
import type { CalculationInput, CalculationResult, CurrencyInfo } from '../types';
import { CloseIcon } from './icons/CloseIcon';

interface CurrencyInputCardProps {
    id: number;
    input: CalculationInput;
    onInputChange: (id: number, field: 'amount' | 'currency', value: string) => void;
    result: CalculationResult | null;
    currencies: CurrencyInfo[];
    onRemove: (id: number) => void;
    canBeRemoved: boolean;
}

export const CurrencyInputCard: React.FC<CurrencyInputCardProps> = ({ id, input, onInputChange, result, currencies, onRemove, canBeRemoved }) => {
    
    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        // Allow only numbers and a single decimal point
        if (/^\d*\.?\d*$/.test(value)) {
            onInputChange(id, 'amount', value);
        }
    };
    
    const selectedCurrencyInfo = currencies.find(c => c.code === input.currency);

    return (
        <div className="relative w-full max-w-md bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 shadow-lg transform hover:scale-[1.02] transition-transform duration-300">
            {canBeRemoved && (
                 <button 
                     onClick={() => onRemove(id)}
                     className="absolute -top-3 -right-3 bg-gray-700 hover:bg-red-600 text-white rounded-full p-1.5 z-10 transition-colors duration-200"
                     aria-label="Remove payment"
                 >
                     <CloseIcon />
                 </button>
            )}
            <div className="flex justify-between items-center mb-4">
                <label htmlFor={`currency-${id}`} className="text-gray-400">Payment Currency</label>
                <div className="relative">
                    <select
                        id={`currency-${id}`}
                        value={input.currency}
                        onChange={(e) => onInputChange(id, 'currency', e.target.value)}
                        className="bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                    >
                        {currencies.map(c => (
                            <option key={c.code} value={c.code}>
                                {c.code} - {c.name}
                            </option>
                        ))}
                    </select>
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xl pointer-events-none">
                        {selectedCurrencyInfo?.flag}
                    </span>
                </div>
            </div>

            <div className="relative mb-4">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-3xl text-gray-500 font-semibold">
                    {selectedCurrencyInfo?.symbol}
                </span>
                <input
                    type="text"
                    id={`amount-${id}`}
                    value={input.amount}
                    onChange={handleAmountChange}
                    placeholder="0.00"
                    className="w-full bg-gray-900/50 border-2 border-gray-700 rounded-lg p-4 pl-12 text-4xl font-bold text-white text-right focus:outline-none focus:border-indigo-500 transition"
                />
            </div>
            
            <div className="bg-gray-900/70 rounded-lg p-4 text-center min-h-[72px] flex items-center justify-center">
                <span className="text-gray-400 mr-2">You'll receive ≈</span>
                <span className="text-2xl font-semibold text-green-400">
                    {result ? result.finalBRL.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'R$ 0,00'}
                </span>
            </div>
        </div>
    );
};
