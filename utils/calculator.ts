
import { PAYPAL_FEES, DEFAULT_FEES } from '../constants';
import type { CalculationResult } from '../types';

export function calculatePayPalConversion(
    value: number,
    currency: string,
    exchangeRate: number,
    usdRate: number,
    isMicropayment: boolean = false
): CalculationResult {
    const fees = PAYPAL_FEES[currency] || DEFAULT_FEES;
    
    // Determine Percentage Fee
    // Use specific micropayment percent from constants (10.50% Intl vs 9.50% Domestic)
    const fee_percent_val = isMicropayment ? fees.micropayment_percent : fees.fee_percent;
    const fee_percent = fee_percent_val / 100;
    
    // Determine Fixed Fee
    const fixed_fee = isMicropayment ? fees.micropayment_fixed_fee : fees.fixed_fee;
    
    const spread_percent = fees.spread_percent / 100;

    // 1. Calculate Fees in Source Currency
    const variableFeeForeign = value * fee_percent;
    const fixedFeeForeign = fixed_fee;
    const paypalFeeForeign = variableFeeForeign + fixedFeeForeign;

    // 2. Determine Exchange Rates (Apply spread only if conversion needed)
    // If currency is BRL, spread is usually 0 in constants, so rate remains 1.
    const rateWithSpread = exchangeRate * (1 - spread_percent);
    
    // 3. Calculate Net in Source Currency
    const netAfterFees = Math.max(0, value - paypalFeeForeign);
    
    // 4. Convert to BRL (Realization)
    const netBRL = netAfterFees * rateWithSpread;
    const grossBRL = value * exchangeRate;
    
    // 5. Calculate Losses in BRL
    const feeLossBRL = paypalFeeForeign * rateWithSpread;
    const fixedFeeLossBRL = fixedFeeForeign * rateWithSpread;
    const variableFeeLossBRL = variableFeeForeign * rateWithSpread;

    const spreadLossBRL = (value - paypalFeeForeign) * (exchangeRate - rateWithSpread);
    
    const totalLossBRL = grossBRL - netBRL;

    // 6. USD Equivalents (For display purposes)
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
        fixedFeeForeign,
        variableFeeForeign,
        baseValue: value,
        totalLossBRL,
        spreadLossBRL,
        feeLossBRL,
        fixedFeeLossBRL,
        variableFeeLossBRL
    };
}
