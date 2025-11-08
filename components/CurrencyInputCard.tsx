
import React from 'react';
import type { CalculationInput, CurrencyInfo } from '../types';

const DuplicateIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
);

const TrashIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
        <div className="relative group w-full bg-[#0F1422] p-4 rounded-2xl border border-[#1F2942] transition-colors duration-300 shadow-lg shadow-black/30">
            <div className="flex flex-wrap md:flex-nowrap items-center gap-3">
                
                <div className="relative w-full md:w-auto">
                    <label htmlFor={`currency-${id}`} className="sr-only">Moeda</label>
                    <select
                        id={`currency-${id}`}
                        value={input.currency}
                        onChange={(e) => onInputChange(id, 'currency', e.target.value)}
                        className="w-full bg-slate-800/80 border border-slate-700 rounded-lg pl-11 pr-4 py-3 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:bg-slate-800 transition-all font-semibold"
                    >
                        {currencies.map(c => (
                            <option key={c.code} value={c.code}>
                                {c.code}
                            </option>
                        ))}
                    </select>
                    {selectedCurrencyInfo && (
                         <img 
                            src={`https://flagcdn.com/w40/${selectedCurrencyInfo.countryCode}.png`} 
                            alt={`Bandeira ${selectedCurrencyInfo.name}`}
                            className="w-6 h-auto absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none select-none rounded-sm"
                         />
                    )}
                </div>

                <div className="relative flex-grow">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-slate-500 font-semibold pointer-events-none">
                        {selectedCurrencyInfo?.symbol}
                    </span>
                    <label htmlFor={`amount-${id}`} className="sr-only">Valor</label>
                    <input
                        type="text"
                        inputMode="decimal"
                        id={`amount-${id}`}
                        value={input.amount}
                        onChange={handleAmountChange}
                        placeholder="0.00"
                        className="w-full bg-slate-800/80 border border-slate-700 focus:border-cyan-400 focus:ring-0 rounded-lg p-3 pl-11 text-2xl font-bold text-white text-right transition-colors tabular-nums"
                        aria-label="Valor"
                    />
                </div>
            </div>
             <div className="absolute -top-3 -right-3 flex items-center gap-2 z-10 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
                 <button 
                     onClick={() => onDuplicate(id)}
                     className="bg-slate-700 hover:bg-cyan-500 text-white rounded-full p-1.5 transition-all"
                     aria-label="Duplicar pagamento"
                 >
                     <DuplicateIcon />
                 </button>
                 {canBeRemoved && (
                     <button 
                         onClick={() => onRemove(id)}
                         className="bg-slate-700 hover:bg-red-500 text-white rounded-full p-1.5 transition-all"
                         aria-label="Remover pagamento"
                     >
                         <TrashIcon />
                     </button>
                )}
            </div>
        </div>
    );
};
