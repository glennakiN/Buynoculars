"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReplyWithChart = getReplyWithChart;
async function getReplyWithChart(ctx, imageBuffer, caption) {
    if (ctx.callbackQuery) {
        try {
            await ctx.editMessageMedia({
                type: 'photo',
                media: { source: imageBuffer },
                caption,
            });
        }
        catch (error) {
            await ctx.replyWithPhoto({ source: imageBuffer }, { caption });
        }
    }
    else {
        await ctx.replyWithPhoto({ source: imageBuffer }, { caption });
    }
}
//# sourceMappingURL=chart.service.js.map