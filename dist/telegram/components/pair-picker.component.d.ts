import { CustomContext } from '../interfaces/custom-context.interface';
export declare class PairPickerComponent {
    private readonly logger;
    render(prefix?: string, selectedPairing?: string | null): any;
}
export declare class PairPickerCallbackHandler {
    private readonly logger;
    handleCallback(ctx: CustomContext, data: string, currentState: {
        selectedPairing: string | null;
    }): Promise<{
        selectedPairing: string | null;
        proceed: boolean;
    }>;
}
