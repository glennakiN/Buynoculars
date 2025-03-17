import { CustomContext } from 'src/telegram/interfaces/custom-context.interface';
export interface OptionsConfig {
    text: string;
    buttons: {
        label: string;
        action: string;
    }[];
}
export declare function optionsComponent(ctx: CustomContext, config: OptionsConfig): Promise<void>;
