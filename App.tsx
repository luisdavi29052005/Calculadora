
import React, { useState, useEffect, useCallback } from 'react';
import { CurrencyInputCard } from './components/CurrencyInputCard';
import { TotalResultCard } from './components/TotalResultCard';
import { PlusIcon } from './components/icons/PlusIcon';
import { LoadingSpinner } from './components/LoadingSpinner';
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
            setError('Falha ao buscar taxas de câmbio. Verifique sua conexão e tente novamente.');
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
        <div className="min-h-screen bg-transparent text-white flex flex-col p-4 sm:p-6 lg:p-8 selection:bg-cyan-300 selection:text-slate-900">
            <div className="w-full max-w-7xl mx-auto">
                <header className="text-center mb-8 sm:mb-10 md:mb-12">
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-white to-slate-400 pb-2">
                        Calculadora PayPal Premium
                    </h1>
                    <p className="text-slate-400 mt-4 text-lg md:text-xl max-w-3xl mx-auto">
                        Calcule múltiplos pagamentos internacionais e veja seus ganhos totais em BRL após todas as taxas.
                    </p>
                </header>

                <main>
                    {error && <div className="text-center text-red-400 bg-red-900/50 p-4 rounded-lg mb-8 max-w-3xl mx-auto">{error}</div>}
                    
                     <div className="relative grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
                        
                        {/* Coluna de Inputs */}
                        <div className="lg:col-span-2 lg:sticky lg:top-8 space-y-6">
                            <div className="flex justify-between items-center">
                                <h2 className="text-2xl font-bold text-slate-200 tracking-tight">Pagamentos</h2>
                                {isLoading && <LoadingSpinner />}
                            </div>
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
                            <div className="flex flex-wrap items-center gap-4">
                                <button 
                                    onClick={addInputCard}
                                    className="flex items-center gap-2 bg-slate-800 border border-slate-700 text-white font-semibold py-2 px-5 rounded-lg transition-all duration-300 transform hover:scale-105 hover:bg-slate-700 hover:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-opacity-75 shadow-lg shadow-black/20"
                                >
                                    <PlusIcon />
                                    <span>Adicionar</span>
                                </button>
                                {inputs.length > 1 && (
                                    <button 
                                        onClick={clearAllInputs}
                                        className="text-slate-400 hover:text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                                    >
                                        Limpar Tudo
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Coluna de Resultados */}
                        <div className="lg:col-span-3">
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
                        </div>
                    </div>
                </main>

                <footer className="text-center mt-12 md:mt-16 text-slate-500 text-sm">
                    <p>
                        Cálculos baseados nas taxas do PayPal Brasil (Julho 2025). Câmbio de uma API em tempo real. Use como estimativa.
                    </p>
                </footer>
            </div>
        </div>
    );
};

export default App;