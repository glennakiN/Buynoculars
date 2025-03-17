import { CustomContext } from '../interfaces/custom-context.interface';
import { CoinSearchService, SearchResult, Coin } from '../services/coin-search.service';
export interface CoinSearchConfig {
    promptText: string;
    confidenceThreshold?: number;
    fieldName: string;
    searchCallbackPrefix?: string;
}
export interface CoinSearchState {
    searchQuery: string;
    results: SearchResult[];
    selectedCoin: Coin | null;
    page: number;
}
export declare class CoinSearchComponent {
    private readonly coinSearchService;
    private readonly logger;
    constructor(coinSearchService: CoinSearchService);
    prompt(ctx: CustomContext, config: CoinSearchConfig): Promise<void>;
    showResults(ctx: CustomContext, state: CoinSearchState, prefix?: string): Promise<void>;
    processSearch(ctx: CustomContext, query: string, config: CoinSearchConfig): Promise<CoinSearchState>;
}
export declare function createCoinSearchHandler(component: CoinSearchComponent, config: CoinSearchConfig, nextStep: (ctx: CustomContext) => Promise<void>, showResultsStep: (ctx: CustomContext) => Promise<void>): (ctx: CustomContext) => Promise<void>;
