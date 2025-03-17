"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAddToWatchlistWizard = void 0;
const telegraf_1 = require("telegraf");
const common_1 = require("@nestjs/common");
const confirmation_component_1 = require("../../components/confirmation.component");
const feedback_component_1 = require("../../components/feedback.component");
const buttons_constant_1 = require("../../constants/buttons.constant");
const telegraf_2 = require("telegraf");
const watchlist_menu_1 = require("../../menus/watchlist.menu");
const coin_search_component_1 = require("../../components/coin-search.component");
const loading_message_component_1 = require("../../components/loading-message.component");
const logger = new common_1.Logger('AddToWatchlistWizard');
const confirmationComponent = new confirmation_component_1.ConfirmationComponent();
const loadingMessageComponent = new loading_message_component_1.LoadingMessageComponent();
const createAddToWatchlistWizard = (watchlistService, coinSearchService) => {
    const coinSearchComponent = new coin_search_component_1.CoinSearchComponent(coinSearchService);
    const addToWatchlistWizard = new telegraf_1.Scenes.WizardScene('add-to-watchlist-wizard', async (ctx) => {
        logger.log('Step 1: Starting Add to Watchlist wizard');
        try {
            ctx.wizard.state.parameters = {
                coinSearchState: {
                    page: 1,
                    results: []
                }
            };
            const sceneState = ctx.scene.state;
            const coinId = sceneState.coinId;
            if (coinId) {
                logger.log(`Coin ID provided: ${coinId}`);
                await (0, loading_message_component_1.withLoading)(ctx, async () => {
                    const coinDetails = await coinSearchService.getCoinById(coinId);
                    if (coinDetails) {
                        ctx.wizard.state.parameters.selectedCoin = coinDetails;
                        logger.log(`Coin details loaded: ${coinDetails.name} (${coinDetails.symbol})`);
                    }
                    else {
                        logger.error(`Coin with ID ${coinId} not found`);
                        await ctx.reply('Could not find the selected coin. Please try searching instead.');
                        return await promptForCoinSearch(ctx, coinSearchComponent);
                    }
                    return await showWatchlistSelection(ctx, watchlistService);
                }, {
                    messages: [
                        'Loading coin details...',
                        'Fetching cryptocurrency information...',
                        'Getting coin data...'
                    ],
                    emoji: '🔍'
                });
            }
            else {
                await promptForCoinSearch(ctx, coinSearchComponent);
            }
            return ctx.wizard.next();
        }
        catch (error) {
            logger.error(`Error in Add to Watchlist wizard initialization: ${error.message}`);
            await (0, feedback_component_1.showErrorToast)(ctx, 'Failed to start Add to Watchlist wizard. Please try again.');
            await ctx.scene.leave();
            return;
        }
    }, async (ctx) => {
        logger.log('Step 2: Handling coin search or transitions');
        return ctx.wizard.next();
    }, async (ctx) => {
        logger.log('Step 3: Watchlist selection or search results');
        return ctx.wizard.next();
    }, async (ctx) => {
        logger.log('Step 4: Confirming and processing addition');
        try {
            const { selectedCoin, selectedWatchlistId, selectedWatchlistName } = ctx.wizard.state.parameters;
            if (!selectedCoin || !selectedWatchlistId) {
                await (0, feedback_component_1.showErrorToast)(ctx, 'Missing required information. Please try again.');
                await ctx.scene.leave();
                await (0, watchlist_menu_1.sendWatchlistMenu)(ctx);
                return;
            }
            const telegramId = String(ctx.from?.id || '');
            const isGroup = false;
            await (0, loading_message_component_1.withLoading)(ctx, async () => {
                const updatedWatchlist = await watchlistService.addToWatchlist(telegramId, isGroup, selectedCoin.id, selectedWatchlistId);
                await (0, feedback_component_1.showSuccessToast)(ctx, `Added ${selectedCoin.name} (${selectedCoin.symbol}) to "${selectedWatchlistName}"!`);
                await ctx.reply(`✅ *Success!*\n\nAdded *${selectedCoin.name}* (${selectedCoin.symbol}) to your "${selectedWatchlistName}" watchlist.\n\nYou can now track its price and performance.`, { parse_mode: 'Markdown' });
                await (0, watchlist_menu_1.sendWatchlistMenu)(ctx);
                await ctx.scene.leave();
            }, {
                messages: [
                    'Adding to watchlist...',
                    'Updating your watchlist...',
                    'Saving your selection...'
                ],
                emoji: '💾'
            });
        }
        catch (error) {
            logger.error(`Error adding coin to watchlist: ${error.message}`);
            await (0, feedback_component_1.showErrorToast)(ctx, 'Failed to add coin to watchlist. Please try again.');
            await ctx.scene.leave();
            await (0, watchlist_menu_1.sendWatchlistMenu)(ctx);
        }
    });
    addToWatchlistWizard.on('text', async (ctx) => {
        logger.log('Processing text input for coin search');
        try {
            const query = ctx.message.text;
            logger.log(`Search query: "${query}"`);
            await (0, loading_message_component_1.withLoading)(ctx, async () => {
                const searchConfig = {
                    promptText: '',
                    fieldName: 'selectedCoin',
                    confidenceThreshold: 2.5
                };
                const state = await coinSearchComponent.processSearch(ctx, query, searchConfig);
                ctx.wizard.state.parameters.coinSearchState = state;
                if (state.selectedCoin) {
                    logger.log(`High confidence match found: ${state.selectedCoin.name}`);
                    ctx.wizard.state.parameters.selectedCoin = state.selectedCoin;
                    await showWatchlistSelection(ctx, watchlistService);
                }
                else {
                    logger.log('No high confidence match, showing results');
                    await coinSearchComponent.showResults(ctx, state, 'coinsearch');
                }
            }, {
                messages: [
                    'Searching for coins...',
                    'Looking up cryptocurrency data...',
                    'Fetching market information...'
                ],
                emoji: '🔍'
            });
        }
        catch (error) {
            logger.error(`Error processing search: ${error.message}`);
            await ctx.reply('An error occurred while searching. Please try again.');
            await promptForCoinSearch(ctx, coinSearchComponent);
        }
    });
    addToWatchlistWizard.action(/^coinsearch_select_\w+$/, async (ctx) => {
        logger.log('Coin selection action triggered');
        const callbackData = ctx.callbackQuery && 'data' in ctx.callbackQuery
            ? ctx.callbackQuery.data
            : '';
        const coinId = callbackData.split('_').pop();
        logger.log(`Selected coin ID: ${coinId}`);
        const state = ctx.wizard.state.parameters.coinSearchState;
        const selectedCoin = state?.results?.find(r => r.coin.id === coinId)?.coin;
        if (selectedCoin) {
            logger.log(`Found selected coin: ${selectedCoin.name}`);
            ctx.wizard.state.parameters.selectedCoin = selectedCoin;
            await ctx.answerCbQuery(`Selected ${selectedCoin.name} (${selectedCoin.symbol})`);
            await showWatchlistSelection(ctx, watchlistService);
        }
        else {
            logger.error(`Coin not found with ID: ${coinId}`);
            await ctx.answerCbQuery('Error: Coin not found');
            const state = ctx.wizard.state.parameters.coinSearchState;
            if (state) {
                await coinSearchComponent.showResults(ctx, state, 'coinsearch');
            }
            else {
                await promptForCoinSearch(ctx, coinSearchComponent);
            }
        }
    });
    addToWatchlistWizard.action(/^coinsearch_next_\d+$/, async (ctx) => {
        logger.log('Next page action triggered');
        const state = ctx.wizard.state.parameters.coinSearchState;
        if (!state) {
            logger.error('Search state is missing');
            await promptForCoinSearch(ctx, coinSearchComponent);
            return;
        }
        state.page += 1;
        ctx.wizard.state.parameters.coinSearchState = state;
        await coinSearchComponent.showResults(ctx, state, 'coinsearch');
        await ctx.answerCbQuery();
    });
    addToWatchlistWizard.action(/^coinsearch_prev_\d+$/, async (ctx) => {
        logger.log('Previous page action triggered');
        const state = ctx.wizard.state.parameters.coinSearchState;
        if (!state) {
            logger.error('Search state is missing');
            await promptForCoinSearch(ctx, coinSearchComponent);
            return;
        }
        state.page = Math.max(1, state.page - 1);
        ctx.wizard.state.parameters.coinSearchState = state;
        await coinSearchComponent.showResults(ctx, state, 'coinsearch');
        await ctx.answerCbQuery();
    });
    addToWatchlistWizard.action(/^select_watchlist_(.+)$/, async (ctx) => {
        try {
            const match = /^select_watchlist_(.+)$/.exec(ctx.callbackQuery && 'data' in ctx.callbackQuery ? ctx.callbackQuery.data : '');
            if (match) {
                const watchlistId = match[1];
                logger.log(`Selected watchlist ID: ${watchlistId}`);
                const watchlist = await watchlistService.getWatchlistById(watchlistId);
                ctx.wizard.state.parameters.selectedWatchlistId = watchlistId;
                ctx.wizard.state.parameters.selectedWatchlistName = watchlist.name;
                const selectedCoin = ctx.wizard.state.parameters.selectedCoin;
                const confirmMessage = `Are you sure you want to add *${selectedCoin.name}* (${selectedCoin.symbol}) to "${watchlist.name}"?`;
                await confirmationComponent.prompt(ctx, {
                    message: confirmMessage,
                    confirmButtonText: '✅ Add to Watchlist',
                    confirmCallbackData: 'add_to_watchlist_confirm',
                    parse_mode: 'Markdown'
                });
                ctx.wizard.selectStep(3);
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
    (0, confirmation_component_1.registerConfirmationHandler)(addToWatchlistWizard, 'add_to_watchlist_confirm', async (ctx) => {
        logger.log('Confirmation received for adding to watchlist');
        try {
            const { selectedCoin, selectedWatchlistId, selectedWatchlistName } = ctx.wizard.state.parameters;
            if (!selectedCoin || !selectedWatchlistId) {
                throw new Error('Missing required information');
            }
            const telegramId = String(ctx.from?.id || '');
            const isGroup = false;
            await (0, loading_message_component_1.withLoading)(ctx, async () => {
                const updatedWatchlist = await watchlistService.addToWatchlist(telegramId, isGroup, selectedCoin.id, selectedWatchlistId);
                await (0, feedback_component_1.showSuccessToast)(ctx, `Added ${selectedCoin.name} (${selectedCoin.symbol}) to "${selectedWatchlistName}"!`, 3000);
                await (0, watchlist_menu_1.sendWatchlistMenu)(ctx);
                await ctx.scene.leave();
            }, {
                messages: [
                    'Adding to watchlist...',
                    'Updating your watchlist...',
                    'Saving your selection...'
                ],
                emoji: '💾'
            });
        }
        catch (error) {
            logger.error(`Error in confirmation handler: ${error.message}`);
            await (0, feedback_component_1.showErrorToast)(ctx, 'Failed to add coin to watchlist. Please try again.');
            await ctx.scene.leave();
            await (0, watchlist_menu_1.sendWatchlistMenu)(ctx);
        }
    });
    addToWatchlistWizard.action('go_back', async (ctx) => {
        logger.log('Go back action triggered');
        const currentStep = ctx.wizard.cursor;
        if (currentStep === 2 && ctx.wizard.state.parameters.coinSearchState) {
            logger.log('Going back to coin search prompt');
            await promptForCoinSearch(ctx, coinSearchComponent);
            return;
        }
        if (currentStep === 3 && ctx.wizard.state.parameters.coinSearchState?.results?.length > 0) {
            logger.log('Going back to search results');
            const state = ctx.wizard.state.parameters.coinSearchState;
            await coinSearchComponent.showResults(ctx, state, 'coinsearch');
            ctx.wizard.selectStep(2);
            return;
        }
        logger.log('Leaving Add to Watchlist wizard');
        await ctx.scene.leave();
        await (0, watchlist_menu_1.sendWatchlistMenu)(ctx);
    });
    return addToWatchlistWizard;
};
exports.createAddToWatchlistWizard = createAddToWatchlistWizard;
async function promptForCoinSearch(ctx, coinSearchComponent) {
    const searchConfig = {
        promptText: '🔍 *Search for a cryptocurrency:*\n\nPlease enter the name or symbol of the coin you want to add to your watchlist.',
        fieldName: 'selectedCoin',
        confidenceThreshold: 2.5,
        searchCallbackPrefix: 'coinsearch'
    };
    await coinSearchComponent.prompt(ctx, searchConfig);
}
async function showWatchlistSelection(ctx, watchlistService) {
    logger.log('Showing watchlist selection');
    const selectedCoin = ctx.wizard.state.parameters.selectedCoin;
    if (!selectedCoin) {
        logger.error('No coin selected');
        await ctx.reply('Error: No coin selected. Please try again.');
        await ctx.scene.leave();
        await (0, watchlist_menu_1.sendWatchlistMenu)(ctx);
        return;
    }
    try {
        const telegramId = String(ctx.from?.id || '');
        const isGroup = false;
        const watchlists = await watchlistService.getWatchlists(telegramId, isGroup);
        if (watchlists.length === 0) {
            logger.log('No watchlists found, prompting to create one');
            await ctx.reply(`You don't have any watchlists yet. Would you like to create one?`);
            const keyboard = telegraf_2.Markup.inlineKeyboard([
                [telegraf_2.Markup.button.callback('➕ Create Watchlist', 'create_watchlist')],
                [(0, buttons_constant_1.createGoBackButton)()]
            ]);
            await ctx.reply('Choose an option:', {
                reply_markup: keyboard.reply_markup
            });
            return;
        }
        const messageText = `Selected coin: *${selectedCoin.name}* (${selectedCoin.symbol})\n\nChoose a watchlist to add it to:`;
        const buttons = watchlists.map(watchlist => {
            return [telegraf_2.Markup.button.callback(watchlist.name, `select_watchlist_${watchlist.id}`)];
        });
        buttons.push([
            telegraf_2.Markup.button.callback('➕ Create New Watchlist', 'create_watchlist')
        ]);
        buttons.push([(0, buttons_constant_1.createGoBackButton)()]);
        const keyboard = telegraf_2.Markup.inlineKeyboard(buttons);
        await ctx.reply(messageText, {
            reply_markup: keyboard.reply_markup,
            parse_mode: 'Markdown'
        });
    }
    catch (error) {
        logger.error(`Error showing watchlist selection: ${error.message}`);
        await ctx.reply('Error loading watchlists. Please try again.');
        await ctx.scene.leave();
        await (0, watchlist_menu_1.sendWatchlistMenu)(ctx);
    }
}
//# sourceMappingURL=add-to-watchlist.wizard.js.map