import React, { useState, useRef, useEffect } from 'react';
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

const ChevronDownIcon: React.FC = () => (
    <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
);

const SearchIcon: React.FC = () => (
    <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
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
    isReverse?: boolean;
}

export const CurrencyInputCard: React.FC<CurrencyInputCardProps> = ({ id, input, onInputChange, currencies, onRemove, onDuplicate, canBeRemoved, isReverse = false }) => {
    
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Filter currencies based on search
    const filteredCurrencies = currencies.filter(c => 
        c.code.toLowerCase().includes(searchQuery.toLowerCase()) || 
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (isOpen && searchInputRef.current) {
            setTimeout(() => {
                searchInputRef.current?.focus();
            }, 50);
        } else {
            setSearchQuery("");
        }
    }, [isOpen]);

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value;
        
        // Remove everything that is not a digit
        value = value.replace(/\D/g, "");
        
        if (value === "") {
            onInputChange(id, 'amount', "");
            return;
        }

        // Convert to number (cents)
        const numericValue = parseInt(value, 10) / 100;
        
        // Format back to pt-BR (X.XXX,XX)
        const formatted = numericValue.toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
        
        onInputChange(id, 'amount', formatted);
    };
    
    const selectedCurrencyInfo = currencies.find(c => c.code === input.currency);

    const handleSelectCurrency = (code: string) => {
        onInputChange(id, 'currency', code);
        setIsOpen(false);
    };

    return (
        <div className="glass-panel group relative w-full rounded-xl transition-all duration-300 hover:border-slate-600/50 hover:shadow-lg z-10 hover:z-20">
            {isReverse && (
                <div className="absolute top-0 right-0 transform -translate-y-1/2 translate-x-2 bg-emerald-500 text-slate-900 text-[10px] font-bold px-2 py-0.5 rounded shadow-lg z-30">
                    META (BRL)
                </div>
            )}
            <div className="flex flex-row items-center p-1 sm:p-2">
                
                {/* Custom Currency Selector Dropdown */}
                <div className="relative pl-1 sm:pl-2 shrink-0" ref={dropdownRef}>
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className={`flex items-center gap-2 bg-slate-800/80 hover:bg-slate-700/80 transition-all rounded-lg pl-2 pr-2 sm:pr-3 py-2 cursor-pointer border border-slate-700/50 ${isOpen ? 'ring-2 ring-cyan-500/20 border-cyan-500/50' : ''}`}
                    >
                         {selectedCurrencyInfo && (
                             <img 
                                src={`https://flagcdn.com/w40/${selectedCurrencyInfo.countryCode}.png`} 
                                alt={selectedCurrencyInfo.code}
                                className="w-5 h-3.5 object-cover rounded shadow-sm opacity-90"
                             />
                        )}
                        <span className="text-slate-200 font-bold text-sm">{input.currency}</span>
                        <div className={`transition-transform duration-200 hidden sm:block ${isOpen ? 'rotate-180' : ''}`}>
                             <ChevronDownIcon />
                        </div>
                    </button>

                    {isOpen && (
                        <div className="absolute top-full left-0 mt-2 w-64 sm:w-72 max-w-[calc(100vw-3rem)] max-h-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50 flex flex-col animate-fade-in-down origin-top-left">
                            <div className="sticky top-0 bg-slate-900 p-3 border-b border-slate-800 z-10">
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <SearchIcon />
                                    </div>
                                    <input
                                        ref={searchInputRef}
                                        type="text"
                                        className="block w-full pl-10 pr-3 py-2 border border-slate-700 rounded-lg leading-5 bg-slate-800 text-slate-300 placeholder-slate-500 focus:outline-none focus:bg-slate-900 focus:border-cyan-500/50 text-base sm:text-sm transition-colors"
                                        placeholder={isReverse ? "Moeda da Invoice..." : "Buscar moeda..."}
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="overflow-y-auto overflow-x-hidden flex-1 py-1 custom-scrollbar">
                                {filteredCurrencies.map((c) => (
                                    <button
                                        key={c.code}
                                        onClick={() => handleSelectCurrency(c.code)}
                                        className={`w-full text-left flex items-center gap-3 px-4 py-2.5 hover:bg-slate-800 transition-colors ${c.code === input.currency ? 'bg-cyan-900/10 text-cyan-400' : 'text-slate-300'}`}
                                    >
                                        <img 
                                            src={`https://flagcdn.com/w40/${c.countryCode}.png`} 
                                            alt={c.code}
                                            className="w-5 h-3.5 object-cover rounded shadow-sm opacity-80"
                                        />
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2">
                                                <span className={`text-sm font-bold ${c.code === input.currency ? 'text-cyan-400' : 'text-slate-200'}`}>
                                                    {c.code}
                                                </span>
                                            </div>
                                            <span className="text-[10px] text-slate-500 uppercase tracking-wide font-medium">
                                                {c.name}
                                            </span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Amount Input */}
                <div className="relative flex-grow flex items-center px-2 sm:px-4 py-2 sm:py-3 overflow-hidden">
                    <span className="text-slate-600 font-medium text-base sm:text-lg select-none mr-1.5 mt-1 shrink-0">
                        {isReverse ? 'R$' : selectedCurrencyInfo?.symbol}
                    </span>
                    <input
                        type="text"
                        inputMode="numeric"
                        value={input.amount}
                        onChange={handleAmountChange}
                        placeholder="0,00"
                        className="w-full bg-transparent border-none focus:ring-0 p-0 text-2xl sm:text-3xl font-mono font-medium text-white placeholder-slate-700 transition-colors tabular-nums tracking-tight min-w-0"
                    />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-0.5 sm:gap-1 pr-1 sm:pr-2 border-l border-slate-800/50 pl-1 sm:pl-2 shrink-0">
                    <button 
                        onClick={() => onDuplicate(id)}
                        className="p-2 sm:p-2 text-slate-600 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-all"
                        title="Duplicar"
                    >
                        <DuplicateIcon />
                    </button>
                    {canBeRemoved && (
                        <button 
                            onClick={() => onRemove(id)}
                            className="p-2 sm:p-2 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
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