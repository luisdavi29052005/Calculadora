
import React from 'react';
import type { CalculationInput, CurrencyInfo } from '../types';

const DuplicateIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
);

const TrashIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

interface CurrencyInputCardProps {
    id: number;
    input: CalculationInput;
    onInputChange: (id: number, field: 'amount' | 'currency', value: string) => void;
    currencies: CurrencyInfo[];
    onRemove: (id: number) => void;
    onDuplicate: (id: number) => void;
    canBeRemoved: boolean;
}

export const CurrencyInputCard: React.FC<CurrencyInputCardProps> = ({ id, input, onInputChange, currencies, onRemove, onDuplicate, canBeRemoved }) => {
    
    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const cleanedValue = value.replace(/[^0-9.,]/g, '').replace(',', '.');
        const parts = cleanedValue.split('.');
        if (parts.length > 2) {
            const finalValue = parts[0] + '.' + parts.slice(1).join('');
             onInputChange(id, 'amount', finalValue);
             return;
        }
        onInputChange(id, 'amount', cleanedValue);
    };
    
    const selectedCurrencyInfo = currencies.find(c => c.code === input.currency);

    return (
        <div className="glass-panel group relative w-full rounded-xl transition-all duration-300 hover:border-slate-600/50 hover:shadow-lg hover:-translate-y-0.5">
            <div className="flex flex-row items-center p-1 sm:p-2">
                
                {/* Currency Selector */}
                <div className="relative pl-1 sm:pl-2">
                    <div className="flex items-center gap-2 bg-slate-800/80 hover:bg-slate-700/80 transition-colors rounded-lg px-2 py-2 cursor-pointer border border-slate-700/50">
                         {selectedCurrencyInfo && (
                             <img 
                                src={`https://flagcdn.com/w40/${selectedCurrencyInfo.countryCode}.png`} 
                                alt={selectedCurrencyInfo.code}
                                className="w-5 h-3.5 object-cover rounded shadow-sm opacity-90"
                             />
                        )}
                        <select
                            id={`currency-${id}`}
                            value={input.currency}
                            onChange={(e) => onInputChange(id, 'currency', e.target.value)}
                            className="bg-transparent text-slate-200 font-bold text-sm focus:outline-none cursor-pointer appearance-none pr-4 hover:text-white transition-colors"
                        >
                            {currencies.map(c => (
                                <option key={c.code} value={c.code} className="bg-slate-900 text-slate-200">
                                    {c.code}
                                </option>
                            ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                             <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </div>
                    </div>
                </div>

                {/* Amount Input */}
                <div className="relative flex-grow flex items-center px-3 sm:px-4 py-2 sm:py-3 overflow-hidden">
                    <span className="text-slate-600 font-medium text-lg select-none mr-2 mt-1">
                        {selectedCurrencyInfo?.symbol}
                    </span>
                    <input
                        type="text"
                        inputMode="decimal"
                        value={input.amount}
                        onChange={handleAmountChange}
                        placeholder="0.00"
                        className="w-full bg-transparent border-none focus:ring-0 p-0 text-2xl sm:text-3xl font-mono font-medium text-white placeholder-slate-700 transition-colors tabular-nums tracking-tight min-w-0"
                        aria-label="Valor"
                    />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-0.5 sm:gap-1 pr-2 border-l border-slate-800/50 pl-2">
                    <button 
                        onClick={() => onDuplicate(id)}
                        className="p-2 text-slate-600 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-all"
                        title="Duplicar"
                    >
                        <DuplicateIcon />
                    </button>
                    {canBeRemoved && (
                        <button 
                            onClick={() => onRemove(id)}
                            className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                            title="Remover"
                        >
                            <TrashIcon />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
