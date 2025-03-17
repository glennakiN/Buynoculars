import { CustomContext } from '../interfaces/custom-context.interface';
export interface TextInputConfig {
    question: string;
    fieldName: string;
    skipButtonText?: string;
    showSkipButton?: boolean;
}
export declare class TextInputComponent {
    private readonly logger;
    prompt(ctx: CustomContext, config: TextInputConfig): Promise<void>;
}
export declare function createWaitForTextInput(fieldName: string, nextStep: (ctx: CustomContext) => Promise<void>): (ctx: CustomContext) => Promise<void>;
export declare function registerTextInputHandlers(wizard: any, fieldName: string, nextStep: (ctx: CustomContext) => Promise<void>): void;
