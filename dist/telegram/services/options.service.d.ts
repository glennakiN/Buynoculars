export declare enum OptionsType {
    INDICATORS = "indicators",
    ALERTS = "alerts",
    EXCHANGES = "exchanges",
    STRATEGIES = "strategies",
    MARKET_TRANSITIONS = "market_transitions",
    LEVEL_BREAKS = "level_breaks"
}
export declare class OptionsService {
    private readonly logger;
    getOptions(type: string): Promise<string[]>;
}
