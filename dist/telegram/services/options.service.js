"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var OptionsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OptionsService = exports.OptionsType = void 0;
const common_1 = require("@nestjs/common");
var OptionsType;
(function (OptionsType) {
    OptionsType["INDICATORS"] = "indicators";
    OptionsType["ALERTS"] = "alerts";
    OptionsType["EXCHANGES"] = "exchanges";
    OptionsType["STRATEGIES"] = "strategies";
    OptionsType["MARKET_TRANSITIONS"] = "market_transitions";
    OptionsType["LEVEL_BREAKS"] = "level_breaks";
})(OptionsType || (exports.OptionsType = OptionsType = {}));
let OptionsService = OptionsService_1 = class OptionsService {
    logger = new common_1.Logger(OptionsService_1.name);
    async getOptions(type) {
        this.logger.log(`Fetching options for type: ${type}`);
        await new Promise(resolve => setTimeout(resolve, 300));
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
};
exports.OptionsService = OptionsService;
exports.OptionsService = OptionsService = OptionsService_1 = __decorate([
    (0, common_1.Injectable)()
], OptionsService);
//# sourceMappingURL=options.service.js.map