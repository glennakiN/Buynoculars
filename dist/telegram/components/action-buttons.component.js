"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActionButtonsHandler = exports.ActionButtonsComponent = exports.ActionButtonType = void 0;
const telegraf_1 = require("telegraf");
const common_1 = require("@nestjs/common");
const buttons_constant_1 = require("../constants/buttons.constant");
const logger = new common_1.Logger('ActionButtonsComponent');
var ActionButtonType;
(function (ActionButtonType) {
    ActionButtonType["DEFAULT"] = "default";
    ActionButtonType["TRADING"] = "trading";
    ActionButtonType["NEWS"] = "news";
    ActionButtonType["CUSTOM"] = "custom";
})(ActionButtonType || (exports.ActionButtonType = ActionButtonType = {}));
class ActionButtonsComponent {
    generateButtons(config) {
        const { type, identifier } = config;
        const buttons = [];
        switch (type) {
            case ActionButtonType.DEFAULT:
                if (identifier) {
                    buttons.push({
                        label: '🦎 View on CoinGecko',
                        action: `view_coingecko_${identifier}`,
                        url: `https://www.coingecko.com/en/coins/${identifier}`
                    });
                    buttons.push({
                        label: '⭐ Add to Watchlist',
                        action: `add_watchlist_${identifier}`
                    });
                }
                break;
            case ActionButtonType.TRADING:
                if (identifier) {
                    buttons.push({
                        label: '🦎 View on CoinGecko',
                        action: `view_coingecko_${identifier}`,
                        url: `https://www.coingecko.com/en/coins/${identifier}`
                    });
                    buttons.push({
                        label: '⭐ Add to Watchlist',
                        action: `add_watchlist_${identifier}`
                    });
                    buttons.push({
                        label: '🚨 Set Alert',
                        action: `set_alert_${identifier}`
                    });
                }
                break;
            case ActionButtonType.NEWS:
                if (identifier) {
                    buttons.push({
                        label: '📰 Full Article',
                        action: `view_article_${identifier}`,
                        url: `https://crypto.news/article/${identifier}`
                    });
                    buttons.push({
                        label: '🔔 Follow Source',
                        action: `follow_source_${identifier}`
                    });
                }
                break;
            case ActionButtonType.CUSTOM:
                if (config.customButtons && config.customButtons.length > 0) {
                    return config.customButtons;
                }
                break;
        }
        return buttons;
    }
    createMarkup(config) {
        const buttons = this.generateButtons(config);
        const keyboard = [];
        for (let i = 0; i < buttons.length; i += 2) {
            const row = [];
            if (buttons[i].url && typeof buttons[i].url === 'string') {
                row.push(telegraf_1.Markup.button.url(buttons[i].label, buttons[i].url));
            }
            else {
                row.push(telegraf_1.Markup.button.callback(buttons[i].label, buttons[i].action));
            }
            if (i + 1 < buttons.length) {
                if (buttons[i + 1].url && typeof buttons[i + 1].url === 'string') {
                    row.push(telegraf_1.Markup.button.url(buttons[i + 1].label, buttons[i + 1].url));
                }
                else {
                    row.push(telegraf_1.Markup.button.callback(buttons[i + 1].label, buttons[i + 1].action));
                }
            }
            keyboard.push(row);
        }
        if (config.showBackButton) {
            keyboard.push([(0, buttons_constant_1.createGoBackButton)()]);
        }
        return telegraf_1.Markup.inlineKeyboard(keyboard);
    }
    async addButtonsToPhoto(ctx, imageBuffer, caption, config) {
        try {
            logger.log(`Adding ${config.type} buttons to photo`);
            const markup = this.createMarkup(config);
            const extra = { caption, parse_mode: 'Markdown', reply_markup: markup.reply_markup };
            if (ctx.callbackQuery) {
                try {
                    await ctx.editMessageMedia({
                        type: 'photo',
                        media: { source: imageBuffer },
                        caption
                    }, { reply_markup: markup.reply_markup });
                }
                catch (error) {
                    logger.error(`Failed to edit message: ${error.message}`);
                    await ctx.replyWithPhoto({ source: imageBuffer }, extra);
                }
            }
            else {
                await ctx.replyWithPhoto({ source: imageBuffer }, extra);
            }
            logger.log('Successfully added buttons to photo');
        }
        catch (error) {
            logger.error(`Error adding buttons to photo: ${error.message}`);
            throw error;
        }
    }
    async addButtonsToMessage(ctx, text, config) {
        try {
            logger.log(`Adding ${config.type} buttons to message`);
            const markup = this.createMarkup(config);
            const extra = { parse_mode: 'Markdown', reply_markup: markup.reply_markup };
            if (ctx.callbackQuery) {
                try {
                    await ctx.editMessageText(text, extra);
                }
                catch (error) {
                    logger.error(`Failed to edit message: ${error.message}`);
                    await ctx.reply(text, extra);
                }
            }
            else {
                await ctx.reply(text, extra);
            }
            logger.log('Successfully added buttons to message');
        }
        catch (error) {
            logger.error(`Error adding buttons to message: ${error.message}`);
            throw error;
        }
    }
}
exports.ActionButtonsComponent = ActionButtonsComponent;
class ActionButtonsHandler {
    async handleCallback(ctx, action) {
        logger.log(`Handling action button callback: ${action}`);
        try {
            const [actionType, actionName, ...rest] = action.split('_');
            const identifier = rest.join('_');
            if (actionType === 'add' && actionName === 'watchlist') {
                await this.handleAddToWatchlist(ctx, identifier);
            }
            else if (actionType === 'set' && actionName === 'alert') {
                await this.handleSetAlert(ctx, identifier);
            }
            else if (actionType === 'follow' && actionName === 'source') {
                await this.handleFollowSource(ctx, identifier);
            }
            else {
                logger.warn(`Unknown action: ${action}`);
                await ctx.answerCbQuery('This feature is not implemented yet.');
            }
        }
        catch (error) {
            logger.error(`Error handling callback: ${error.message}`);
            await ctx.answerCbQuery('An error occurred. Please try again.');
        }
    }
    async handleAddToWatchlist(ctx, coinId) {
        logger.log(`Adding ${coinId} to watchlist`);
        await ctx.answerCbQuery(`Added ${coinId} to your watchlist!`);
    }
    async handleSetAlert(ctx, coinId) {
        logger.log(`Setting alert for ${coinId}`);
        await ctx.answerCbQuery(`Price alert feature coming soon!`);
    }
    async handleFollowSource(ctx, sourceId) {
        logger.log(`Following source ${sourceId}`);
        await ctx.answerCbQuery(`You are now following this news source!`);
    }
}
exports.ActionButtonsHandler = ActionButtonsHandler;
//# sourceMappingURL=action-buttons.component.js.map