
import { PAYPAL_FEES, DEFAULT_FEES } from '../constants';
import type { CalculationResult } from '../types';

export function calculatePayPalConversion(
    value: number,
    currency: string,
    exchangeRate: number,
    usdRate: number
): CalculationResult {
    const fees = PAYPAL_FEES[currency] || DEFAULT_FEES;
    const fee_percent = fees.fee_percent / 100;
    const fixed_fee = fees.fixed_fee;
    const spread_percent = fees.spread_percent / 100;

    const rateWithSpread = exchangeRate * (1 - spread_percent);
    const paypalFeeForeign = (value * fee_percent) + fixed_fee;
    const netAfterFees = Math.max(0, value - paypalFeeForeign);
    const netBRL = netAfterFees * rateWithSpread;
    
    const grossBRL = value * exchangeRate;
    const totalLossBRL = grossBRL - netBRL;

    const grossUSD = grossBRL / usdRate;
    const netUSD = netBRL / usdRate;

    return {
        netBRL,
        grossBRL,
        netUSD,
        grossUSD,
        exchangeRate,
        rateWithSpread,
        paypalFeeForeign,
        baseValue: value,
        totalLossBRL,
    };
}
