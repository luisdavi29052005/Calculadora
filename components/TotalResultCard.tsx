
import React, { useState } from 'react';
import type { CalculationInput, CalculationResult, CalculationMode } from '../types';
import { PAYPAL_FEES, DEFAULT_FEES } from '../constants';

const DonutChart: React.FC<{ percentage: number, color: string, size?: number }> = ({ percentage, color, size = 40 }) => {
    const radius = size / 2 - 4;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
    
    return (
        <div style={{ width: size, height: size }} className="relative flex items-center justify-center">
            <svg className="transform -rotate-90 w-full h-full" viewBox={`0 0 ${size} ${size}`}>
                <circle cx={size/2} cy={size/2} r={radius} stroke="#1e293b" strokeWidth="4" fill="transparent" />
                <circle cx={size/2} cy={size/2} r={radius} stroke={color} strokeWidth="4" fill="transparent" strokeDasharray={strokeDasharray} strokeLinecap="round" />
            </svg>
        </div>
    );
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
    isMicropayment?: boolean;
    mode?: CalculationMode;
}

export const TotalResultCard: React.FC<TotalResultCardProps> = ({ 
    totalNetBRL, totalGrossBRL, totalNetUSD, totalGrossUSD, totalFeesAndSpread, 
    totalFeeLoss, totalSpreadLoss, results, inputs, isMicropayment = false, mode = 'STANDARD'
}) => {
    
    const [isBreakdownOpen, setIsBreakdownOpen] = useState(true);
    
    const hasResults = inputs.some(input => results[input.id]);
    const validResults = Object.values(results).filter((r): r is CalculationResult => r !== null);

    const totalFixedFeeLossBRL = validResults.reduce((sum, r) => sum + r.fixedFeeLossBRL, 0);
    const totalVariableFeeLossBRL = validResults.reduce((sum, r) => sum + r.variableFeeLossBRL, 0);

    const impliedUSDRate = totalGrossBRL > 0 ? totalGrossBRL / totalGrossUSD : 5.0; 
    
    const totalFixedFeeLossUSD = totalFixedFeeLossBRL / impliedUSDRate;
    const totalVariableFeeLossUSD = totalVariableFeeLossBRL / impliedUSDRate;
    const totalSpreadLossUSD = totalSpreadLoss / impliedUSDRate;

    const netPercentage = totalGrossBRL > 0 ? (totalNetBRL / totalGrossBRL) * 100 : 0;
    const totalCostPercentage = 100 - netPercentage;
    
    const uniqueCurrencies = [...new Set(inputs.map(i => i.currency))];
    let variableFeeLabel = "";
    
    if (uniqueCurrencies.length === 1 && uniqueCurrencies[0] === 'BRL') {
        variableFeeLabel = isMicropayment ? '9.50%' : '4.79%';
    } else if (uniqueCurrencies.includes('BRL')) {
        variableFeeLabel = 'Misto';
    } else {
        variableFeeLabel = isMicropayment ? '10.50%' : '6.40%';
    }

    // Smart Suggestion Logic
    const showBetterOptions = totalCostPercentage > 5; // If losing more than 5%, show tip

    const renderListItem = (id: number) => {
        const result = results[id];
        const input = inputs.find(i => i.id === id);
        if (!result || !input) return null;

        const originalAmountFormatted = parseFloat(input.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        const feeOriginal = result.paypalFeeForeign.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        const fees = PAYPAL_FEES[input.currency] || DEFAULT_FEES;
        const percentUsed = isMicropayment ? fees.micropayment_percent : fees.fee_percent;

        // In reverse mode, the input amount is the Target Net, but the calculation base was Gross.
        // We should show the GROSS amount as the main item in reverse mode (The Invoice Amount).
        const displayAmount = mode === 'REVERSE' ? result.grossBRL / result.exchangeRate : parseFloat(input.amount);
        const displayCurrency = input.currency;

        return (
             <div key={id} className="group flex flex-col sm:grid sm:grid-cols-12 gap-3 sm:gap-4 items-start sm:items-center p-4 border-b border-slate-800/50 last:border-0 hover:bg-slate-800/30 transition-colors">
                
                <div className="w-full sm:col-span-4 flex items-center gap-3">
                     <div className={`w-1 h-8 rounded-full transition-colors shrink-0 ${mode === 'REVERSE' ? 'bg-cyan-500' : 'bg-slate-700 group-hover:bg-cyan-500'}`}></div>
                     <div>
                        <div className="text-base font-bold text-slate-200 tabular-nums">
                            {displayCurrency} {displayAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                            {mode === 'REVERSE' ? 'Valor da Invoice (Bruto)' : 'Valor da Entrada'}
                        </div>
                     </div>
                </div>
                
                <div className="w-full sm:col-span-5 flex flex-col gap-1 pl-4 sm:pl-0 border-l border-slate-800/50 sm:border-l-0">
                    <div className="flex justify-between items-center text-xs">
                         <span className="text-slate-500">Taxas PayPal ({percentUsed.toFixed(2)}%):</span>
                         <div className="text-right">
                             <span className="text-amber-500/90 font-mono">-{feeOriginal} {input.currency}</span>
                         </div>
                    </div>
                    {result.spreadLossBRL > 0 && (
                        <div className="flex justify-between items-center text-xs">
                             <span className="text-slate-500">Spread:</span>
                             <span className="text-red-400 font-mono text-right">-{result.spreadLossBRL.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                        </div>
                    )}
                </div>

                <div className="w-full sm:col-span-3 flex justify-between sm:block sm:text-right pl-4 sm:pl-2 border-l border-slate-800/50">
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5 sm:hidden">Líquido</div>
                    <div className="text-lg font-bold text-emerald-400 font-mono tabular-nums">
                        {result.netBRL.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="w-full space-y-6 animate-fade-in">
            
            <div className="relative glass-panel rounded-2xl p-6 lg:p-8 overflow-hidden shadow-2xl">
                 <div className="absolute -top-32 -right-32 w-80 h-80 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none"></div>
                 <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>
                 
                 <div className="relative z-10 flex flex-col gap-6 sm:gap-8">
                     
                     <div className="flex flex-col md:flex-row justify-between md:items-end gap-6">
                        <div className="space-y-2 w-full">
                            <h2 className="text-slate-400 font-semibold text-xs uppercase tracking-[0.2em] flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full animate-pulse ${mode === 'REVERSE' ? 'bg-cyan-400' : 'bg-emerald-500'}`}></div>
                                {mode === 'REVERSE' ? 'Valor a Cobrar (Invoice)' : 'Valor Líquido Estimado'}
                            </h2>
                            <div className="flex flex-col">
                                <div className="flex items-baseline gap-1 flex-wrap">
                                    <span className="text-2xl md:text-3xl text-slate-500 font-light mr-1">
                                        {mode === 'REVERSE' ? '$' : 'R$'}
                                    </span>
                                    <span className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight font-mono tabular-nums text-shadow-sm break-all leading-tight">
                                        {mode === 'REVERSE' 
                                            ? totalGrossUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                                            : totalNetBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                                        }
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 mt-2 bg-slate-900/40 w-fit px-3 py-1 rounded-full border border-slate-800/50">
                                    <span className="text-slate-300 font-mono text-sm font-medium">
                                        {mode === 'REVERSE' 
                                            ? `Para receber ≈ ${totalNetBRL.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`
                                            : `≈ ${totalNetUSD.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}`
                                        }
                                    </span>
                                </div>
                            </div>
                        </div>

                         <div className="hidden md:flex flex-col items-center justify-center bg-slate-900/30 p-4 rounded-xl border border-slate-800/50 backdrop-blur-sm shrink-0">
                             <DonutChart percentage={netPercentage} color={mode === 'REVERSE' ? '#22d3ee' : '#10b981'} size={60} />
                             <span className="text-[10px] text-slate-400 mt-2 font-medium">EFICIÊNCIA</span>
                             <span className={`text-sm font-bold ${mode === 'REVERSE' ? 'text-cyan-400' : 'text-emerald-400'}`}>{netPercentage.toFixed(1)}%</span>
                         </div>
                     </div>
                     
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="bg-slate-900/60 rounded-xl border border-slate-800 p-3 sm:p-4">
                             <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                                 {mode === 'REVERSE' ? 'Meta Líquida' : 'Bruto Total'}
                             </span>
                             <div className="text-sm sm:text-lg font-mono text-slate-200 font-medium tabular-nums truncate">
                                  {mode === 'REVERSE' 
                                    ? totalNetBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                                    : totalGrossBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                                  }
                             </div>
                        </div>
                        <div className="bg-slate-900/60 rounded-xl border border-slate-800 p-3 sm:p-4">
                             <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Total Taxas</span>
                             <div className="text-sm sm:text-lg font-mono text-red-400 font-medium tabular-nums truncate">
                                  -{totalFeesAndSpread.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                             </div>
                        </div>
                         <div className="bg-slate-900/60 rounded-xl border border-slate-800 p-3 sm:p-4 col-span-2 md:col-span-2 flex items-center justify-between">
                             <div className='flex flex-col'>
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Custo Efetivo</span>
                                <div className="text-xs text-slate-500">Perda Total</div>
                             </div>
                             <div className="text-xl font-mono text-slate-200 font-bold tabular-nums">
                                  {totalCostPercentage.toFixed(2)}%
                             </div>
                        </div>
                     </div>
                 </div>
            </div>

            {/* Smart Suggestion (Hub Strategy) */}
            {showBetterOptions && (
                 <div className="bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border border-indigo-500/30 rounded-xl p-4 flex items-start gap-3 animate-fade-in">
                     <div className="p-2 bg-indigo-500/20 rounded-lg shrink-0 text-indigo-300">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                         </svg>
                     </div>
                     <div>
                         <h4 className="text-indigo-200 font-bold text-sm mb-1">Você está perdendo {totalCostPercentage.toFixed(1)}% do seu dinheiro</h4>
                         <p className="text-slate-400 text-xs leading-relaxed">
                             Para freelancers recebendo acima de $500, plataformas como <strong>Husky</strong> ou <strong>TechFX</strong> costumam cobrar apenas 1% a 2%.
                         </p>
                     </div>
                 </div>
            )}

            <div className="glass-panel rounded-xl overflow-hidden transition-all duration-300">
                <button 
                    onClick={() => setIsBreakdownOpen(!isBreakdownOpen)}
                    className="w-full flex items-center justify-between p-4 bg-slate-900/40 hover:bg-slate-800/60 transition-colors border-b border-slate-800/50"
                >
                    <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-500" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                        </svg>
                        <span className="text-sm font-bold text-slate-200 uppercase tracking-wide">Raio-X das Taxas</span>
                    </div>
                    <svg className={`w-5 h-5 text-slate-500 transform transition-transform ${isBreakdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                {isBreakdownOpen && (
                    <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-900/20">
                        {/* 1. Taxa Fixa */}
                        <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="relative space-y-3">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-semibold text-slate-300">Taxa Fixa</h4>
                                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">Por transação</span>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-lg font-mono font-medium text-slate-200">
                                        -{totalFixedFeeLossBRL.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    </div>
                                    <div className="text-xs font-mono text-slate-500">
                                        ≈ {totalFixedFeeLossUSD.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                                    </div>
                                </div>
                                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-blue-500 h-full rounded-full" style={{ width: `${(totalFixedFeeLossBRL / totalFeesAndSpread) * 100}%` }}></div>
                                </div>
                            </div>
                        </div>

                        {/* 2. Taxa Variável */}
                        <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="relative space-y-3">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-semibold text-slate-300">Taxa Comercial</h4>
                                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">{variableFeeLabel}</span>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-lg font-mono font-medium text-amber-500">
                                        -{totalVariableFeeLossBRL.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    </div>
                                    <div className="text-xs font-mono text-slate-500">
                                        ≈ {totalVariableFeeLossUSD.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                                    </div>
                                </div>
                                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-amber-500 h-full rounded-full" style={{ width: `${(totalVariableFeeLossBRL / totalFeesAndSpread) * 100}%` }}></div>
                                </div>
                            </div>
                        </div>

                        {/* 3. Spread */}
                        <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="relative space-y-3">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-semibold text-slate-300">Spread Cambial</h4>
                                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">3.5%</span>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-lg font-mono font-medium text-red-400">
                                        -{totalSpreadLoss.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    </div>
                                    <div className="text-xs font-mono text-slate-500">
                                        ≈ {totalSpreadLossUSD.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                                    </div>
                                </div>
                                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-red-500 h-full rounded-full" style={{ width: `${(totalSpreadLoss / totalFeesAndSpread) * 100}%` }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {hasResults && (
                <div className="glass-panel rounded-xl overflow-hidden border border-slate-800">
                    <div className="bg-slate-900/80 px-4 sm:px-6 py-4 border-b border-slate-800 flex justify-between items-center backdrop-blur-md">
                        <h3 className="text-sm font-bold text-slate-200 tracking-wide uppercase">Extrato Detalhado</h3>
                        <span className="text-[10px] sm:text-xs font-mono text-slate-500 bg-slate-800 px-2 py-1 rounded border border-slate-700/50">{inputs.length} ITEMS</span>
                    </div>
                    <div className="divide-y divide-slate-800/50 bg-slate-900/20">
                        {inputs.map(input => renderListItem(input.id))}
                    </div>
                </div>
            )}
        </div>
    );
};
