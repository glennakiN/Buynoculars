import { CustomContext } from '../interfaces/custom-context.interface';
export interface MultiPickerState {
    selectedOptions: string[];
    type: string;
}
export declare class MultiPickerComponent {
    private readonly logger;
    render(prefix?: string, state?: MultiPickerState, options?: string[], limit?: number): any;
}
export declare class MultiPickerCallbackHandler {
    private readonly logger;
    handleCallback(ctx: CustomContext, data: string, currentState: MultiPickerState, options: string[], limit: number): Promise<{
        state: MultiPickerState;
        proceed: boolean;
        redraw?: boolean;
    }>;
}
