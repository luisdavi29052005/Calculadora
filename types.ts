
export interface CurrencyInfo {
    code: string;
    name: string;
    countryCode: string;
    symbol: string;
}

export interface PayPalFeeInfo {
    fee_percent: number;
    micropayment_percent: number;
    fixed_fee: number;
    micropayment_fixed_fee: number;
    spread_percent: number;
}

export interface PayPalFees {
    [key: string]: PayPalFeeInfo;
}

export interface CalculationInput {
    id: number;
    amount: string;
    currency: string;
}

export interface CalculationResult {
    netBRL: number;
    grossBRL: number;
    netUSD: number;
    grossUSD: number;
    exchangeRate: number;
    rateWithSpread: number;
    
    // Fee Breakdown
    paypalFeeForeign: number; // Total fee in foreign currency
    fixedFeeForeign: number;  // Just the fixed part (e.g., 0.30)
    variableFeeForeign: number; // Just the % part
    
    baseValue: number;
    
    // Losses converted to BRL
    totalLossBRL: number;
    spreadLossBRL: number;
    feeLossBRL: number;     // Total fee loss
    fixedFeeLossBRL: number; // Portion of fee loss due to fixed fee
    variableFeeLossBRL: number; // Portion of fee loss due to % fee
}
