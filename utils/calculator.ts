
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

    // 1. Calculate Fees in Foreign Currency
    const variableFeeForeign = value * fee_percent;
    const fixedFeeForeign = fixed_fee;
    const paypalFeeForeign = variableFeeForeign + fixedFeeForeign;

    // 2. Determine Exchange Rates
    const rateWithSpread = exchangeRate * (1 - spread_percent);
    
    // 3. Calculate Net in Foreign Currency
    const netAfterFees = Math.max(0, value - paypalFeeForeign);
    
    // 4. Convert to BRL (Realization)
    const netBRL = netAfterFees * rateWithSpread;
    const grossBRL = value * exchangeRate;
    
    // 5. Calculate Losses in BRL
    // The "Loss" is the difference between the Gross Market Value and the Net Realized Value.
    // However, to breakdown specifically:
    
    // Spread Loss: The value lost purely due to the exchange rate difference on the gross amount? 
    // Usually spread is applied at conversion. 
    // PayPal logic: (Amount - Fees) * BidRate * (1 - Spread).
    // Loss Breakdown:
    // Fee Loss (in BRL terms) = FeeForeign * RateWithSpread
    const feeLossBRL = paypalFeeForeign * rateWithSpread;
    const fixedFeeLossBRL = fixedFeeForeign * rateWithSpread;
    const variableFeeLossBRL = variableFeeForeign * rateWithSpread;

    // Spread Loss = (GrossBRL) - (Value * RateWithSpread)
    // Actually, spread applies to the WHOLE amount converted.
    // The money that "disappears" due to spread is: NetAfterFees * (MarketRate - RateWithSpread)
    // plus the fees themselves lost some value due to spread? No, fees are deducted before conversion usually.
    // Let's stick to the standard financial view:
    // Spread Loss = The difference between converting at Market Rate vs Bank Rate.
    // We assume the full amount would be converted. 
    const spreadLossBRL = (value - paypalFeeForeign) * (exchangeRate - rateWithSpread);
    
    const totalLossBRL = grossBRL - netBRL;

    // 6. USD Equivalents (based on the effective current USD rate)
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
