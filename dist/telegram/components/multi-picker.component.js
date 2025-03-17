"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var MultiPickerComponent_1, MultiPickerCallbackHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MultiPickerCallbackHandler = exports.MultiPickerComponent = void 0;
const common_1 = require("@nestjs/common");
const telegraf_1 = require("telegraf");
let MultiPickerComponent = MultiPickerComponent_1 = class MultiPickerComponent {
    logger = new common_1.Logger(MultiPickerComponent_1.name);
    render(prefix = 'multipicker', state = { selectedOptions: [], type: 'default' }, options = [], limit = 3) {
        const selectedOptions = state.selectedOptions || [];
        const optionButtons = [];
        const buttonsPerRow = 3;
        for (let i = 0; i < options.length; i += buttonsPerRow) {
            const row = [];
            for (let j = 0; j < buttonsPerRow && i + j < options.length; j++) {
                const option = options[i + j];
                const isSelected = selectedOptions.includes(option);
                row.push(telegraf_1.Markup.button.callback(isSelected ? `✅ ${option}` : option, `${prefix}_option_${option}`));
            }
            optionButtons.push(row);
        }
        const navigationRow = [
            telegraf_1.Markup.button.callback('← Back', 'go_back'),
            telegraf_1.Markup.button.callback('Next →', `${prefix}_CHOOSE`)
        ];
        const buttons = [...optionButtons, navigationRow];
        return telegraf_1.Markup.inlineKeyboard(buttons);
    }
};
exports.MultiPickerComponent = MultiPickerComponent;
exports.MultiPickerComponent = MultiPickerComponent = MultiPickerComponent_1 = __decorate([
    (0, common_1.Injectable)()
], MultiPickerComponent);
let MultiPickerCallbackHandler = MultiPickerCallbackHandler_1 = class MultiPickerCallbackHandler {
    logger = new common_1.Logger(MultiPickerCallbackHandler_1.name);
    async handleCallback(ctx, data, currentState, options, limit) {
        const parts = data.split('_');
        if (parts.length < 2 || parts[0] !== 'multipicker') {
            return { state: currentState, proceed: false };
        }
        if (parts[1] === 'CHOOSE') {
            if (currentState.selectedOptions.length === 0) {
                await ctx.answerCbQuery('Please select at least one option');
                return { state: currentState, proceed: false, redraw: false };
            }
            this.logger.log(`Proceeding with selections: ${currentState.selectedOptions.join(', ')}`);
            await ctx.answerCbQuery(`Selection confirmed: ${currentState.selectedOptions.join(', ')}`);
            return { state: currentState, proceed: true, redraw: true };
        }
        if (parts[1] === 'option' && parts[2]) {
            const option = parts[2];
            const selectedOptions = [...currentState.selectedOptions];
            const isSelected = selectedOptions.includes(option);
            if (isSelected) {
                const index = selectedOptions.indexOf(option);
                if (index !== -1) {
                    selectedOptions.splice(index, 1);
                    this.logger.log(`Deselected option: ${option}`);
                    await ctx.answerCbQuery(`Deselected: ${option}`);
                }
            }
            else {
                if (selectedOptions.length >= limit) {
                    this.logger.log(`Selection limit reached (${limit})`);
                    await ctx.answerCbQuery(`Maximum ${limit} options allowed`);
                    return {
                        state: currentState,
                        proceed: false,
                        redraw: false
                    };
                }
                selectedOptions.push(option);
                this.logger.log(`Selected option: ${option}`);
                await ctx.answerCbQuery(`Selected: ${option}`);
            }
            return {
                state: { ...currentState, selectedOptions },
                proceed: false
            };
        }
        return { state: currentState, proceed: false, redraw: false };
    }
};
exports.MultiPickerCallbackHandler = MultiPickerCallbackHandler;
exports.MultiPickerCallbackHandler = MultiPickerCallbackHandler = MultiPickerCallbackHandler_1 = __decorate([
    (0, common_1.Injectable)()
], MultiPickerCallbackHandler);
//# sourceMappingURL=multi-picker.component.js.map