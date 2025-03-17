import { CustomContext } from '../interfaces/custom-context.interface';
export interface PickerState {
    selectedPairing: string | null;
    selectedTimeframe: string | null;
}
export declare class PairTimePickerComponent {
    private readonly logger;
    render(prefix?: string, state?: PickerState): any;
}
export declare class PairTimePickerComponentCallbackHandler {
    private readonly logger;
    handleCallback(ctx: CustomContext, data: string, currentState: PickerState): Promise<{
        state: PickerState;
        proceed: boolean;
    }>;
}
