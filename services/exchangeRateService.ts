
export const getExchangeRates = async (currencies: string[]): Promise<Record<string, number>> => {
    if (currencies.length === 0) {
        return {};
    }

    // The API expects pairs like USD-BRL,EUR-BRL
    const currencyPairs = currencies.map(c => `${c}-BRL`).join(',');
    const url = `https://economia.awesomeapi.com.br/json/last/${currencyPairs}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Failed to fetch exchange rates: ${response.status} ${response.statusText} - ${errorBody}`);
        }
        const data = await response.json();

        const rates: Record<string, number> = {};
        for (const currency of currencies) {
            const pairKey = `${currency}BRL`;
            if (data[pairKey] && data[pairKey].bid) {
                rates[currency] = parseFloat(data[pairKey].bid);
            } else {
                // This can happen if the API returns a response for some but not all currencies
                console.warn(`Could not find rate for ${currency} in API response.`, data);
            }
        }
        
        // It's possible the API returns a 200 OK with a failure message in the body for invalid currencies
        if (Object.keys(rates).length === 0 && currencies.length > 0) {
             throw new Error(`API did not return any valid exchange rates for: ${currencies.join(', ')}`);
        }

        return rates;
    } catch (error) {
        console.error("Error fetching exchange rates:", error);
        // Re-throw the error so the UI can catch it and display a message
        throw error;
    }
};
