import { CustomContext } from 'src/telegram/interfaces/custom-context.interface';
export interface PickerConfig {
    text: string;
    options: {
        label: string;
        action: string;
    }[];
}
export declare function pickerComponent(ctx: CustomContext, config: PickerConfig): Promise<void>;
