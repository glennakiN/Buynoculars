"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var WatchlistComponent_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WatchlistComponent = void 0;
exports.registerWatchlistHandlers = registerWatchlistHandlers;
const common_1 = require("@nestjs/common");
const telegraf_1 = require("telegraf");
const buttons_constant_1 = require("../constants/buttons.constant");
const pagination_component_1 = require("./pagination.component");
let WatchlistComponent = WatchlistComponent_1 = class WatchlistComponent {
    logger = new common_1.Logger(WatchlistComponent_1.name);
    paginationComponent = new pagination_component_1.PaginationComponent();
    formatPrice(price, format = 'USD') {
        if (price === undefined)
            return 'N/A';
        switch (format.toUpperCase()) {
            case 'USD':
                return `${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 })}`;
            case 'BTC':
                return `₿${price.toLocaleString(undefined, { minimumFractionDigits: 8, maximumFractionDigits: 8 })}`;
            case 'ETH':
                return `Ξ${price.toLocaleString(undefined, { minimumFractionDigits: 8, maximumFractionDigits: 8 })}`;
            default:
                return `${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 })} ${format}`;
        }
    }
    formatPriceChange(change) {
        if (change === undefined)
            return '';
        const prefix = change >= 0 ? '🟢 +' : '🔴 ';
        return `${prefix}${Math.abs(change).toFixed(2)}%`;
    }
    transformWatchlistData(watchlistData) {
        return watchlistData.flatMap(watchlist => {
            if (!watchlist.coins || watchlist.coins.length === 0) {
                return [];
            }
            return watchlist.coins.map(entry => {
                const coin = entry.coin;
                if (!coin) {
                    return {
                        id: entry.coinIdentifier,
                        name: 'Unknown',
                        symbol: entry.coinIdentifier.toUpperCase(),
                        watchlistId: watchlist.id,
                        watchlistName: watchlist.name
                    };
                }
                return {
                    id: entry.coinIdentifier,
                    name: coin.name,
                    symbol: coin.symbol,
                    watchlistId: watchlist.id,
                    watchlistName: watchlist.name,
                    price: coin.currentPrice,
                    priceChange24h: coin.priceChangePercentage24h
                };
            });
        });
    }
    async display(ctx, config) {
        try {
            this.logger.log(`Displaying watchlist: ${config.title} with ${config.items.length} items`);
            const showBackButton = config.showBackButton !== false;
            const priceFormat = config.priceFormat || 'USD';
            const showRank = config.showRank !== false;
            const showPriceChange = config.showPriceChange !== false;
            const selectActionPrefix = config.selectActionPrefix || 'watchlist_select';
            const itemsPerPage = config.itemsPerPage || 5;
            const currentPage = config.currentPage || 1;
            const { items: pageItems, pagination } = (0, pagination_component_1.paginateData)(config.items, currentPage, itemsPerPage);
            let messageText = `*${config.title}*\n`;
            if (config.description) {
                messageText += `${config.description}\n`;
            }
            messageText += `\n`;
            if (pageItems.length === 0) {
                messageText += `_No items in watchlist_\n`;
            }
            else {
                pageItems.forEach((item, idx) => {
                    const rank = showRank && item.marketCapRank ? `#${item.marketCapRank} ` : '';
                    const price = item.price ? this.formatPrice(item.price, priceFormat) : 'N/A';
                    const change = showPriceChange && item.priceChange24h
                        ? ` ${this.formatPriceChange(item.priceChange24h)}`
                        : '';
                    const watchlistInfo = item.watchlistName && config.showWatchlistNames
                        ? ` (${item.watchlistName})`
                        : '';
                    messageText += `${rank}*${item.name}* (${item.symbol})${watchlistInfo} - ${price}${change}\n`;
                });
            }
            const buttons = [];
            pageItems.forEach(item => {
                buttons.push([
                    telegraf_1.Markup.button.callback(`${item.symbol} - View Details`, `${selectActionPrefix}_${item.id}`)
                ]);
            });
            buttons.push([
                telegraf_1.Markup.button.callback('🔄 Refresh', 'watchlist_refresh'),
                telegraf_1.Markup.button.callback('⚙️ Settings', 'watchlist_settings')
            ]);
            if (showBackButton) {
                buttons.push([(0, buttons_constant_1.createGoBackButton)()]);
            }
            const paginationConfig = {
                totalItems: config.items.length,
                itemsPerPage,
                currentPage,
                callbackPrefix: 'watchlist',
                showCounts: true
            };
            const keyboardWithPagination = this.paginationComponent.addToKeyboard(buttons, paginationConfig);
            const keyboard = telegraf_1.Markup.inlineKeyboard(keyboardWithPagination);
            if (ctx.callbackQuery) {
                try {
                    await ctx.editMessageText(messageText, {
                        reply_markup: keyboard.reply_markup,
                        parse_mode: 'Markdown',
                    });
                }
                catch (error) {
                    this.logger.error(`Failed to edit watchlist message: ${error.message}`);
                    await ctx.reply(messageText, {
                        reply_markup: keyboard.reply_markup,
                        parse_mode: 'Markdown',
                    });
                }
            }
            else {
                await ctx.reply(messageText, {
                    reply_markup: keyboard.reply_markup,
                    parse_mode: 'Markdown',
                });
            }
            this.logger.log(`Watchlist displayed successfully`);
        }
        catch (error) {
            this.logger.error(`Error displaying watchlist: ${error.message}`);
            throw error;
        }
    }
};
exports.WatchlistComponent = WatchlistComponent;
exports.WatchlistComponent = WatchlistComponent = WatchlistComponent_1 = __decorate([
    (0, common_1.Injectable)()
], WatchlistComponent);
function registerWatchlistHandlers(scene, watchlistComponent, getWatchlistItems, itemSelectedHandler, settingsHandler) {
    const logger = new common_1.Logger('WatchlistHandlers');
    (0, pagination_component_1.registerPaginationHandlers)(scene, 'watchlist', async (ctx, page) => {
        try {
            logger.log(`Navigating to watchlist page ${page}`);
            if (ctx.wizard?.state?.parameters) {
                ctx.wizard.state.parameters.watchlistPage = page;
            }
            const items = await getWatchlistItems(ctx, page);
            await watchlistComponent.display(ctx, {
                title: 'Your Watchlist',
                items,
                currentPage: page
            });
        }
        catch (error) {
            logger.error(`Error handling watchlist pagination: ${error.message}`);
            await ctx.answerCbQuery('Error loading page');
        }
    });
    scene.action('watchlist_refresh', async (ctx) => {
        try {
            logger.log('Refreshing watchlist');
            const currentPage = ctx.wizard?.state?.parameters?.watchlistPage || 1;
            const items = await getWatchlistItems(ctx, currentPage);
            await watchlistComponent.display(ctx, {
                title: 'Your Watchlist',
                items,
                currentPage
            });
            await ctx.answerCbQuery('Watchlist refreshed');
        }
        catch (error) {
            logger.error(`Error refreshing watchlist: ${error.message}`);
            await ctx.answerCbQuery('Error refreshing data');
        }
    });
    scene.action('watchlist_settings', async (ctx) => {
        try {
            logger.log('Opening watchlist settings');
            if (settingsHandler) {
                await settingsHandler(ctx);
            }
            else {
                await ctx.answerCbQuery('Settings feature coming soon');
            }
        }
        catch (error) {
            logger.error(`Error opening watchlist settings: ${error.message}`);
            await ctx.answerCbQuery('Error opening settings');
        }
    });
    scene.action(/^watchlist_select_(.+)$/, async (ctx) => {
        try {
            const match = /^watchlist_select_(.+)$/.exec(ctx.callbackQuery && 'data' in ctx.callbackQuery ? ctx.callbackQuery.data : '');
            if (!match)
                return;
            const itemId = match[1];
            logger.log(`Watchlist item selected: ${itemId}`);
            await itemSelectedHandler(ctx, itemId);
            await ctx.answerCbQuery();
        }
        catch (error) {
            logger.error(`Error handling watchlist item selection: ${error.message}`);
            await ctx.answerCbQuery('Error selecting item');
        }
    });
}
//# sourceMappingURL=watchlist.component.js.map