"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pickerComponent = pickerComponent;
const telegraf_1 = require("telegraf");
const buttons_constant_1 = require("../../constants/buttons.constant");
async function pickerComponent(ctx, config) {
    const keyboard = telegraf_1.Markup.inlineKeyboard([
        ...config.options.map((option) => telegraf_1.Markup.button.callback(option.label, option.action)),
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
//# sourceMappingURL=picker.component.js.map