
import React, { useState, useEffect, useCallback } from 'react';
import { CurrencyInputCard } from './components/CurrencyInputCard';
import { TotalResultCard } from './components/TotalResultCard';
import { PlusIcon } from './components/icons/PlusIcon';
import type { CalculationInput, CalculationResult } from './types';
import { CURRENCIES } from './constants';
import { getExchangeRates } from './services/exchangeRateService';
import { calculatePayPalConversion } from './utils/calculator';

const App: React.FC = () => {
    const createDefaultInput = () => ({ id: Date.now(), amount: '1000', currency: 'USD' });

    const [inputs, setInputs] = useState<CalculationInput[]>([createDefaultInput()]);
    const [results, setResults] = useState<Record<number, CalculationResult | null>>({});
    const [rates, setRates] = useState<Record<string, number>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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
                const amount = parseFloat(input.amount);
                if (isNaN(amount) || amount <= 0) {
                    newResults[input.id] = null;
                    continue;
                }
                newResults[input.id] = calculatePayPalConversion(amount, input.currency, rate, usdRate);
            }
        }

        setResults(newResults);
        if(!allRatesAvailable && !isLoading && inputs.length > 0) {
             fetchRates();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [inputs, rates]);
    

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
        } else if (existingCurrencies.has('EUR') && existingCurrencies.has('GBP') && !existingCurrencies.has('CAD')) {
          newCurrency = 'CAD';
        } else if (existingCurrencies.has('EUR') && existingCurrencies.has('GBP') && existingCurrencies.has('CAD')) {
          newCurrency = 'AUD';
        }

        const newCard: CalculationInput = { id: newId, amount: '1000', currency: newCurrency };
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
        <div className="min-h-screen p-4 sm:p-6 md:p-8 flex justify-center pb-20">
            <div className="w-full max-w-6xl space-y-8 md:space-y-10">
                
                {/* SaaS Header */}
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-800/60 pb-8">
                    <div className="space-y-3 md:space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-glow-sm">
                                <span className="text-white font-bold text-lg">P</span>
                            </div>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700 tracking-wider uppercase">Pro</span>
                        </div>
                        <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-white leading-tight">
                            Simulador Financeiro
                        </h1>
                        <p className="text-slate-400 text-sm md:text-base max-w-lg">
                            Calcule taxas de recebimento internacional e conversões em tempo real com precisão.
                        </p>
                    </div>
                    <div className="flex flex-col items-start md:items-end">
                         <div className="text-left md:text-right">
                            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-2">Status da API</p>
                            <div className="flex items-center gap-2 bg-slate-900/50 border border-slate-800 rounded-full px-3 py-1.5">
                                <span className={`relative flex h-2 w-2`}>
                                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isLoading ? 'bg-amber-400' : 'bg-emerald-400'}`}></span>
                                  <span className={`relative inline-flex rounded-full h-2 w-2 ${isLoading ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                                </span>
                                <span className={`text-xs font-mono font-medium ${isLoading ? 'text-amber-400' : 'text-emerald-400'}`}>
                                    {isLoading ? 'Sincronizando...' : 'Conectado'}
                                </span>
                            </div>
                         </div>
                    </div>
                </header>

                <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* Input Section */}
                    <div className="lg:col-span-5 flex flex-col gap-6 order-2 lg:order-1">
                        <div className="flex justify-between items-end px-1">
                            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest">Entradas</h2>
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

                    {/* Results Dashboard */}
                    <div className="lg:col-span-7 order-1 lg:order-2 lg:sticky lg:top-6 space-y-6">
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
                        />
                         
                        <div className="flex justify-between items-center text-[10px] text-slate-600 px-2 font-mono">
                            <span>* Valores estimados. Spread de 3.5% aplicado.</span>
                            <span>v1.3.0</span>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default App;
