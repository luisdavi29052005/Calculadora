
export interface CurrencyInfo {
    code: string;
    name: string;
    countryCode: string;
    symbol: string;
}

export interface PayPalFeeInfo {
    fee_percent: number;
    fixed_fee: number;
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
    finalBRL: number;
    exchangeRate: number;
    rateWithSpread: number;
    paypalFeeForeign: number;
    baseValue: number;
    totalLossBRL: number;
}