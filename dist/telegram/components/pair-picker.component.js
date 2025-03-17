"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var PairPickerComponent_1, PairPickerCallbackHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PairPickerCallbackHandler = exports.PairPickerComponent = void 0;
const common_1 = require("@nestjs/common");
const telegraf_1 = require("telegraf");
let PairPickerComponent = PairPickerComponent_1 = class PairPickerComponent {
    logger = new common_1.Logger(PairPickerComponent_1.name);
    render(prefix = 'pairpicker', selectedPairing = null) {
        const buttons = [
            [
                telegraf_1.Markup.button.callback(selectedPairing === 'USD' ? '✅ USD' : 'USD', `${prefix}_USD`),
                telegraf_1.Markup.button.callback(selectedPairing === 'BTC' ? '✅ BTC' : 'BTC', `${prefix}_BTC`),
                telegraf_1.Markup.button.callback(selectedPairing === 'ETH' ? '✅ ETH' : 'ETH', `${prefix}_ETH`),
            ],
            [
                telegraf_1.Markup.button.callback(selectedPairing === 'ALL' ? '✅ All Pairs' : 'All Pairs', `${prefix}_ALL`),
            ],
        ];
        if (selectedPairing) {
            buttons.push([telegraf_1.Markup.button.callback('Choose ✅', `${prefix}_CHOOSE`)]);
        }
        return telegraf_1.Markup.inlineKeyboard(buttons);
    }
};
exports.PairPickerComponent = PairPickerComponent;
exports.PairPickerComponent = PairPickerComponent = PairPickerComponent_1 = __decorate([
    (0, common_1.Injectable)()
], PairPickerComponent);
let PairPickerCallbackHandler = PairPickerCallbackHandler_1 = class PairPickerCallbackHandler {
    logger = new common_1.Logger(PairPickerCallbackHandler_1.name);
    async handleCallback(ctx, data, currentState) {
        const [prefix, action] = data.split('_');
        if (prefix !== 'pairpicker') {
            return { selectedPairing: null, proceed: false };
        }
        if (action === 'CHOOSE') {
            this.logger.log(`Proceeding with pairing: ${currentState.selectedPairing}`);
            await ctx.answerCbQuery(`Proceeding with ${currentState.selectedPairing}`);
            return { selectedPairing: currentState.selectedPairing, proceed: true };
        }
        currentState.selectedPairing = action;
        this.logger.log(`Selected pairing: ${action}`);
        await ctx.answerCbQuery(`Selected pairing: ${action}`);
        return { selectedPairing: action, proceed: false };
    }
};
exports.PairPickerCallbackHandler = PairPickerCallbackHandler;
exports.PairPickerCallbackHandler = PairPickerCallbackHandler = PairPickerCallbackHandler_1 = __decorate([
    (0, common_1.Injectable)()
], PairPickerCallbackHandler);
//# sourceMappingURL=pair-picker.component.js.map