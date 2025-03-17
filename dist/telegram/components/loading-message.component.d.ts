import { CustomContext } from '../interfaces/custom-context.interface';
export interface LoadingMessageConfig {
    messages: string[];
    emoji?: string;
}
export declare class LoadingMessageComponent {
    show(ctx: CustomContext, config?: Partial<LoadingMessageConfig>): Promise<{
        update: () => Promise<void>;
        remove: () => Promise<void>;
    }>;
}
export declare function withLoading<T>(ctx: CustomContext, operation: () => Promise<T>, config?: Partial<LoadingMessageConfig>): Promise<T>;
