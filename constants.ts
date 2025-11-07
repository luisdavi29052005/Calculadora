
import type { PayPalFees, CurrencyInfo } from './types';

// For international commercial transactions received by a Brazilian account.
// Percentage fee is 4.79% (domestic) + 1.61% (international) = 6.40%.
// Currency conversion spread is 3.50% for receiving payments.
// Fees based on document: "pt-br-merchant-fees-16-july-2025"
export const PAYPAL_FEES: PayPalFees = {
    "AUD": { "fee_percent": 6.40, "fixed_fee": 0.30, "spread_percent": 3.50 },
    "CAD": { "fee_percent": 6.40, "fixed_fee": 0.30, "spread_percent": 3.50 },
    "CZK": { "fee_percent": 6.40, "fixed_fee": 10.00, "spread_percent": 3.50 },
    "DKK": { "fee_percent": 6.40, "fixed_fee": 2.60, "spread_percent": 3.50 },
    "EUR": { "fee_percent": 6.40, "fixed_fee": 0.35, "spread_percent": 3.50 },
    "HKD": { "fee_percent": 6.40, "fixed_fee": 2.35, "spread_percent": 3.50 },
    "HUF": { "fee_percent": 6.40, "fixed_fee": 90.00, "spread_percent": 3.50 },
    "ILS": { "fee_percent": 6.40, "fixed_fee": 1.20, "spread_percent": 3.50 },
    "JPY": { "fee_percent": 6.40, "fixed_fee": 40.00, "spread_percent": 3.50 },
    "MYR": { "fee_percent": 6.40, "fixed_fee": 2.00, "spread_percent": 3.50 },
    "MXN": { "fee_percent": 6.40, "fixed_fee": 4.00, "spread_percent": 3.50 },
    "TWD": { "fee_percent": 6.40, "fixed_fee": 10.00, "spread_percent": 3.50 },
    "NZD": { "fee_percent": 6.40, "fixed_fee": 0.45, "spread_percent": 3.50 },
    "NOK": { "fee_percent": 6.40, "fixed_fee": 2.80, "spread_percent": 3.50 },
    "PHP": { "fee_percent": 6.40, "fixed_fee": 15.00, "spread_percent": 3.50 },
    "PLN": { "fee_percent": 6.40, "fixed_fee": 1.35, "spread_percent": 3.50 },
    "RUB": { "fee_percent": 6.40, "fixed_fee": 10.00, "spread_percent": 3.50 },
    "SGD": { "fee_percent": 6.40, "fixed_fee": 0.50, "spread_percent": 3.50 },
    "SEK": { "fee_percent": 6.40, "fixed_fee": 3.25, "spread_percent": 3.50 },
    "CHF": { "fee_percent": 6.40, "fixed_fee": 0.55, "spread_percent": 3.50 },
    "THB": { "fee_percent": 6.40, "fixed_fee": 11.00, "spread_percent": 3.50 },
    "GBP": { "fee_percent": 6.40, "fixed_fee": 0.20, "spread_percent": 3.50 },
    "USD": { "fee_percent": 6.40, "fixed_fee": 0.30, "spread_percent": 3.50 },
};

export const DEFAULT_FEES = { "fee_percent": 6.40, "fixed_fee": 0.30, "spread_percent": 4.50 };

export const CURRENCIES: CurrencyInfo[] = [
    { code: "USD", name: "US Dollar", countryCode: "us", symbol: "$" },
    { code: "EUR", name: "Euro", countryCode: "eu", symbol: "€" },
    { code: "GBP", name: "British Pound", countryCode: "gb", symbol: "£" },
    { code: "JPY", name: "Japanese Yen", countryCode: "jp", symbol: "¥" },
    { code: "CAD", name: "Canadian Dollar", countryCode: "ca", symbol: "$" },
    { code: "AUD", name: "Australian Dollar", countryCode: "au", symbol: "$" },
    { code: "CHF", name: "Swiss Franc", countryCode: "ch", symbol: "Fr" },
    { code: "SEK", name: "Swedish Krona", countryCode: "se", symbol: "kr" },
    { code: "NOK", name: "Norwegian Krone", countryCode: "no", symbol: "kr" },
    { code: "DKK", name: "Danish Krone", countryCode: "dk", symbol: "kr" },
    { code: "CZK", name: "Czech Koruna", countryCode: "cz", symbol: "Kč" },
    { code: "HKD", name: "Hong Kong Dollar", countryCode: "hk", symbol: "$" },
    { code: "HUF", name: "Hungarian Forint", countryCode: "hu", symbol: "Ft" },
    { code: "ILS", name: "Israeli New Shekel", countryCode: "il", symbol: "₪" },
    { code: "MXN", name: "Mexican Peso", countryCode: "mx", symbol: "$" },
    { code: "MYR", name: "Malaysian Ringgit", countryCode: "my", symbol: "RM" },
    { code: "NZD", name: "New Zealand Dollar", countryCode: "nz", symbol: "$" },
    { code: "PHP", name: "Philippine Peso", countryCode: "ph", symbol: "₱" },
    { code: "PLN", name: "Polish Złoty", countryCode: "pl", symbol: "zł" },
    { code: "RUB", name: "Russian Ruble", countryCode: "ru", symbol: "₽" },
    { code: "SGD", name: "Singapore Dollar", countryCode: "sg", symbol: "$" },
    { code: "THB", name: "Thai Baht", countryCode: "th", symbol: "฿" },
    { code: "TWD", name: "New Taiwan Dollar", countryCode: "tw", symbol: "NT$" },
];