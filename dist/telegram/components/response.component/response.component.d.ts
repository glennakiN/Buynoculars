import { CustomContext } from 'src/telegram/interfaces/custom-context.interface';
export interface ResponseConfig {
    text: string;
    parameters: Record<string, any>;
}
export declare function responseComponent(ctx: CustomContext, config: ResponseConfig): Promise<void>;
