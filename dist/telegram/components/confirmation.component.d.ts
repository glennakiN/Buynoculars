import { CustomContext } from '../interfaces/custom-context.interface';
export interface ConfirmationConfig {
    message: string;
    confirmButtonText?: string;
    cancelButtonText?: string;
    confirmCallbackData?: string;
    parse_mode?: string;
}
export declare class ConfirmationComponent {
    private readonly logger;
    prompt(ctx: CustomContext, config: ConfirmationConfig): Promise<void>;
}
export declare function registerConfirmationHandler(wizard: any, confirmCallbackData: string | undefined, nextStep: (ctx: CustomContext) => Promise<void>): void;
