import { CustomContext } from '../interfaces/custom-context.interface';
export interface WatchlistItem {
    id: string;
    name: string;
    symbol: string;
    price?: number;
    priceChange24h?: number;
    marketCapRank?: number;
    watchlistId?: string;
    watchlistName?: string;
}
export interface WatchlistConfig {
    title: string;
    description?: string;
    items: WatchlistItem[];
    showBackButton?: boolean;
    priceFormat?: string;
    showRank?: boolean;
    showPriceChange?: boolean;
    showWatchlistNames?: boolean;
    selectActionPrefix?: string;
    itemsPerPage?: number;
    currentPage?: number;
}
export declare class WatchlistComponent {
    private readonly logger;
    private readonly paginationComponent;
    private formatPrice;
    private formatPriceChange;
    transformWatchlistData(watchlistData: any[]): WatchlistItem[];
    display(ctx: CustomContext, config: WatchlistConfig): Promise<void>;
}
export declare function registerWatchlistHandlers(scene: any, watchlistComponent: WatchlistComponent, getWatchlistItems: (ctx: CustomContext, page: number) => Promise<WatchlistItem[]>, itemSelectedHandler: (ctx: CustomContext, itemId: string) => Promise<void>, settingsHandler?: (ctx: CustomContext) => Promise<void>): void;
