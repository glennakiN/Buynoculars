"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCreateWatchlistWizard = void 0;
const telegraf_1 = require("telegraf");
const common_1 = require("@nestjs/common");
const text_input_component_1 = require("../../components/text-input.component");
const confirmation_component_1 = require("../../components/confirmation.component");
const feedback_component_1 = require("../../components/feedback.component");
const watchlist_menu_1 = require("../../menus/watchlist.menu");
const logger = new common_1.Logger('CreateWatchlistWizard');
const textInputComponent = new text_input_component_1.TextInputComponent();
const confirmationComponent = new confirmation_component_1.ConfirmationComponent();
const createCreateWatchlistWizard = (watchlistService) => {
    const createWatchlistWizard = new telegraf_1.Scenes.WizardScene('create-watchlist-wizard', async (ctx) => {
        logger.log('Step 1: Entering create watchlist wizard');
        try {
            ctx.wizard.state.parameters = {};
            const textInputConfig = {
                question: '📝 *Enter a name for your new watchlist:*\n\nType a name below.',
                fieldName: 'watchlistName'
            };
            await textInputComponent.prompt(ctx, textInputConfig);
            ctx.wizard.next();
        }
        catch (error) {
            logger.error(`Error in create watchlist wizard: ${error.message}`);
            await (0, feedback_component_1.showErrorToast)(ctx, 'Failed to start wizard. Please try again.');
            ctx.scene.leave();
        }
    }, async (ctx) => {
        logger.log('Step 2: Confirmation step');
        ctx.wizard.next();
    }, async (ctx) => {
        logger.log('Step 3: Creating watchlist');
        try {
            const watchlistName = ctx.wizard.state.parameters.watchlistName;
            if (!watchlistName) {
                await (0, feedback_component_1.showErrorToast)(ctx, 'No watchlist name provided.');
                ctx.scene.leave();
                return;
            }
            const telegramId = String(ctx.from?.id || '');
            const isGroup = false;
            const newWatchlist = await watchlistService.createWatchlist(telegramId, isGroup, watchlistName);
            await (0, feedback_component_1.showSuccessToast)(ctx, `Watchlist "${watchlistName}" has been created!`);
            await ctx.reply(`Watchlist "${watchlistName}" created successfully!`);
            await (0, watchlist_menu_1.sendWatchlistMenu)(ctx);
            ctx.scene.leave();
        }
        catch (error) {
            logger.error(`Error creating watchlist: ${error.message}`);
            await (0, feedback_component_1.showErrorToast)(ctx, 'Failed to create watchlist. Please try again.');
            ctx.scene.leave();
        }
    });
    (0, text_input_component_1.registerTextInputHandlers)(createWatchlistWizard, 'watchlistName', async (ctx) => {
        const watchlistName = ctx.wizard.state.parameters.watchlistName;
        const confirmMessage = `Are you sure you want to create a watchlist named "${watchlistName}"?`;
        await confirmationComponent.prompt(ctx, {
            message: confirmMessage,
            confirmButtonText: '✅ Create Watchlist',
            confirmCallbackData: 'create_watchlist_confirm'
        });
        ctx.wizard.selectStep(2);
    });
    (0, confirmation_component_1.registerConfirmationHandler)(createWatchlistWizard, 'create_watchlist_confirm', async (ctx) => {
        const currentIndex = ctx.wizard.cursor;
        if (currentIndex < createWatchlistWizard.middleware().length) {
            await createWatchlistWizard.middleware()[currentIndex](ctx, async () => { });
        }
        else {
            ctx.scene.leave();
        }
    });
    createWatchlistWizard.action('go_back', async (ctx) => {
        logger.log('Leaving create watchlist wizard');
        await ctx.scene.leave();
        await (0, watchlist_menu_1.sendWatchlistMenu)(ctx);
    });
    return createWatchlistWizard;
};
exports.createCreateWatchlistWizard = createCreateWatchlistWizard;
//# sourceMappingURL=create-watchlist.wizard.js.map