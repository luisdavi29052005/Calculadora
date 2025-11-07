
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
        if (/^\d*\.?\d*$/.test(value)) {
            onInputChange(id, 'amount', value);
        }
    };
    
    const selectedCurrencyInfo = currencies.find(c => c.code === input.currency);

    return (
        <div className="relative group w-full bg-black/25 p-3 sm:p-4 rounded-xl border border-transparent hover:border-white/10 transition-colors duration-300">
             {canBeRemoved && (
                 <button 
                     onClick={() => onRemove(id)}
                     className="absolute -top-3 -right-3 bg-slate-700 hover:bg-red-500 text-white rounded-full p-1.5 z-10 transition-all duration-200 opacity-50 group-hover:opacity-100"
                     aria-label="Remover pagamento"
                 >
                     <CloseIcon />
                 </button>
            )}
            <div className="flex flex-wrap md:flex-nowrap items-center gap-4">
                
                <div className="relative w-full md:w-auto">
                    <label htmlFor={`currency-${id}`} className="sr-only">Moeda</label>
                    <select
                        id={`currency-${id}`}
                        value={input.currency}
                        onChange={(e) => onInputChange(id, 'currency', e.target.value)}
                        className="w-full bg-slate-800/50 border border-white/10 rounded-lg pl-11 pr-4 py-2 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:bg-slate-800 transition-all text-base"
                    >
                        {currencies.map(c => (
                            <option key={c.code} value={c.code}>
                                {c.code}
                            </option>
                        ))}
                    </select>
                    {selectedCurrencyInfo && (
                         <img 
                            src={`https://flagcdn.com/${selectedCurrencyInfo.countryCode}.svg`} 
                            alt={`Bandeira ${selectedCurrencyInfo.name}`}
                            className="w-6 h-auto absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none select-none rounded-sm"
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
                        id={`amount-${id}`}
                        value={input.amount}
                        onChange={handleAmountChange}
                        placeholder="0,00"
                        className="w-full bg-slate-800/50 border border-white/10 focus:border-cyan-400 focus:ring-0 rounded-lg p-3 pl-11 text-2xl font-bold text-white text-right transition-colors"
                        aria-label="Valor"
                    />
                </div>
                
                <div className="hidden xl:block w-px h-10 bg-slate-700"></div>

                <div className="w-full md:w-auto text-right md:min-w-[180px] bg-slate-800/50 rounded-lg p-2 border border-white/10">
                    <span className="text-slate-400 text-xs sm:text-sm">Você receberá ≈</span>
                    <p className="text-lg sm:text-xl font-semibold text-green-400">
                        {result ? result.finalBRL.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'R$ 0,00'}
                    </p>
                </div>
            </div>
        </div>
    );
};