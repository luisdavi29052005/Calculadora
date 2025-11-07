
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
    const [inputs, setInputs] = useState<CalculationInput[]>([
        { id: Date.now(), amount: '1000', currency: 'USD' },
    ]);

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
            const uniqueCurrencies = [...new Set<string>([...inputCurrencies, 'USD'])]; // Always fetch USD rate
            const fetchedRates = await getExchangeRates(uniqueCurrencies);
            setRates(prevRates => ({ ...prevRates, ...fetchedRates }));
        } catch (err) {
            setError('Falha ao buscar taxas de câmbio. Por favor, tente novamente mais tarde.');
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
             for (const input of inputs) {
                newResults[input.id] = null;
             }
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
        if(!allRatesAvailable && !isLoading) {
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
        } else if (existingCurrencies.has('EUR') && existingCurrencies.has('GBP')) {
          newCurrency = 'CAD';
        }

        const newCard: CalculationInput = { id: newId, amount: '1000', currency: newCurrency };
        setInputs(prevInputs => [...prevInputs, newCard]);
    };

    const removeInputCard = (idToRemove: number) => {
        if (inputs.length <= 1) return; // Prevent removing the last card
        setInputs(prevInputs => prevInputs.filter(input => input.id !== idToRemove));
    };

    const validResults = Object.values(results).filter((r): r is CalculationResult => r !== null);
    
    const totalNetBRL = validResults.reduce((sum, result) => sum + result.netBRL, 0);
    const totalGrossBRL = validResults.reduce((sum, result) => sum + result.grossBRL, 0);

    const totalNetUSD = validResults.reduce((sum, result) => sum + result.netUSD, 0);
    const totalGrossUSD = validResults.reduce((sum, result) => sum + result.grossUSD, 0);

    const totalFeesAndSpread = validResults.reduce((sum, result) => sum + result.totalLossBRL, 0);

    return (
        <div className="min-h-screen bg-transparent text-white flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 selection:bg-cyan-300 selection:text-slate-900">
            <div className="w-full max-w-5xl mx-auto">
                <header className="text-center mb-10 md:mb-12">
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-white to-slate-400 pb-2">
                        Calculadora PayPal Premium
                    </h1>
                    <p className="text-slate-400 mt-4 text-lg md:text-xl max-w-3xl mx-auto">
                        Calcule múltiplos pagamentos internacionais e veja seus ganhos totais em BRL após todas as taxas.
                    </p>
                </header>

                <main>
                    {error && <div className="text-center text-red-400 bg-red-900/50 p-4 rounded-lg mb-8 max-w-3xl mx-auto">{error}</div>}
                    
                    <div className="relative w-full max-w-4xl mx-auto bg-slate-900/50 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl">
                        {isLoading && inputs.length > 0 && <LoadingSpinner />}

                        <div className="space-y-4 mb-6">
                           {inputs.map((input) => (
                               <CurrencyInputCard
                                   key={input.id}
                                   id={input.id}
                                   input={input}
                                   onInputChange={handleInputChange}
                                   onRemove={removeInputCard}
                                   canBeRemoved={inputs.length > 1}
                                   result={results[input.id]}
                                   currencies={CURRENCIES}
                               />
                           ))}
                        </div>

                        <div className="flex justify-start mb-6">
                            <button 
                                onClick={addInputCard}
                                className="flex items-center gap-2 bg-slate-800/50 border border-white/20 text-white font-semibold py-2 px-5 rounded-lg transition-all duration-300 transform hover:scale-105 hover:bg-slate-700/50 hover:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-opacity-75 shadow-lg shadow-black/20"
                            >
                                <PlusIcon />
                                <span>Adicionar Pagamento</span>
                            </button>
                        </div>
                       
                        <TotalResultCard 
                            totalNetBRL={totalNetBRL}
                            totalGrossBRL={totalGrossBRL}
                            totalNetUSD={totalNetUSD}
                            totalGrossUSD={totalGrossUSD}
                            totalFeesAndSpread={totalFeesAndSpread}
                            results={results} 
                            inputs={inputs} 
                        />
                    </div>
                </main>

                <footer className="text-center mt-16 text-slate-500 text-xs">
                    <p>
                        Os cálculos são baseados no documento de taxas para vendedores do PayPal Brasil atualizado em 16 de julho de 2025. As taxas de câmbio são buscadas de uma API em tempo real para fins de estimativa.
                    </p>
                </footer>
            </div>
        </div>
    );
};

export default App;
