"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createShowWatchlistWizard = void 0;
const telegraf_1 = require("telegraf");
const common_1 = require("@nestjs/common");
const watchlist_component_1 = require("../../components/watchlist.component");
const feedback_component_1 = require("../../components/feedback.component");
const watchlist_menu_1 = require("../../menus/watchlist.menu");
const logger = new common_1.Logger('ShowWatchlistWizard');
const watchlistComponent = new watchlist_component_1.WatchlistComponent();
const createShowWatchlistWizard = (watchlistService) => {
    const showWatchlistWizard = new telegraf_1.Scenes.WizardScene('show-watchlist-wizard', async (ctx) => {
        logger.log('Entering show watchlist wizard');
        try {
            ctx.wizard.state.parameters = {
                currentPage: 1
            };
            await displayWatchlists(ctx, watchlistService);
            return ctx.wizard.next();
        }
        catch (error) {
            logger.error(`Error in show watchlist wizard: ${error.message}`);
            await (0, feedback_component_1.showErrorToast)(ctx, 'Failed to load watchlists. Please try again.');
            return ctx.scene.leave();
        }
    });
    showWatchlistWizard.action(/^watchlist_page_(\d+)$/, async (ctx) => {
        try {
            const match = /^watchlist_page_(\d+)$/.exec(ctx.callbackQuery && 'data' in ctx.callbackQuery ? ctx.callbackQuery.data : '');
            if (match) {
                const page = parseInt(match[1], 10);
                logger.log(`Navigating to watchlist page ${page}`);
                ctx.wizard.state.parameters.currentPage = page;
                await displayWatchlists(ctx, watchlistService);
            }
            await ctx.answerCbQuery();
        }
        catch (error) {
            logger.error(`Error handling pagination: ${error.message}`);
            await ctx.answerCbQuery('Error loading page');
        }
    });
    showWatchlistWizard.action('watchlist_refresh', async (ctx) => {
        try {
            logger.log('Refreshing watchlists');
            const currentPage = ctx.wizard.state.parameters?.currentPage || 1;
            ctx.wizard.state.parameters.currentPage = currentPage;
            await ctx.answerCbQuery('Watchlists refreshed');
            await displayWatchlists(ctx, watchlistService);
        }
        catch (error) {
            logger.error(`Error refreshing watchlists: ${error.message}`);
            await ctx.answerCbQuery('Error refreshing data');
        }
    });
    showWatchlistWizard.action(/^watchlist_select_(.+)$/, async (ctx) => {
        try {
            const match = /^watchlist_select_(.+)$/.exec(ctx.callbackQuery && 'data' in ctx.callbackQuery ? ctx.callbackQuery.data : '');
            if (match) {
                const itemId = match[1];
                logger.log(`Selected watchlist item: ${itemId}`);
                await ctx.answerCbQuery(`Selected ${itemId}`);
                await displayWatchlists(ctx, watchlistService);
            }
            else {
                await ctx.answerCbQuery();
            }
        }
        catch (error) {
            logger.error(`Error handling watchlist item selection: ${error.message}`);
            await ctx.answerCbQuery('Error selecting item');
        }
    });
    showWatchlistWizard.action('watchlist_settings', async (ctx) => {
        try {
            logger.log('Opening watchlist settings');
            await ctx.answerCbQuery();
            await ctx.scene.leave();
            await (0, watchlist_menu_1.sendWatchlistMenu)(ctx);
        }
        catch (error) {
            logger.error(`Error opening watchlist settings: ${error.message}`);
            await ctx.answerCbQuery('Error opening settings');
        }
    });
    showWatchlistWizard.action('create_watchlist_settings', async (ctx) => {
        await ctx.answerCbQuery();
        await ctx.scene.leave();
        return ctx.scene.enter('create-watchlist-wizard');
    });
    showWatchlistWizard.action('rename_watchlist_settings', async (ctx) => {
        await ctx.answerCbQuery();
        await ctx.scene.leave();
        return ctx.scene.enter('rename-watchlist-wizard');
    });
    showWatchlistWizard.action('delete_watchlist_settings', async (ctx) => {
        await ctx.answerCbQuery();
        await ctx.scene.leave();
        return ctx.scene.enter('delete-watchlist-wizard');
    });
    showWatchlistWizard.action('add_coins_settings', async (ctx) => {
        await ctx.answerCbQuery('Feature coming soon!');
    });
    showWatchlistWizard.action('go_back', async (ctx) => {
        logger.log('Leaving show watchlist wizard');
        await ctx.scene.leave();
        await (0, watchlist_menu_1.sendWatchlistMenu)(ctx);
    });
    return showWatchlistWizard;
};
exports.createShowWatchlistWizard = createShowWatchlistWizard;
async function displayWatchlists(ctx, watchlistService) {
    try {
        logger.log('Displaying watchlists');
        const telegramId = String(ctx.from?.id || '');
        const isGroup = false;
        const watchlists = await watchlistService.getWatchlists(telegramId, isGroup);
        const items = watchlistService.transformWatchlistsToDisplayItems(watchlists);
        const currentPage = ctx.wizard.state.parameters?.currentPage || 1;
        await watchlistComponent.display(ctx, {
            title: 'Your Watchlists',
            description: 'Here are the cryptocurrencies you\'re tracking:',
            items,
            currentPage,
            showWatchlistNames: true,
            priceFormat: 'USD',
            showPriceChange: true
        });
    }
    catch (error) {
        logger.error(`Error displaying watchlists: ${error.message}`);
        await (0, feedback_component_1.showErrorToast)(ctx, 'Failed to load watchlists. Please try again.');
        throw error;
    }
}
//# sourceMappingURL=show-watchlist.wizard.js.map