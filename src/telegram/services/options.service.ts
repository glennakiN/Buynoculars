import { Injectable, Logger } from '@nestjs/common';

export enum OptionsType {
  INDICATORS = 'indicators',
  ALERTS = 'alerts',
  EXCHANGES = 'exchanges',
  STRATEGIES = 'strategies',
  MARKET_TRANSITIONS = 'market_transitions',
  LEVEL_BREAKS = 'level_breaks'
}

@Injectable()
export class OptionsService {
  private readonly logger = new Logger(OptionsService.name);

  /**
   * Simulates fetching options from an API based on the type
   * @param {string} type - The type of options to fetch
   * @returns {Promise<string[]>} - Array of available options
   */
  public async getOptions(type: string): Promise<string[]> {
    this.logger.log(`Fetching options for type: ${type}`);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Return different options based on the type
    switch (type) {
      case OptionsType.INDICATORS:
        return ['RSI', 'ADX', 'Holistic', 'Price vs Trend', 'Price vs Volume', 'Dip', 'Pump'];
      
      case OptionsType.ALERTS:
        return ['Price Alert', 'Volume Alert', 'Pattern Alert', 'Indicator Alert', 'News Alert'];
      
      case OptionsType.EXCHANGES:
        return ['Binance', 'Coinbase', 'Kraken', 'Kucoin', 'Bitfinex', 'FTX', 'Huobi'];
      
      case OptionsType.STRATEGIES:
        return ['Trend Following', 'Mean Reversion', 'Breakout', 'Range Trading', 'Arbitrage', 'Grid Trading'];

      case OptionsType.MARKET_TRANSITIONS:
        return ['Bullish to Bearish', 'Bearish to Bullish', 'Super bullish to bullish'];
        case OptionsType.LEVEL_BREAKS:
          return ['Support break', 'Resistance break', 'Support rejection', 'Resistance rejection'];
      
      default:
        return ['Option 1', 'Option 2', 'Option 3', 'Option 4', 'Option 5'];
    }
  }
}