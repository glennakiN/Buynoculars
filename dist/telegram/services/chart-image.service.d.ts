export declare class ChartImageService {
    private readonly logger;
    generateMockChart(coin: string, pairing: string, timeframe: string): Promise<Buffer>;
    private generateMockOHLC;
    private generateMockSMA;
}
