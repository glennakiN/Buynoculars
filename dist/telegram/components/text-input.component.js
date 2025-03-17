"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var TextInputComponent_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextInputComponent = void 0;
exports.createWaitForTextInput = createWaitForTextInput;
exports.registerTextInputHandlers = registerTextInputHandlers;
const common_1 = require("@nestjs/common");
const telegraf_1 = require("telegraf");
const buttons_constant_1 = require("../constants/buttons.constant");
let TextInputComponent = TextInputComponent_1 = class TextInputComponent {
    logger = new common_1.Logger(TextInputComponent_1.name);
    async prompt(ctx, config) {
        const { question, showSkipButton = false, skipButtonText = 'Skip' } = config;
        const buttons = [];
        if (showSkipButton) {
            buttons.push([telegraf_1.Markup.button.callback(skipButtonText, 'textinput_skip')]);
        }
        buttons.push([(0, buttons_constant_1.createGoBackButton)()]);
        const keyboard = buttons.length > 0 ? telegraf_1.Markup.inlineKeyboard(buttons) : undefined;
        if (ctx.callbackQuery) {
            try {
                await ctx.editMessageText(question, {
                    reply_markup: keyboard?.reply_markup,
                    parse_mode: 'Markdown',
                });
            }
            catch (error) {
                await ctx.reply(question, {
                    reply_markup: keyboard?.reply_markup,
                    parse_mode: 'Markdown',
                });
            }
        }
        else {
            await ctx.reply(question, {
                reply_markup: keyboard?.reply_markup,
                parse_mode: 'Markdown',
            });
        }
        this.logger.log(`Prompted user for text input: ${question}`);
    }
};
exports.TextInputComponent = TextInputComponent;
exports.TextInputComponent = TextInputComponent = TextInputComponent_1 = __decorate([
    (0, common_1.Injectable)()
], TextInputComponent);
function createWaitForTextInput(fieldName, nextStep) {
    return async (ctx) => {
        if (!ctx.message || !('text' in ctx.message)) {
            return;
        }
        const text = ctx.message.text;
        ctx.wizard.state.parameters = {
            ...ctx.wizard.state.parameters,
            [fieldName]: text
        };
        return nextStep(ctx);
    };
}
function registerTextInputHandlers(wizard, fieldName, nextStep) {
    wizard.on('text', createWaitForTextInput(fieldName, nextStep));
    wizard.action('textinput_skip', async (ctx) => {
        ctx.wizard.state.parameters = {
            ...ctx.wizard.state.parameters,
            [fieldName]: ''
        };
        await ctx.answerCbQuery('Skipped');
        return nextStep(ctx);
    });
}
//# sourceMappingURL=text-input.component.js.map