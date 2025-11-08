import React from 'react';
import type { CalculationInput, CalculationResult } from '../types';

const InfoIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const PieChart: React.FC<{ feePercent: number, spreadPercent: number }> = ({ feePercent, spreadPercent }) => {
    if (isNaN(feePercent) || isNaN(spreadPercent) || (feePercent === 0 && spreadPercent === 0)) {
        return <div className="w-10 h-10 rounded-full bg-slate-700/50 flex-shrink-0"></div>;
    }
    
    // Corresponds to text-amber-500 for "Taxas"
    const feeColor = '#f59e0b'; 
    // Corresponds to text-yellow-400 for "Spread"
    const spreadColor = '#facc15'; 

    const conicGradient = `conic-gradient(${feeColor} 0% ${feePercent}%, ${spreadColor} ${feePercent}% 100%)`;

    return <div 
        className="w-10 h-10 rounded-full flex-shrink-0" 
        style={{ background: conicGradient }} 
        role="img" 
        aria-label={`Gráfico de pizza: ${spreadPercent.toFixed(0)}% Spread, ${feePercent.toFixed(0)}% Taxas`}
    ></div>;
};


interface TotalResultCardProps {
    totalNetBRL: number;
    totalGrossBRL: number;
    totalNetUSD: number;
    totalGrossUSD: number;
    totalFeesAndSpread: number;
    totalFeeLoss: number;
    totalSpreadLoss: number;
    results: Record<number, CalculationResult | null>;
    inputs: CalculationInput[];
}

export const TotalResultCard: React.FC<TotalResultCardProps> = ({ 
    totalNetBRL, totalGrossBRL, totalNetUSD, totalGrossUSD, totalFeesAndSpread, 
    totalFeeLoss, totalSpreadLoss, results, inputs 
}) => {
    
    const hasResults = inputs.some(input => results[input.id]);
    const feePercentage = totalFeesAndSpread > 0 ? (totalFeeLoss / totalFeesAndSpread) * 100 : 0;
    const spreadPercentage = totalFeesAndSpread > 0 ? (totalSpreadLoss / totalFeesAndSpread) * 100 : 0;

    const renderDetailedCard = (id: number) => {
        const result = results[id];
        const input = inputs.find(i => i.id === id);
        if (!result || !input) return null;

        const originalAmountFormatted = result.baseValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        const feeFormatted = result.paypalFeeForeign.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        const formatOptions = { minimumFractionDigits: 2, maximumFractionDigits: 3 };

        return (
             <div key={id} className="bg-[#0F1422] rounded-2xl p-4 border border-[#1F2942] transition-all duration-300">
                <h4 className="font-bold text-lg text-slate-300 mb-3">
                    {originalAmountFormatted} <span className="text-slate-400 font-medium text-base">{input.currency}</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                    {/* BRL Breakdown */}
                    <div>
                        <h5 className="font-semibold text-slate-300 mb-1">Em BRL (R$)</h5>
                        <dl className="text-sm space-y-1">
                            <div className="flex justify-between items-baseline"><dt className="text-slate-400">Bruto:</dt><dd className="font-mono tabular-nums">{result.grossBRL.toLocaleString('pt-BR', formatOptions)}</dd></div>
                            <div className="flex justify-between items-baseline"><dt className="font-semibold text-green-400">Líquido:</dt><dd className="font-mono tabular-nums font-semibold text-green-400">{result.netBRL.toLocaleString('pt-BR', formatOptions)}</dd></div>
                        </dl>
                    </div>
                     {/* USD Breakdown */}
                    <div>
                        <h5 className="font-semibold text-slate-300 mb-1">Em USD ($)</h5>
                        <dl className="text-sm space-y-1">
                            <div className="flex justify-between items-baseline"><dt className="text-slate-400">Bruto:</dt><dd className="font-mono tabular-nums">{result.grossUSD.toLocaleString('en-US', formatOptions)}</dd></div>
                            <div className="flex justify-between items-baseline"><dt className="font-semibold text-green-400">Líquido:</dt><dd className="font-mono tabular-nums font-semibold text-green-400">{result.netUSD.toLocaleString('en-US', formatOptions)}</dd></div>
                        </dl>
                    </div>
                </div>
                {/* Loss Breakdown */}
                <div className="mt-4 pt-3 border-t border-[#1F2942]/50 text-sm">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                        <dl className="space-y-1.5">
                            <div className="flex justify-between items-baseline text-amber-400"><dt className="font-semibold">Perda Total:</dt><dd className="font-mono tabular-nums font-semibold">{result.totalLossBRL.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</dd></div>
                            <div className="flex justify-between items-baseline pl-2"><dt className="text-slate-400">└ Custo Taxas:</dt><dd className="font-mono tabular-nums text-slate-300">{result.feeLossBRL.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</dd></div>
                            <div className="flex justify-between items-baseline pl-2"><dt className="text-slate-400">└ Custo Spread:</dt><dd className="font-mono tabular-nums text-slate-300">{result.spreadLossBRL.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</dd></div>
                        </dl>
                        <div className="flex flex-col justify-end">
                             <dl>
                                 <div className="flex justify-between items-baseline">
                                     <dt className="text-slate-500 text-nowrap">Taxa PayPal ({input.currency}):</dt>
                                     <dd className="font-mono tabular-nums text-slate-400 pl-2">{feeFormatted}</dd>
                                 </div>
                            </dl>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="w-full flex flex-col gap-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Gross Card */}
                <div className="bg-[#0F1422] border border-[#1F2942] rounded-2xl p-5 shadow-2xl shadow-black/30">
                    <h2 className="text-base font-semibold text-slate-400 mb-1">Valor Bruto Total</h2>
                    <p className="text-4xl font-bold text-slate-300 tracking-tight tabular-nums">{totalGrossBRL.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                    <p className="text-lg text-slate-400 tabular-nums">≈ {totalGrossUSD.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
                </div>
                
                {/* Loss Card */}
                <div className="bg-[#0F1422] border border-[#1F2942] rounded-2xl p-5 shadow-2xl shadow-black/30">
                    <h2 className="text-base font-semibold text-slate-400 mb-1">Total Perdido</h2>
                    <p className="text-4xl font-bold text-amber-400 tracking-tight tabular-nums">{totalFeesAndSpread.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                    <div className="flex items-center gap-3 mt-2 pt-2 border-t border-[#1F2942]/50 text-sm">
                        <PieChart feePercent={feePercentage} spreadPercent={spreadPercentage} />
                        <div className="w-full">
                            <div className="flex justify-between items-baseline"><span className="text-slate-400"><span className="text-amber-500">■</span> Taxas:</span> <span className="font-mono tabular-nums">{totalFeeLoss.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></div>
                            <div className="flex justify-between items-baseline"><span className="text-slate-400"><span className="text-yellow-400">■</span> Spread:</span> <span className="font-mono tabular-nums">{totalSpreadLoss.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></div>
                        </div>
                    </div>
                </div>

                {/* Net Card (Primary) */}
                <div className="sm:col-span-2 bg-[#131A2C] border-2 border-cyan-500/50 rounded-2xl p-6 shadow-2xl shadow-black/30 relative overflow-hidden">
                     <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,_rgba(0,255,255,0.1)_0,_rgba(0,255,255,0)_40%)] animate-[spin_8s_linear_infinite] opacity-50"></div>
                     <div className="relative z-10">
                        <h2 className="text-xl font-bold text-slate-200 mb-1">Você receberá</h2>
                        <p className="text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-green-300 to-cyan-400 py-1 tracking-tight tabular-nums">{totalNetBRL.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                        <p className="text-2xl text-slate-300 font-semibold tabular-nums">≈ {totalNetUSD.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
                     </div>
                </div>
            </div>

            {hasResults && (
                 <div>
                    <h3 className="text-2xl font-bold text-slate-200 tracking-tight mb-4">Detalhamento</h3>
                    <div className="max-h-[60vh] overflow-y-auto space-y-4 pr-2">
                        {inputs.map(input => renderDetailedCard(input.id))}
                    </div>
                </div>
            )}
        </div>
    );
};