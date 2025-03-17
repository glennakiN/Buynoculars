export interface AlertLimits {
    watchlistLimit: number;
    discoveryLimit: number;
    indicatorLimit: number;
}
export declare enum AlertType {
    WATCHLIST = "watchlist",
    DISCOVERY = "discovery"
}
export declare enum AlertNotificationType {
    HORIZON_SCORE = "horizon_score",
    INDIVIDUAL_INDICATORS = "individual_indicators"
}
export interface Coin {
    id: string;
    name: string;
    symbol: string;
}
export interface AlertConfig {
    id?: string;
    userId: string;
    name: string;
    type: AlertType;
    targetId: string;
    targetName: string;
    notificationType: AlertNotificationType;
    indicators?: string[];
    pairing: string;
    timeframe: string;
    createdAt: Date;
    active: boolean;
}
export declare class AlertService {
    private readonly logger;
    private alerts;
    private alertCounter;
    createAlert(config: Omit<AlertConfig, 'id' | 'createdAt'>): Promise<AlertConfig>;
    getAlerts(userId: string, type?: AlertType): Promise<AlertConfig[]>;
    deleteAlert(alertId: string): Promise<boolean>;
    toggleAlertStatus(alertId: string): Promise<AlertConfig | null>;
    getAlertsLimits(): AlertLimits;
    private mockApiCall;
}
