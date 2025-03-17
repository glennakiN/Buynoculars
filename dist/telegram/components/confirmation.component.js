"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ConfirmationComponent_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfirmationComponent = void 0;
exports.registerConfirmationHandler = registerConfirmationHandler;
const common_1 = require("@nestjs/common");
const telegraf_1 = require("telegraf");
let ConfirmationComponent = ConfirmationComponent_1 = class ConfirmationComponent {
    logger = new common_1.Logger(ConfirmationComponent_1.name);
    async prompt(ctx, config) {
        const { message, confirmButtonText = 'Confirm', cancelButtonText = '← Go Back', confirmCallbackData = 'confirmation_confirm', parse_mode = 'Markdown' } = config;
        const buttons = [
            [
                telegraf_1.Markup.button.callback(confirmButtonText, confirmCallbackData),
                telegraf_1.Markup.button.callback(cancelButtonText, 'go_back')
            ]
        ];
        const keyboard = telegraf_1.Markup.inlineKeyboard(buttons);
        if (ctx.callbackQuery) {
            try {
                await ctx.editMessageText(message, {
                    reply_markup: keyboard.reply_markup,
                    parse_mode: parse_mode
                });
            }
            catch (error) {
                await ctx.reply(message, {
                    reply_markup: keyboard.reply_markup,
                    parse_mode: parse_mode
                });
            }
        }
        else {
            await ctx.reply(message, {
                reply_markup: keyboard.reply_markup,
                parse_mode: parse_mode
            });
        }
        this.logger.log(`Prompted user for confirmation: ${message}`);
    }
};
exports.ConfirmationComponent = ConfirmationComponent;
exports.ConfirmationComponent = ConfirmationComponent = ConfirmationComponent_1 = __decorate([
    (0, common_1.Injectable)()
], ConfirmationComponent);
function registerConfirmationHandler(wizard, confirmCallbackData = 'confirmation_confirm', nextStep) {
    wizard.action(confirmCallbackData, async (ctx) => {
        if (ctx.session.alertService && !ctx.alertService) {
            ctx.alertService = ctx.session.alertService;
        }
        if (ctx.session.watchlistService && !ctx.watchlistService) {
            ctx.watchlistService = ctx.session.watchlistService;
        }
        await ctx.answerCbQuery('Confirmed');
        return nextStep(ctx);
    });
}
//# sourceMappingURL=confirmation.component.js.map