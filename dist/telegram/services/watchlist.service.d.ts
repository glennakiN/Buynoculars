export interface WatchlistItem {
    id: string;
    name: string;
    symbol: string;
    price?: number;
    priceChange24h?: number;
    marketCapRank?: number;
    watchlistId: string;
    watchlistName: string;
}
export interface Watchlist {
    id: string;
    name: string;
    isPublic: boolean;
    createdAt: Date;
    updatedAt: Date;
    userId?: string;
    telegramGroupId?: string | null;
    telegramUserId?: string | null;
    coins: Array<{
        coinIdentifier: string;
        coin: {
            name: string;
            symbol: string;
            price?: number;
            priceChange24h?: number;
        } | null;
    }>;
}
export declare class WatchlistService {
    private readonly logger;
    private watchlists;
    constructor();
    private initializeMockData;
    getWatchlists(telegramId: string, isGroup: boolean): Promise<Watchlist[]>;
    getWatchlistById(watchlistId: string): Promise<Watchlist>;
    createWatchlist(telegramId: string, isGroup: boolean, name: string): Promise<Watchlist>;
    renameWatchlist(telegramId: string, isGroup: boolean, watchlistId: string, newName: string): Promise<Watchlist>;
    deleteWatchlist(telegramId: string, isGroup: boolean, watchlistId: string): Promise<boolean>;
    addToWatchlist(telegramId: string, isGroup: boolean, coinIdentifier: string, watchlistId: string): Promise<Watchlist>;
    removeFromWatchlist(telegramId: string, isGroup: boolean, coinIdentifier: string, watchlistId: string): Promise<Watchlist>;
    transformWatchlistsToDisplayItems(watchlists: Watchlist[]): WatchlistItem[];
}
