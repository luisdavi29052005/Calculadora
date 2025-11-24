import React, { useState, useEffect, useCallback, useRef } from 'react';
import { CurrencyInputCard } from './components/CurrencyInputCard';
import { TotalResultCard } from './components/TotalResultCard';
import { PlusIcon } from './components/icons/PlusIcon';
import { InfoIcon } from './components/icons/InfoIcon';
import { CloseIcon } from './components/icons/CloseIcon';
import type { CalculationInput, CalculationResult, CalculationMode } from './types';
import { CURRENCIES } from './constants';
import { getExchangeRates } from './services/exchangeRateService';
import { calculatePayPalConversion, calculateReversePayPalConversion, parseMoney } from './utils/calculator';

const App: React.FC = () => {
    // Initial value formatted as pt-BR
    const createDefaultInput = () => ({ id: Date.now(), amount: '1.000,00', currency: 'USD' });

    const [inputs, setInputs] = useState<CalculationInput[]>([createDefaultInput()]);
    const [results, setResults] = useState<Record<number, CalculationResult | null>>({});
    const [rates, setRates] = useState<Record<string, number>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isMicropayment, setIsMicropayment] = useState(false);
    const [calculationMode, setCalculationMode] = useState<CalculationMode>('STANDARD');
    const [showInfo, setShowInfo] = useState(false);
    const infoRef = useRef<HTMLDivElement>(null);

    // Click outside to close tooltip
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (infoRef.current && !infoRef.current.contains(event.target as Node)) {
                setShowInfo(false);
            }
        }
        if (showInfo) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showInfo]);

    const fetchRates = useCallback(async () => {
        if (inputs.length === 0) {
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const inputCurrencies = inputs.map(input => input.currency);
            const uniqueCurrencies = [...new Set<string>([...inputCurrencies, 'USD'])]; 
            const fetchedRates = await getExchangeRates(uniqueCurrencies);
            setRates(prevRates => ({ ...prevRates, ...fetchedRates }));
        } catch (err) {
            setError('Falha ao atualizar câmbio. Verifique sua conexão.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [inputs]);

    useEffect(() => {
        fetchRates();
    }, [fetchRates]);

    useEffect(() => {
        const newResults: Record<number, CalculationResult | null> = {};
        const usdRate = rates['USD'];
        let allRatesAvailable = true;

        if (usdRate === undefined) {
             allRatesAvailable = false;
             for (const input of inputs) newResults[input.id] = null;
        } else {
            for (const input of inputs) {
                const rate = rates[input.currency];
                if (rate === undefined) {
                    allRatesAvailable = false;
                    newResults[input.id] = null;
                    continue;
                }
                
                // Parse the masked money string "1.000,00" -> 1000.00
                const amount = parseMoney(input.amount);
                
                if (isNaN(amount) || amount <= 0) {
                    newResults[input.id] = null;
                    continue;
                }
                
                if (calculationMode === 'STANDARD') {
                    newResults[input.id] = calculatePayPalConversion(amount, input.currency, rate, usdRate, isMicropayment);
                } else {
                    // Reverse Mode: Amount is Target BRL
                    newResults[input.id] = calculateReversePayPalConversion(amount, input.currency, rate, usdRate, isMicropayment);
                }
            }
        }

        setResults(newResults);
        if(!allRatesAvailable && !isLoading && inputs.length > 0) {
             fetchRates();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [inputs, rates, isMicropayment, calculationMode]);
    

    const handleInputChange = (id: number, field: 'amount' | 'currency', value: string) => {
        setInputs(prevInputs =>
            prevInputs.map(input =>
                input.id === id ? { ...input, [field]: value } : input
            )
        );
    };
    
    const addInputCard = () => {
        const newId = Date.now();
        const existingCurrencies = new Set(inputs.map(i => i.currency));
        let newCurrency = 'EUR';
        if (existingCurrencies.has('EUR') && !existingCurrencies.has('GBP')) {
          newCurrency = 'GBP';
        }

        const newCard: CalculationInput = { id: newId, amount: '1.000,00', currency: newCurrency };
        setInputs(prevInputs => [...prevInputs, newCard]);
    };

    const removeInputCard = (idToRemove: number) => {
        if (inputs.length <= 1) return;
        setInputs(prevInputs => prevInputs.filter(input => input.id !== idToRemove));
    };
    
    const duplicateInputCard = (idToDuplicate: number) => {
        const cardToDuplicate = inputs.find(input => input.id === idToDuplicate);
        if (cardToDuplicate) {
            const newCard: CalculationInput = { ...cardToDuplicate, id: Date.now() };
            setInputs(prevInputs => [...prevInputs, newCard]);
        }
    };

    const clearAllInputs = () => {
        setInputs([createDefaultInput()]);
        setResults({});
    };

    const validResults = Object.values(results).filter((r): r is CalculationResult => r !== null);
    
    const totalNetBRL = validResults.reduce((sum, result) => sum + result.netBRL, 0);
    const totalGrossBRL = validResults.reduce((sum, result) => sum + result.grossBRL, 0);
    const totalNetUSD = validResults.reduce((sum, result) => sum + result.netUSD, 0);
    const totalGrossUSD = validResults.reduce((sum, result) => sum + result.grossUSD, 0);
    const totalFeesAndSpread = validResults.reduce((sum, result) => sum + result.totalLossBRL, 0);
    const totalFeeLoss = validResults.reduce((sum, result) => sum + result.feeLossBRL, 0);
    const totalSpreadLoss = validResults.reduce((sum, result) => sum + result.spreadLossBRL, 0);


    return (
        <div className="min-h-screen w-full p-4 sm:p-6 md:p-8 flex justify-center pb-10 overflow-hidden">
            <div className="w-full max-w-6xl space-y-8 md:space-y-10">
                
                {/* SaaS Header */}
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-800/60 pb-8">
                    <div className="space-y-3 md:space-y-2">
                        <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-white leading-tight">
                            Simulador Financeiro
                        </h1>
                        <p className="text-slate-400 text-sm md:text-base max-w-lg leading-relaxed">
                            A ferramenta definitiva para freelancers negociarem taxas e invoices internacionais.
                        </p>
                    </div>
                    
                    {/* Controls Row */}
                    <div className="flex flex-row items-center gap-2 overflow-visible pb-1 md:pb-0 w-full md:w-auto md:justify-end flex-nowrap">
                         
                         {/* Calculation Mode Toggle */}
                         <div className="flex bg-slate-900/80 p-1 rounded-lg border border-slate-700/50 shrink-0">
                             <button
                                onClick={() => setCalculationMode('STANDARD')}
                                className={`px-3 py-1 text-xs font-bold rounded-md transition-all whitespace-nowrap ${calculationMode === 'STANDARD' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                             >
                                 Receber
                             </button>
                             <button
                                onClick={() => setCalculationMode('REVERSE')}
                                className={`px-3 py-1 text-xs font-bold rounded-md transition-all whitespace-nowrap ${calculationMode === 'REVERSE' ? 'bg-cyan-600 text-white shadow-glow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                                title="Calcula quanto cobrar para receber um valor exato"
                             >
                                 Cobrar
                             </button>
                         </div>

                         <div className="flex items-center gap-1 bg-slate-900/50 p-1 rounded-lg border border-slate-800 shrink-0">
                             <button
                                onClick={() => setIsMicropayment(false)}
                                className={`px-3 py-1.5 md:py-1 text-xs font-bold rounded-md transition-all whitespace-nowrap ${!isMicropayment ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                             >
                                 <span className="sm:hidden">Padrão</span>
                                 <span className="hidden sm:inline">Conta Padrão</span>
                             </button>
                             <button
                                onClick={() => setIsMicropayment(true)}
                                className={`px-3 py-1.5 md:py-1 text-xs font-bold rounded-md transition-all whitespace-nowrap ${isMicropayment ? 'bg-indigo-600 text-white shadow-glow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                             >
                                 <span className="sm:hidden">Micro</span>
                                 <span className="hidden sm:inline">Conta Micro</span>
                             </button>
                             
                             {/* Info Button */}
                             <div className="relative border-l border-slate-800 pl-1 ml-1">
                                 <button 
                                     onClick={() => setShowInfo(!showInfo)}
                                     className="p-2 text-slate-500 hover:text-cyan-400 transition-colors rounded-full hover:bg-slate-800/50"
                                     aria-label="Informações"
                                 >
                                     <InfoIcon />
                                 </button>
                                 
                                 {showInfo && (
                                     <>
                                        <div 
                                            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 sm:hidden animate-fade-in"
                                            onClick={() => setShowInfo(false)}
                                        ></div>
                                        <div 
                                            ref={infoRef}
                                            className={`
                                                fixed sm:absolute z-50 
                                                top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 sm:translate-x-0 sm:translate-y-0 sm:top-full sm:left-auto sm:right-0 sm:mt-2
                                                w-[90vw] sm:w-96 max-w-sm 
                                                bg-slate-900/95 border border-slate-700/80 rounded-xl shadow-2xl 
                                                text-sm animate-fade-in origin-center sm:origin-top-right backdrop-blur-xl p-5
                                            `}
                                        >
                                             <div className="flex justify-between items-start border-b border-slate-800 pb-2 mb-3">
                                                 <h4 className="font-bold text-white flex items-center gap-2">
                                                     <InfoIcon />
                                                     Guia do Freelancer
                                                 </h4>
                                                 <button onClick={() => setShowInfo(false)} className="p-1 -mr-2 text-slate-400 hover:text-white transition-colors">
                                                     <CloseIcon />
                                                 </button>
                                             </div>
                                             
                                             <div className="space-y-4 max-h-[60vh] overflow-y-auto sm:max-h-none custom-scrollbar">
                                                <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-700/50">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                                                        <strong className="text-slate-200">Modo Cobrar (Reverse)</strong>
                                                    </div>
                                                    <p className="text-slate-400 text-xs leading-relaxed">
                                                        Use isso para negociar. Digite quanto quer <strong>receber no bolso (em R$)</strong> e nós calculamos quanto você deve colocar na Invoice em USD/EUR.
                                                    </p>
                                                </div>

                                                <div className="bg-indigo-900/20 p-3 rounded-lg border border-indigo-500/30">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                                                        <strong className="text-white">Tipos de Conta</strong>
                                                    </div>
                                                    <p className="text-slate-400 text-xs mb-1">
                                                        <strong>Padrão:</strong> Melhor para transações acima de R$ 30,00.
                                                    </p>
                                                    <p className="text-slate-400 text-xs">
                                                        <strong>Micro:</strong> Peça ao suporte para ativar se você vende itens muito baratos (abaixo de $5).
                                                    </p>
                                                </div>
                                                
                                                <a 
                                                    href="https://www.paypal.com/br/webapps/mpp/merchant-fees" 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 text-xs border-t border-slate-800 pt-3"
                                                >
                                                    <span>Ver tabela oficial de tarifas (PDF)</span>
                                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                                </a>
                                             </div>
                                         </div>
                                     </>
                                 )}
                             </div>
                         </div>

                         <div className="flex items-center gap-2 bg-slate-900/50 border border-slate-800 rounded-full px-3 py-1.5 shrink-0">
                            <span className={`relative flex h-2 w-2`}>
                              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isLoading ? 'bg-amber-400' : 'bg-emerald-400'}`}></span>
                              <span className={`relative inline-flex rounded-full h-2 w-2 ${isLoading ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                            </span>
                            <span className={`text-xs font-mono font-medium ${isLoading ? 'text-amber-400' : 'text-emerald-400'}`}>
                                <span className="sm:hidden">{isLoading ? 'Sinc...' : 'Conectado'}</span>
                                <span className="hidden sm:inline">{isLoading ? 'Sincronizando...' : 'Conectado'}</span>
                            </span>
                        </div>
                    </div>
                </header>

                <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    <div className="lg:col-span-5 flex flex-col gap-6 order-1 lg:order-1">
                        <div className="flex justify-between items-end px-1">
                            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest">
                                {calculationMode === 'STANDARD' ? 'Valores a Receber (Bruto)' : 'Metas de Recebimento (Líquido)'}
                            </h2>
                            {inputs.length > 1 && (
                                <button 
                                    onClick={clearAllInputs}
                                    className="text-xs text-slate-500 hover:text-red-400 transition-colors px-2 py-1 hover:bg-red-500/5 rounded"
                                >
                                    Limpar Tudo
                                </button>
                            )}
                        </div>

                        {error && (
                            <div className="glass-panel border-l-4 border-l-red-500 text-red-200 text-sm p-4 rounded-r-lg flex items-center gap-3">
                                <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            {inputs.map((input) => (
                                <CurrencyInputCard
                                    key={input.id}
                                    id={input.id}
                                    input={input}
                                    onInputChange={handleInputChange}
                                    onRemove={removeInputCard}
                                    onDuplicate={duplicateInputCard}
                                    canBeRemoved={inputs.length > 1}
                                    currencies={CURRENCIES}
                                    isReverse={calculationMode === 'REVERSE'}
                                />
                            ))}
                        </div>

                        <button 
                            onClick={addInputCard}
                            className="group relative w-full flex items-center justify-center gap-3 py-4 border border-dashed border-slate-700 rounded-xl text-slate-400 font-medium transition-all hover:border-cyan-500/40 hover:text-cyan-400 hover:bg-slate-800/50 active:scale-[0.99]"
                        >
                            <div className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center group-hover:bg-cyan-500/20 transition-colors">
                                <PlusIcon />
                            </div>
                            <span>Adicionar Transação</span>
                        </button>
                    </div>

                    <div className="lg:col-span-7 order-2 lg:order-2 lg:sticky lg:top-6 space-y-6">
                         <TotalResultCard 
                            totalNetBRL={totalNetBRL}
                            totalGrossBRL={totalGrossBRL}
                            totalNetUSD={totalNetUSD}
                            totalGrossUSD={totalGrossUSD}
                            totalFeesAndSpread={totalFeesAndSpread}
                            totalFeeLoss={totalFeeLoss}
                            totalSpreadLoss={totalSpreadLoss}
                            results={results} 
                            inputs={inputs}
                            isMicropayment={isMicropayment}
                            mode={calculationMode}
                        />
                         
                        <div className="flex justify-between items-center text-[10px] text-slate-600 px-2 font-mono">
                            <span>* Taxas baseadas no PDF Jul/2025.</span>
                            <span>v2.1.0</span>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default App;