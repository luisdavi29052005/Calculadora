
import React from 'react';
import type { CalculationInput, CalculationResult } from '../types';

interface TotalResultCardProps {
    totalNetBRL: number;
    totalGrossBRL: number;
    totalNetUSD: number;
    totalGrossUSD: number;
    totalFeesAndSpread: number;
    results: Record<number, CalculationResult | null>;
    inputs: CalculationInput[];
}

export const TotalResultCard: React.FC<TotalResultCardProps> = ({ 
    totalNetBRL, totalGrossBRL, totalNetUSD, totalGrossUSD, totalFeesAndSpread, results, inputs 
}) => {
    
    const renderBreakdown = (id: number) => {
        const result = results[id];
        const input = inputs.find(i => i.id === id);
        if (!result || !input) return null;

        const feeSymbol = new Intl.NumberFormat('en-US', { style: 'currency', currency: input.currency }).format(result.paypalFeeForeign);
        const originalAmountSymbol = new Intl.NumberFormat('en-US', { style: 'currency', currency: input.currency }).format(result.baseValue)

        return (
            <div key={id} className="bg-black/20 rounded-xl p-4 flex-1 min-w-[320px] border border-white/10 shadow-lg">
                <h4 className="font-bold text-lg text-cyan-400 mb-3 border-b border-white/10 pb-2">
                    Detalhes de {originalAmountSymbol} {input.currency}
                </h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-3">
                    <div>
                        <h5 className="font-semibold text-slate-300">Em BRL (R$)</h5>
                        <dl className="mt-1 space-y-1 text-sm">
                            <div className="flex justify-between items-baseline">
                                <dt className="text-slate-400">Bruto:</dt>
                                <dd className="font-mono">{result.grossBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</dd>
                            </div>
                            <div className="flex justify-between items-baseline text-green-400">
                                <dt>Líquido:</dt>
                                <dd className="font-mono font-bold">{result.netBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</dd>
                            </div>
                        </dl>
                    </div>

                    <div>
                        <h5 className="font-semibold text-slate-300">Em USD ($)</h5>
                        <dl className="mt-1 space-y-1 text-sm">
                            <div className="flex justify-between items-baseline">
                                <dt className="text-slate-400">Bruto:</dt>
                                <dd className="font-mono">{result.grossUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</dd>
                            </div>
                            <div className="flex justify-between items-baseline text-green-400">
                                <dt>Líquido:</dt>
                                <dd className="font-mono font-bold">{result.netUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</dd>
                            </div>
                        </dl>
                    </div>
                </div>
                
                <div className="mt-4 pt-3 border-t border-white/10">
                     <dl className="space-y-1 text-sm">
                        <div className="flex justify-between">
                            <dt className="text-slate-400">Taxa PayPal ({input.currency})</dt>
                            <dd className="font-mono">{feeSymbol}</dd>
                        </div>
                        <div className="flex justify-between text-amber-400">
                            <dt>Perda Total</dt>
                            <dd className="font-mono font-semibold">
                                {result.totalLossBRL.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </dd>
                        </div>
                    </dl>
                </div>
            </div>
        );
    };

    const hasResults = inputs.some(input => results[input.id]);

    return (
        <div className="w-full">
            <div className="border-t border-white/10"></div>
            
            <div className="grid lg:grid-cols-3 gap-6 md:gap-8 items-start my-8">
                <div className="lg:col-span-2 bg-black/20 p-6 rounded-2xl border border-white/10 flex flex-col sm:flex-row justify-around text-center sm:text-left gap-6 shadow-xl">
                    <div className="flex-1">
                        <h2 className="text-lg text-slate-400 mb-1">Valor Bruto Total</h2>
                        <p className="text-4xl lg:text-5xl font-extrabold text-slate-300 tracking-tight">
                            {totalGrossBRL.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </p>
                        <p className="text-xl text-slate-400 font-semibold mt-1" aria-live="polite">
                            ≈ {totalGrossUSD.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                        </p>
                    </div>
                     <div className="w-px bg-slate-700/50 hidden sm:block"></div>
                    <div className="flex-1">
                        <h2 className="text-lg text-slate-400 mb-1">Valor Líquido Total</h2>
                        <p className="text-4xl lg:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-cyan-400 py-1 tracking-tight">
                            {totalNetBRL.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </p>
                        <p className="text-xl text-slate-300 font-semibold mt-1" aria-live="polite">
                            ≈ {totalNetUSD.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                        </p>
                    </div>
                </div>
                <div className="text-center sm:text-left bg-black/20 p-6 rounded-2xl border border-white/10 shadow-xl">
                     <h2 className="text-lg text-slate-400 mb-1">Total Perdido</h2>
                    <p className="text-3xl md:text-4xl font-bold text-amber-400">
                        {totalFeesAndSpread.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                    <p className="text-sm text-slate-500 mt-1">(Taxas + Spread Cambial)</p>
                </div>
            </div>
            
            {hasResults && (
                <>
                    <h3 className="text-xl font-bold text-center mb-6 text-slate-300">Detalhamento por Pagamento</h3>
                    <div className="flex flex-wrap gap-6 justify-center">
                        {inputs.map(input => renderBreakdown(input.id))}
                    </div>
                </>
            )}
        </div>
    );
};
