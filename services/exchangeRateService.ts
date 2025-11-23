
export const getExchangeRates = async (currencies: string[]): Promise<Record<string, number>> => {
    if (currencies.length === 0) {
        return {};
    }

    // Filter out BRL as we don't need to fetch BRL-BRL rate
    const foreignCurrencies = currencies.filter(c => c !== 'BRL');
    const rates: Record<string, number> = {};
    
    // Set BRL rate to 1 directly
    if (currencies.includes('BRL')) {
        rates['BRL'] = 1.0;
    }

    if (foreignCurrencies.length === 0) {
        return rates;
    }

    // The API expects pairs like USD-BRL,EUR-BRL
    const currencyPairs = foreignCurrencies.map(c => `${c}-BRL`).join(',');
    const url = `https://economia.awesomeapi.com.br/json/last/${currencyPairs}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Failed to fetch exchange rates: ${response.status} ${response.statusText} - ${errorBody}`);
        }
        const data = await response.json();

        for (const currency of foreignCurrencies) {
            const pairKey = `${currency}BRL`;
            if (data[pairKey] && data[pairKey].bid) {
                rates[currency] = parseFloat(data[pairKey].bid);
            } else {
                console.warn(`Could not find rate for ${currency} in API response.`, data);
            }
        }
        
        return rates;
    } catch (error) {
        console.error("Error fetching exchange rates:", error);
        throw error;
    }
};
