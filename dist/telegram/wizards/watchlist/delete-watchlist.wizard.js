"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDeleteWatchlistWizard = void 0;
const telegraf_1 = require("telegraf");
const common_1 = require("@nestjs/common");
const confirmation_component_1 = require("../../components/confirmation.component");
const feedback_component_1 = require("../../components/feedback.component");
const buttons_constant_1 = require("../../constants/buttons.constant");
const telegraf_2 = require("telegraf");
const watchlist_menu_1 = require("../../menus/watchlist.menu");
const logger = new common_1.Logger('DeleteWatchlistWizard');
const confirmationComponent = new confirmation_component_1.ConfirmationComponent();
const createDeleteWatchlistWizard = (watchlistService) => {
    const deleteWatchlistWizard = new telegraf_1.Scenes.WizardScene('delete-watchlist-wizard', async (ctx) => {
        logger.log('Step 1: Entering delete watchlist wizard');
        try {
            ctx.wizard.state.parameters = {};
            const telegramId = String(ctx.from?.id || '');
            const isGroup = false;
            const watchlists = await watchlistService.getWatchlists(telegramId, isGroup);
            if (watchlists.length === 0) {
                await ctx.reply('You don\'t have any watchlists to delete.');
                await ctx.scene.leave();
                await (0, watchlist_menu_1.sendWatchlistMenu)(ctx);
                return;
            }
            const buttons = watchlists.map(watchlist => {
                return [telegraf_2.Markup.button.callback(watchlist.name, `select_watchlist_to_delete_${watchlist.id}`)];
            });
            buttons.push([(0, buttons_constant_1.createGoBackButton)()]);
            const keyboard = telegraf_2.Markup.inlineKeyboard(buttons);
            await ctx.reply('⚠️ *Select a watchlist to delete:*', {
                reply_markup: keyboard.reply_markup,
                parse_mode: 'Markdown'
            });
            return ctx.wizard.next();
        }
        catch (error) {
            logger.error(`Error in delete watchlist wizard: ${error.message}`);
            await (0, feedback_component_1.showErrorToast)(ctx, 'Failed to load watchlists. Please try again.');
            await ctx.scene.leave();
            await (0, watchlist_menu_1.sendWatchlistMenu)(ctx);
            return;
        }
    }, async (ctx) => {
        return ctx.wizard.next();
    }, async (ctx) => {
        logger.log('Step 3: Deleting watchlist');
        try {
            const { watchlistId, watchlistName } = ctx.wizard.state.parameters;
            if (!watchlistId || !watchlistName) {
                await (0, feedback_component_1.showErrorToast)(ctx, 'Missing watchlist information.');
                await ctx.scene.leave();
                await (0, watchlist_menu_1.sendWatchlistMenu)(ctx);
                return;
            }
            const telegramId = String(ctx.from?.id || '');
            const isGroup = false;
            await watchlistService.deleteWatchlist(telegramId, isGroup, watchlistId);
            await (0, feedback_component_1.showSuccessToast)(ctx, `Watchlist "${watchlistName}" has been deleted!`);
            await ctx.reply(`Watchlist "${watchlistName}" deleted successfully!`);
            await (0, watchlist_menu_1.sendWatchlistMenu)(ctx);
            return ctx.scene.leave();
        }
        catch (error) {
            logger.error(`Error deleting watchlist: ${error.message}`);
            await (0, feedback_component_1.showErrorToast)(ctx, 'Failed to delete watchlist. Please try again.');
            await ctx.scene.leave();
            await (0, watchlist_menu_1.sendWatchlistMenu)(ctx);
            return;
        }
    });
    deleteWatchlistWizard.action(/^select_watchlist_to_delete_(.+)$/, async (ctx) => {
        try {
            const match = /^select_watchlist_to_delete_(.+)$/.exec(ctx.callbackQuery && 'data' in ctx.callbackQuery ? ctx.callbackQuery.data : '');
            if (match) {
                const watchlistId = match[1];
                logger.log(`Selected watchlist to delete: ${watchlistId}`);
                const watchlist = await watchlistService.getWatchlistById(watchlistId);
                ctx.wizard.state.parameters.watchlistId = watchlistId;
                ctx.wizard.state.parameters.watchlistName = watchlist.name;
                const confirmMessage = `⚠️ *Are you sure you want to delete the watchlist "${watchlist.name}"?*\n\nThis action cannot be undone.`;
                await confirmationComponent.prompt(ctx, {
                    message: confirmMessage,
                    confirmButtonText: '🗑️ Delete Permanently',
                    confirmCallbackData: 'delete_watchlist_confirm'
                });
                return ctx.wizard.next();
            }
            await ctx.answerCbQuery();
        }
        catch (error) {
            logger.error(`Error handling watchlist selection: ${error.message}`);
            await ctx.answerCbQuery('Error selecting watchlist');
            await ctx.scene.leave();
            await (0, watchlist_menu_1.sendWatchlistMenu)(ctx);
            return;
        }
    });
    (0, confirmation_component_1.registerConfirmationHandler)(deleteWatchlistWizard, 'delete_watchlist_confirm', async (ctx) => {
        const currentIndex = ctx.wizard.cursor;
        if (currentIndex < deleteWatchlistWizard.middleware().length) {
            return deleteWatchlistWizard.middleware()[currentIndex](ctx, async () => { });
        }
        await ctx.scene.leave();
        await (0, watchlist_menu_1.sendWatchlistMenu)(ctx);
        return;
    });
    deleteWatchlistWizard.action('go_back', async (ctx) => {
        logger.log('Leaving delete watchlist wizard');
        await ctx.scene.leave();
        await (0, watchlist_menu_1.sendWatchlistMenu)(ctx);
    });
    return deleteWatchlistWizard;
};
exports.createDeleteWatchlistWizard = createDeleteWatchlistWizard;
//# sourceMappingURL=delete-watchlist.wizard.js.map