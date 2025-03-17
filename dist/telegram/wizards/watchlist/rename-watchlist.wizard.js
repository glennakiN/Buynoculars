"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRenameWatchlistWizard = void 0;
const telegraf_1 = require("telegraf");
const common_1 = require("@nestjs/common");
const text_input_component_1 = require("../../components/text-input.component");
const confirmation_component_1 = require("../../components/confirmation.component");
const feedback_component_1 = require("../../components/feedback.component");
const buttons_constant_1 = require("../../constants/buttons.constant");
const telegraf_2 = require("telegraf");
const watchlist_menu_1 = require("../../menus/watchlist.menu");
const logger = new common_1.Logger('RenameWatchlistWizard');
const textInputComponent = new text_input_component_1.TextInputComponent();
const confirmationComponent = new confirmation_component_1.ConfirmationComponent();
const createRenameWatchlistWizard = (watchlistService) => {
    const renameWatchlistWizard = new telegraf_1.Scenes.WizardScene('rename-watchlist-wizard', async (ctx) => {
        logger.log('Step 1: Entering rename watchlist wizard');
        try {
            ctx.wizard.state.parameters = {};
            const telegramId = String(ctx.from?.id || '');
            const isGroup = false;
            const watchlists = await watchlistService.getWatchlists(telegramId, isGroup);
            if (watchlists.length === 0) {
                await ctx.reply('You don\'t have any watchlists to rename. Create one first!');
                ctx.scene.leave();
                await (0, watchlist_menu_1.sendWatchlistMenu)(ctx);
                return;
            }
            const buttons = watchlists.map(watchlist => {
                return [telegraf_2.Markup.button.callback(watchlist.name, `select_watchlist_${watchlist.id}`)];
            });
            buttons.push([(0, buttons_constant_1.createGoBackButton)()]);
            const keyboard = telegraf_2.Markup.inlineKeyboard(buttons);
            await ctx.reply('Select a watchlist to rename:', {
                reply_markup: keyboard.reply_markup
            });
            ctx.wizard.next();
        }
        catch (error) {
            logger.error(`Error in rename watchlist wizard: ${error.message}`);
            await (0, feedback_component_1.showErrorToast)(ctx, 'Failed to load watchlists. Please try again.');
            ctx.scene.leave();
            await (0, watchlist_menu_1.sendWatchlistMenu)(ctx);
        }
    }, async (ctx) => {
        ctx.wizard.next();
    }, async (ctx) => {
        ctx.wizard.next();
    }, async (ctx) => {
        logger.log('Step 4: Renaming watchlist');
        try {
            const { watchlistId, newWatchlistName, currentWatchlistName } = ctx.wizard.state.parameters;
            if (!watchlistId || !newWatchlistName) {
                await (0, feedback_component_1.showErrorToast)(ctx, 'Missing watchlist information.');
                ctx.scene.leave();
                await (0, watchlist_menu_1.sendWatchlistMenu)(ctx);
                return;
            }
            const telegramId = String(ctx.from?.id || '');
            const isGroup = false;
            const updatedWatchlist = await watchlistService.renameWatchlist(telegramId, isGroup, watchlistId, newWatchlistName);
            await (0, feedback_component_1.showSuccessToast)(ctx, `Watchlist renamed from "${currentWatchlistName}" to "${newWatchlistName}"!`);
            await ctx.reply(`Watchlist renamed successfully!`);
            await (0, watchlist_menu_1.sendWatchlistMenu)(ctx);
            ctx.scene.leave();
        }
        catch (error) {
            logger.error(`Error renaming watchlist: ${error.message}`);
            await (0, feedback_component_1.showErrorToast)(ctx, 'Failed to rename watchlist. Please try again.');
            ctx.scene.leave();
            await (0, watchlist_menu_1.sendWatchlistMenu)(ctx);
        }
    });
    renameWatchlistWizard.action(/^select_watchlist_(.+)$/, async (ctx) => {
        try {
            const match = /^select_watchlist_(.+)$/.exec(ctx.callbackQuery && 'data' in ctx.callbackQuery ? ctx.callbackQuery.data : '');
            if (match) {
                const watchlistId = match[1];
                logger.log(`Selected watchlist ID: ${watchlistId}`);
                const watchlist = await watchlistService.getWatchlistById(watchlistId);
                ctx.wizard.state.parameters.watchlistId = watchlistId;
                ctx.wizard.state.parameters.currentWatchlistName = watchlist.name;
                const textInputConfig = {
                    question: `📝 *Enter a new name for "${watchlist.name}":*\n\nType a name below.`,
                    fieldName: 'newWatchlistName'
                };
                await textInputComponent.prompt(ctx, textInputConfig);
                ctx.wizard.selectStep(2);
                return;
            }
            await ctx.answerCbQuery();
        }
        catch (error) {
            logger.error(`Error handling watchlist selection: ${error.message}`);
            await ctx.answerCbQuery('Error selecting watchlist');
            ctx.scene.leave();
            await (0, watchlist_menu_1.sendWatchlistMenu)(ctx);
        }
    });
    (0, text_input_component_1.registerTextInputHandlers)(renameWatchlistWizard, 'newWatchlistName', async (ctx) => {
        const newWatchlistName = ctx.wizard.state.parameters.newWatchlistName;
        const currentWatchlistName = ctx.wizard.state.parameters.currentWatchlistName;
        const confirmMessage = `Are you sure you want to rename "${currentWatchlistName}" to "${newWatchlistName}"?`;
        await confirmationComponent.prompt(ctx, {
            message: confirmMessage,
            confirmButtonText: '✅ Rename Watchlist',
            confirmCallbackData: 'rename_watchlist_confirm'
        });
        ctx.wizard.selectStep(3);
    });
    (0, confirmation_component_1.registerConfirmationHandler)(renameWatchlistWizard, 'rename_watchlist_confirm', async (ctx) => {
        const currentIndex = ctx.wizard.cursor;
        if (currentIndex < renameWatchlistWizard.middleware().length) {
            await renameWatchlistWizard.middleware()[currentIndex](ctx, async () => { });
        }
        else {
            ctx.scene.leave();
            await (0, watchlist_menu_1.sendWatchlistMenu)(ctx);
        }
    });
    renameWatchlistWizard.action('go_back', async (ctx) => {
        logger.log('Leaving rename watchlist wizard');
        await ctx.scene.leave();
        await (0, watchlist_menu_1.sendWatchlistMenu)(ctx);
    });
    return renameWatchlistWizard;
};
exports.createRenameWatchlistWizard = createRenameWatchlistWizard;
//# sourceMappingURL=rename-watchlist.wizard.js.map