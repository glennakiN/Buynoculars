"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionsComponent = optionsComponent;
const telegraf_1 = require("telegraf");
const buttons_constant_1 = require("../../constants/buttons.constant");
async function optionsComponent(ctx, config) {
    const keyboard = telegraf_1.Markup.inlineKeyboard([
        ...config.buttons.map((button) => telegraf_1.Markup.button.callback(button.label, button.action)),
        (0, buttons_constant_1.createGoBackButton)(),
    ]);
    if (ctx.callbackQuery) {
        try {
            await ctx.editMessageText(config.text, {
                reply_markup: keyboard.reply_markup,
            });
        }
        catch (error) {
            await ctx.reply(config.text, {
                reply_markup: keyboard.reply_markup,
            });
        }
    }
    else {
        await ctx.reply(config.text, {
            reply_markup: keyboard.reply_markup,
        });
    }
}
//# sourceMappingURL=options.component.js.map