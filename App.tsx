
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
            const uniqueCurrencies = [...new Set<string>(inputs.map(input => input.currency))];
            const fetchedRates = await getExchangeRates(uniqueCurrencies);
            setRates(prevRates => ({ ...prevRates, ...fetchedRates }));
        } catch (err) {
            setError('Failed to fetch exchange rates. Please try again later.');
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
        let allRatesAvailable = true;

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
            newResults[input.id] = calculatePayPalConversion(amount, input.currency, rate);
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

    const totalBRL = (Object.values(results) as (CalculationResult | null)[]).reduce((sum, result) => sum + (result?.finalBRL ?? 0), 0);

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4 selection:bg-indigo-500 selection:text-white">
            <div className="w-full max-w-5xl mx-auto">
                <header className="text-center mb-8 md:mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-500">
                        Dynamic PayPal Calculator
                    </h1>
                    <p className="text-gray-400 mt-2 text-lg">Calculate multiple payments and see your total earnings in BRL.</p>
                </header>

                <main>
                    {error && <div className="text-center text-red-400 bg-red-900/50 p-4 rounded-lg mb-8">{error}</div>}
                    
                    <div className="flex flex-wrap items-start justify-center gap-x-8 gap-y-12 mb-8">
                       {inputs.map((input, index) => (
                           <React.Fragment key={input.id}>
                                <CurrencyInputCard
                                    id={input.id}
                                    input={input}
                                    onInputChange={handleInputChange}
                                    onRemove={removeInputCard}
                                    canBeRemoved={inputs.length > 1}
                                    result={results[input.id]}
                                    currencies={CURRENCIES}
                                />
                                {index < inputs.length - 1 && (
                                     <div className="text-gray-600 self-center hidden lg:block">
                                        <PlusIcon />
                                    </div>
                                )}
                           </React.Fragment>
                       ))}
                    </div>

                    <div className="flex justify-center mb-8">
                        <button 
                            onClick={addInputCard}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75"
                        >
                            Add Another Payment
                        </button>
                    </div>

                    <div className="relative">
                        {isLoading && inputs.length > 0 && <LoadingSpinner />}
                        <TotalResultCard 
                            totalBRL={totalBRL} 
                            results={results} 
                            inputs={inputs} 
                        />
                    </div>
                </main>

                <footer className="text-center mt-12 text-gray-500 text-sm">
                    <p>
                        Calculations are based on PayPal Brazil's merchant fees document updated July 16, 2025. Exchange rates are fetched from a live API for estimation purposes.
                    </p>
                </footer>
            </div>
        </div>
    );
};

export default App;
