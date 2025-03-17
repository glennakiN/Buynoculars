"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReplyWithChart = getReplyWithChart;
const action_buttons_component_1 = require("./action-buttons.component");
const common_1 = require("@nestjs/common");
const logger = new common_1.Logger('ReplyWithChart');
const actionButtonsComponent = new action_buttons_component_1.ActionButtonsComponent();
async function getReplyWithChart(ctx, imageBuffer, caption, coinId, buttonType = action_buttons_component_1.ActionButtonType.DEFAULT) {
    try {
        logger.log(`Replying with chart for ${coinId || 'unknown coin'}`);
        if (coinId) {
            logger.log(`Adding ${buttonType} buttons for coin: ${coinId}`);
            await actionButtonsComponent.addButtonsToPhoto(ctx, imageBuffer, caption, {
                type: buttonType,
                identifier: coinId,
                showBackButton: true
            });
        }
        else {
            logger.log('Sending chart without action buttons');
            if (ctx.callbackQuery) {
                try {
                    await ctx.editMessageMedia({
                        type: 'photo',
                        media: { source: imageBuffer },
                        caption,
                    });
                }
                catch (error) {
                    logger.error(`Failed to edit message: ${error.message}`);
                    await ctx.replyWithPhoto({ source: imageBuffer }, { caption });
                }
            }
            else {
                await ctx.replyWithPhoto({ source: imageBuffer }, { caption });
            }
        }
        logger.log('Chart sent successfully');
    }
    catch (error) {
        logger.error(`Error sending chart: ${error.message}`);
        throw error;
    }
}
//# sourceMappingURL=reply-with-image-caption.component.js.map