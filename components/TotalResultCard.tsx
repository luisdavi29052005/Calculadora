
import React from 'react';
import type { CalculationInput, CalculationResult } from '../types';

interface TotalResultCardProps {
    totalBRL: number;
    totalUSD: number;
    totalFeesAndSpread: number;
    results: Record<number, CalculationResult | null>;
    inputs: CalculationInput[];
}

export const TotalResultCard: React.FC<TotalResultCardProps> = ({ totalBRL, totalUSD, totalFeesAndSpread, results, inputs }) => {
    
    const renderBreakdown = (id: number) => {
        const result = results[id];
        const input = inputs.find(i => i.id === id);
        if (!result || !input) return null;

        const feeSymbol = new Intl.NumberFormat('en-US', { style: 'currency', currency: input.currency }).format(result.paypalFeeForeign);
        const originalAmountSymbol = new Intl.NumberFormat('en-US', { style: 'currency', currency: input.currency }).format(result.baseValue)

        return (
            <div key={id} className="bg-black/20 rounded-xl p-4 flex-1 min-w-[280px] border border-white/10 shadow-lg">
                <h4 className="font-bold text-lg text-cyan-400 mb-3 border-b border-white/10 pb-2">
                    Do valor de {originalAmountSymbol} {input.currency}
                </h4>
                <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <dt className="text-slate-400">Taxa PayPal</dt>
                        <dd className="font-mono text-slate-200">{feeSymbol}</dd>
                    </div>
                    <div className="flex justify-between">
                        <dt className="text-slate-400">Câmbio Efetivo</dt>
                        <dd className="font-mono text-slate-200">R$ {result.rateWithSpread.toFixed(4)}</dd>
                    </div>
                    <div className="flex justify-between">
                        <dt className="text-amber-400">Perda Total (Taxas + Spread)</dt>
                        <dd className="font-mono font-semibold text-amber-400">
                            {result.totalLossBRL.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </dd>
                    </div>
                </dl>
                <div className="mt-4 pt-3 border-t border-white/10 flex justify-between items-center">
                     <span className="text-slate-300 font-semibold">Você Recebe</span>
                    <span className="text-green-400 font-bold text-lg">
                        {result.finalBRL.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                </div>
            </div>
        );
    };

    const hasResults = inputs.some(input => results[input.id]);

    return (
        <div className="w-full">
            <div className="border-t border-white/10"></div>
            
            <div className="grid md:grid-cols-2 gap-6 md:gap-8 items-start my-8">
                <div className="text-center md:text-left">
                    <h2 className="text-lg text-slate-400 mb-1">Ganhos Totais Estimados</h2>
                    <p className="text-5xl md:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-cyan-400 py-1">
                        {totalBRL.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                    <p className="text-2xl text-slate-300 font-semibold mt-2" aria-live="polite">
                        ≈ {totalUSD.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                    </p>
                </div>
                <div className="text-center md:text-left bg-black/20 p-4 rounded-lg border border-white/10">
                     <h2 className="text-lg text-slate-400 mb-1">Total em Taxas e Spread</h2>
                    <p className="text-3xl md:text-4xl font-bold text-amber-400">
                        {totalFeesAndSpread.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
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
