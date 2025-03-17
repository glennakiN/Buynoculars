import { CustomContext } from '../interfaces/custom-context.interface';
export interface ToastMessageConfig {
    message: string;
    duration?: number;
    emoji?: string;
    type?: 'success' | 'error' | 'warning' | 'info';
}
export declare class ToastMessageComponent {
    show(ctx: CustomContext, config: ToastMessageConfig): Promise<{
        dismiss: () => Promise<void>;
    }>;
}
export declare function showErrorToast(ctx: CustomContext, error: Error | string, duration?: number): Promise<void>;
export declare function showSuccessToast(ctx: CustomContext, message: string, duration?: number): Promise<void>;
export declare function withErrorToast<T>(ctx: CustomContext, operation: () => Promise<T>, errorMessage?: string): Promise<T | null>;
