"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoadingMessageComponent = void 0;
exports.withLoading = withLoading;
const common_1 = require("@nestjs/common");
const logger = new common_1.Logger('LoadingMessage');
const DEFAULT_LOADING_MESSAGES = [
    'Processing your request...',
    'This will only take a moment...',
    'Working on it...',
    'Almost there...',
    'Please wait...'
];
const DEFAULT_LOADING_EMOJI = '⏳';
class LoadingMessageComponent {
    async show(ctx, config) {
        const messages = config?.messages || DEFAULT_LOADING_MESSAGES;
        const emoji = config?.emoji || DEFAULT_LOADING_EMOJI;
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        const fullMessage = `${emoji} ${randomMessage}`;
        logger.log(`Showing loading message: "${fullMessage}"`);
        const messageResponse = await ctx.reply(fullMessage);
        return {
            update: async () => {
                const newRandomMessage = messages[Math.floor(Math.random() * messages.length)];
                const newFullMessage = `${emoji} ${newRandomMessage}`;
                logger.log(`Updating loading message to: "${newFullMessage}"`);
                try {
                    await ctx.telegram.editMessageText(messageResponse.chat.id, messageResponse.message_id, undefined, newFullMessage);
                }
                catch (error) {
                    logger.error(`Failed to update loading message: ${error.message}`);
                }
            },
            remove: async () => {
                logger.log('Removing loading message');
                try {
                    await ctx.telegram.deleteMessage(messageResponse.chat.id, messageResponse.message_id);
                    logger.log('Loading message removed successfully');
                }
                catch (error) {
                    logger.error(`Failed to remove loading message: ${error.message}`);
                }
            }
        };
    }
}
exports.LoadingMessageComponent = LoadingMessageComponent;
async function withLoading(ctx, operation, config) {
    const loadingComponent = new LoadingMessageComponent();
    const loading = await loadingComponent.show(ctx, config);
    try {
        const result = await operation();
        await loading.remove();
        return result;
    }
    catch (error) {
        await loading.remove();
        throw error;
    }
}
//# sourceMappingURL=loading-message.component.js.map