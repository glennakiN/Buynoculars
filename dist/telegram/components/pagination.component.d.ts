import { Markup } from 'telegraf';
import { CustomContext } from '../interfaces/custom-context.interface';
export interface PaginationConfig {
    totalItems: number;
    itemsPerPage: number;
    currentPage: number;
    callbackPrefix: string;
    showCounts?: boolean;
    maxPageButtons?: number;
    currentPageLabel?: string;
}
export declare class PaginationComponent {
    private readonly logger;
    render(prefix: string, currentPage: number, totalPages: number): Array<ReturnType<typeof Markup.button.callback>>;
    generateButtons(config: PaginationConfig): Array<any[]>;
    addToKeyboard(keyboard: any[][], config: PaginationConfig): any[][];
    createKeyboard(config: PaginationConfig): any;
}
export interface PaginationState {
    currentPage: number;
    itemsPerPage: number;
    totalItems: number;
}
export declare function registerPaginationHandlers(scene: any, callbackPrefix: string, onPageChange: (ctx: CustomContext, page: number) => Promise<void>): void;
export declare function paginateData<T>(data: T[], page?: number, itemsPerPage?: number): {
    items: T[];
    pagination: PaginationState;
};
