export interface CoinDynamicMetadata {
    market_cap_rank: number;
    price_usd?: number;
    volume_24h?: number;
    market_cap?: number;
    price_change_percentage_24h?: number;
}
export interface Coin {
    id: string;
    identifier: string;
    symbol: string;
    name: string;
    dynamicMetadata?: CoinDynamicMetadata;
}
export interface SearchResult {
    coin: Coin;
    score: number;
}
export interface SearchResponse {
    data: SearchResult[];
    total: number;
    page: number;
    lastPage: number;
}
export declare class CoinSearchService {
    private readonly logger;
    private readonly mockCoins;
    private calculateSimilarity;
    searchCoins(query: string, page?: number, limit?: number): Promise<SearchResponse>;
    getCoinById(id: string): Promise<Coin | null>;
}
