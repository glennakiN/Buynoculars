"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToastMessageComponent = void 0;
exports.showErrorToast = showErrorToast;
exports.showSuccessToast = showSuccessToast;
exports.withErrorToast = withErrorToast;
const common_1 = require("@nestjs/common");
const logger = new common_1.Logger('ToastMessage');
class ToastMessageComponent {
    async show(ctx, config) {
        const duration = config.duration || 2000;
        let emoji = config.emoji;
        if (!emoji) {
            switch (config.type) {
                case 'success':
                    emoji = '✅';
                    break;
                case 'error':
                    emoji = '❌';
                    break;
                case 'warning':
                    emoji = '⚠️';
                    break;
                case 'info':
                default:
                    emoji = 'ℹ️';
                    break;
            }
        }
        const fullMessage = `${emoji} ${config.message}`;
        logger.log(`Showing toast message: "${fullMessage}" (${duration}ms)`);
        const messageResponse = await ctx.reply(fullMessage);
        const timerId = setTimeout(async () => {
            try {
                await ctx.telegram.deleteMessage(messageResponse.chat.id, messageResponse.message_id);
                logger.log('Toast message auto-dismissed');
            }
            catch (error) {
                logger.error(`Failed to auto-dismiss toast message: ${error.message}`);
            }
        }, duration);
        return {
            dismiss: async () => {
                clearTimeout(timerId);
                try {
                    await ctx.telegram.deleteMessage(messageResponse.chat.id, messageResponse.message_id);
                    logger.log('Toast message manually dismissed');
                }
                catch (error) {
                    logger.error(`Failed to manually dismiss toast message: ${error.message}`);
                }
            }
        };
    }
}
exports.ToastMessageComponent = ToastMessageComponent;
async function showErrorToast(ctx, error, duration = 3000) {
    const toastComponent = new ToastMessageComponent();
    const message = error instanceof Error ? error.message : error;
    await toastComponent.show(ctx, {
        message,
        type: 'error',
        duration
    });
}
async function showSuccessToast(ctx, message, duration = 2000) {
    const toastComponent = new ToastMessageComponent();
    await toastComponent.show(ctx, {
        message,
        type: 'success',
        duration
    });
}
async function withErrorToast(ctx, operation, errorMessage = 'Operation failed') {
    try {
        return await operation();
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        await showErrorToast(ctx, `${errorMessage}: ${message}`);
        logger.error(`Error in operation: ${message}`);
        return null;
    }
}
//# sourceMappingURL=feedback.component.js.map