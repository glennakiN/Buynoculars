"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.responseComponent = responseComponent;
async function responseComponent(ctx, config) {
    const messageText = `${config.text}\n\n**Parameters to send to API:**\n${JSON.stringify(config.parameters, null, 2)}`;
    if (ctx.callbackQuery) {
        try {
            await ctx.editMessageText(messageText);
        }
        catch (error) {
            await ctx.reply(messageText);
        }
    }
    else {
        await ctx.reply(messageText);
    }
}
//# sourceMappingURL=response.component.js.map