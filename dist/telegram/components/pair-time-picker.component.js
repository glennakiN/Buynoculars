"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var PairTimePickerComponent_1, PairTimePickerComponentCallbackHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PairTimePickerComponentCallbackHandler = exports.PairTimePickerComponent = void 0;
const common_1 = require("@nestjs/common");
const telegraf_1 = require("telegraf");
let PairTimePickerComponent = PairTimePickerComponent_1 = class PairTimePickerComponent {
    logger = new common_1.Logger(PairTimePickerComponent_1.name);
    render(prefix = 'cmbpicker', state = { selectedPairing: 'USD', selectedTimeframe: '1D' }) {
        const selectedPairing = state.selectedPairing || 'USD';
        const selectedTimeframe = state.selectedTimeframe || '1D';
        const buttons = [
            [
                telegraf_1.Markup.button.callback(selectedPairing === 'USD' ? '✅ USD' : 'USD', `${prefix}_pair_USD`),
                telegraf_1.Markup.button.callback(selectedPairing === 'BTC' ? '✅ BTC' : 'BTC', `${prefix}_pair_BTC`),
                telegraf_1.Markup.button.callback(selectedPairing === 'ETH' ? '✅ ETH' : 'ETH', `${prefix}_pair_ETH`),
                telegraf_1.Markup.button.callback(selectedPairing === 'ALL' ? '✅ ALL' : 'ALL', `${prefix}_pair_ALL`),
            ],
            [
                telegraf_1.Markup.button.callback(selectedTimeframe === '6h' ? '✅ 6h' : '6h', `${prefix}_time_6h`),
                telegraf_1.Markup.button.callback(selectedTimeframe === '12h' ? '✅ 12h' : '12h', `${prefix}_time_12h`),
                telegraf_1.Markup.button.callback(selectedTimeframe === '1D' ? '✅ 1D' : '1D', `${prefix}_time_1D`),
                telegraf_1.Markup.button.callback(selectedTimeframe === '1W' ? '✅ 1W' : '1W', `${prefix}_time_1W`),
                telegraf_1.Markup.button.callback(selectedTimeframe === '1M' ? '✅ 1M' : '1M', `${prefix}_time_1M`),
            ],
            [
                telegraf_1.Markup.button.callback('← Back', 'go_back'),
                telegraf_1.Markup.button.callback('Next →', `${prefix}_CHOOSE`)
            ],
        ];
        return telegraf_1.Markup.inlineKeyboard(buttons);
    }
};
exports.PairTimePickerComponent = PairTimePickerComponent;
exports.PairTimePickerComponent = PairTimePickerComponent = PairTimePickerComponent_1 = __decorate([
    (0, common_1.Injectable)()
], PairTimePickerComponent);
let PairTimePickerComponentCallbackHandler = PairTimePickerComponentCallbackHandler_1 = class PairTimePickerComponentCallbackHandler {
    logger = new common_1.Logger(PairTimePickerComponentCallbackHandler_1.name);
    async handleCallback(ctx, data, currentState) {
        const parts = data.split('_');
        if (parts.length < 2 || parts[0] !== 'cmbpicker') {
            return { state: currentState, proceed: false };
        }
        if (parts[1] === 'CHOOSE') {
            this.logger.log(`Proceeding with selections: ${currentState.selectedPairing} / ${currentState.selectedTimeframe}`);
            await ctx.answerCbQuery(`Selection confirmed: ${currentState.selectedPairing}/${currentState.selectedTimeframe}`);
            return { state: currentState, proceed: true };
        }
        if (parts[1] === 'separator' || data === 'ignore') {
            await ctx.answerCbQuery('');
            return { state: currentState, proceed: false };
        }
        if (parts[1] === 'pair' && parts[2]) {
            const newPairing = parts[2];
            this.logger.log(`Selected pairing: ${newPairing}`);
            await ctx.answerCbQuery(`Selected pairing: ${newPairing}`);
            return {
                state: { ...currentState, selectedPairing: newPairing },
                proceed: false
            };
        }
        if (parts[1] === 'time' && parts[2]) {
            const newTimeframe = parts[2];
            this.logger.log(`Selected timeframe: ${newTimeframe}`);
            await ctx.answerCbQuery(`Selected timeframe: ${newTimeframe}`);
            return {
                state: { ...currentState, selectedTimeframe: newTimeframe },
                proceed: false
            };
        }
        return { state: currentState, proceed: false };
    }
};
exports.PairTimePickerComponentCallbackHandler = PairTimePickerComponentCallbackHandler;
exports.PairTimePickerComponentCallbackHandler = PairTimePickerComponentCallbackHandler = PairTimePickerComponentCallbackHandler_1 = __decorate([
    (0, common_1.Injectable)()
], PairTimePickerComponentCallbackHandler);
//# sourceMappingURL=pair-time-picker.component.js.map