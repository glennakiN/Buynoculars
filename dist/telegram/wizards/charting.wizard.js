"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChartingWizard = void 0;
const telegraf_1 = require("telegraf");
const common_1 = require("@nestjs/common");
const coin_search_component_1 = require("../components/coin-search.component");
const pair_time_picker_component_1 = require("../components/pair-time-picker.component");
const chart_image_service_1 = require("../services/chart-image.service");
const reply_with_image_caption_component_1 = require("../components/reply-with-image-caption.component");
const coin_search_service_1 = require("../services/coin-search.service");
const action_buttons_component_1 = require("../components/action-buttons.component");
const loading_message_component_1 = require("../components/loading-message.component");
const logger = new common_1.Logger('ChartingWizard');
const coinSearchService = new coin_search_service_1.CoinSearchService();
const coinSearchComponent = new coin_search_component_1.CoinSearchComponent(coinSearchService);
const pairTimePicker = new pair_time_picker_component_1.PairTimePickerComponent();
const pairTimePickerHandler = new pair_time_picker_component_1.PairTimePickerComponentCallbackHandler();
const chartImageService = new chart_image_service_1.ChartImageService();
const actionButtonsHandler = new action_buttons_component_1.ActionButtonsHandler();
const loadingMessageComponent = new loading_message_component_1.LoadingMessageComponent();
const CHART_LOADING_MESSAGES = [
    'Drawing some lines...',
    'Evaluating the charts, standby...',
    'Chart will be done in a sec, thinking...',
    'Analyzing market patterns...',
    'Crunching the numbers...',
    'Reading the candlesticks...',
    'Consulting with the trading algorithms...',
    'Generating your chart, almost there...',
    'Looking for support and resistance levels...',
    'Checking the technical indicators...'
];
async function step1(ctx) {
    ctx.wizard.state.step = 1;
    logger.log('Step 1: Prompting for coin search');
    const searchConfig = {
        promptText: '🔍 *Search for a cryptocurrency:*\n\nPlease enter the name or symbol of the coin you want to chart.',
        fieldName: 'selectedCoin',
        confidenceThreshold: 2.5,
        searchCallbackPrefix: 'coinsearch'
    };
    await coinSearchComponent.prompt(ctx, searchConfig);
}
async function step2(ctx) {
    ctx.wizard.state.step = 2;
    logger.log('Step 2: Showing search results');
    const searchState = ctx.wizard.state.parameters?.coinSearchState;
    if (!searchState) {
        logger.error('Search state is missing, returning to search prompt');
        return step1(ctx);
    }
    await coinSearchComponent.showResults(ctx, searchState, 'coinsearch');
}
async function step3(ctx) {
    ctx.wizard.state.step = 3;
    logger.log('Step 3: Rendering pair/time picker');
    if (!ctx.wizard.state.parameters) {
        ctx.wizard.state.parameters = {};
    }
    if (!ctx.wizard.state.parameters.pickerState) {
        ctx.wizard.state.parameters.pickerState = {
            selectedPairing: 'USD',
            selectedTimeframe: '1D'
        };
    }
    logger.log(`Step 3: Picker state: ${JSON.stringify(ctx.wizard.state.parameters.pickerState)}`);
    logger.log(`Step 3: Selected coin: ${ctx.wizard.state.parameters?.selectedCoin?.name || 'None'}`);
    const messageText = '📊 *Select a currency pairing and timeframe:*';
    const keyboard = pairTimePicker.render('cmbpicker', ctx.wizard.state.parameters.pickerState);
    if (ctx.callbackQuery) {
        try {
            await ctx.editMessageText(messageText, {
                reply_markup: keyboard.reply_markup,
                parse_mode: 'Markdown'
            });
        }
        catch (error) {
            await ctx.reply(messageText, {
                reply_markup: keyboard.reply_markup,
                parse_mode: 'Markdown'
            });
        }
    }
    else {
        await ctx.reply(messageText, {
            reply_markup: keyboard.reply_markup,
            parse_mode: 'Markdown'
        });
    }
}
async function step4(ctx) {
    ctx.wizard.state.step = 4;
    logger.log('Step 4: Generating chart');
    const parameters = ctx.wizard.state.parameters;
    const pickerState = ctx.wizard.state.parameters?.pickerState;
    logger.log(`Step 4: Parameters: ${JSON.stringify(parameters)}`);
    logger.log(`Step 4: Picker state: ${JSON.stringify(pickerState)}`);
    if (!pickerState || !parameters?.selectedCoin) {
        logger.error('Step 4: Missing required parameters');
        await ctx.reply('Missing parameters. Exiting wizard.');
        return ctx.scene.leave();
    }
    const selectedPairing = pickerState.selectedPairing ?? 'USD';
    const selectedTimeframe = pickerState.selectedTimeframe ?? '1D';
    const selectedCoin = parameters.selectedCoin;
    logger.log(`Step 4: Generating chart for ${selectedCoin.name} / ${selectedPairing} / ${selectedTimeframe}`);
    try {
        await (0, loading_message_component_1.withLoading)(ctx, async () => {
            const imageBuffer = await chartImageService.generateMockChart(selectedCoin.name, selectedPairing, selectedTimeframe);
            const caption = `📈 *${selectedCoin.name} (${selectedCoin.symbol})*\n` +
                `Pairing: ${selectedPairing}\n` +
                `Timeframe: ${selectedTimeframe}`;
            await (0, reply_with_image_caption_component_1.getReplyWithChart)(ctx, imageBuffer, caption, selectedCoin.id, action_buttons_component_1.ActionButtonType.TRADING);
            logger.log('Step 4: Chart generated and sent successfully with action buttons');
        }, {
            messages: CHART_LOADING_MESSAGES,
            emoji: '📊'
        });
    }
    catch (error) {
        logger.error(`Step 4: Error generating chart: ${error.message}`);
        await ctx.reply('❌ An error occurred while generating the chart. Please try again.');
    }
    logger.log('Step 4: Leaving wizard scene');
    return ctx.scene.leave();
}
exports.ChartingWizard = new telegraf_1.Scenes.WizardScene('charting-wizard', step1);
exports.ChartingWizard.on('text', async (ctx) => {
    const wizardState = ctx.wizard.state;
    const step = wizardState.step;
    logger.log(`Received text input in step ${step}`);
    if (step === 1) {
        logger.log('Processing text input for coin search');
        try {
            await (0, loading_message_component_1.withLoading)(ctx, async () => {
                const query = ctx.message.text;
                logger.log(`Search query: "${query}"`);
                const searchConfig = {
                    promptText: '',
                    fieldName: 'selectedCoin',
                    confidenceThreshold: 2.5
                };
                if (!wizardState.parameters) {
                    wizardState.parameters = {};
                }
                const state = await coinSearchComponent.processSearch(ctx, query, searchConfig);
                wizardState.parameters.coinSearchState = state;
                if (state.selectedCoin) {
                    logger.log(`High confidence match found: ${state.selectedCoin.name}`);
                    wizardState.parameters.selectedCoin = state.selectedCoin;
                    return step3(ctx);
                }
                logger.log('No high confidence match, showing results');
                return step2(ctx);
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
            await ctx.reply('❌ An error occurred while searching. Please try again.');
            return step1(ctx);
        }
    }
});
exports.ChartingWizard.action(/^coinsearch_select_\w+$/, async (ctx) => {
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
        return step3(ctx);
    }
    logger.error(`Coin not found with ID: ${coinId}`);
    await ctx.answerCbQuery('Error: Coin not found');
    return step2(ctx);
});
exports.ChartingWizard.action(/^coinsearch_next_\d+$/, async (ctx) => {
    logger.log('Next page action triggered');
    const state = ctx.wizard.state.parameters.coinSearchState;
    if (!state) {
        logger.error('Search state is missing');
        return step1(ctx);
    }
    state.page += 1;
    ctx.wizard.state.parameters.coinSearchState = state;
    await coinSearchComponent.showResults(ctx, state, 'coinsearch');
    await ctx.answerCbQuery();
});
exports.ChartingWizard.action(/^coinsearch_prev_\d+$/, async (ctx) => {
    logger.log('Previous page action triggered');
    const state = ctx.wizard.state.parameters.coinSearchState;
    if (!state) {
        logger.error('Search state is missing');
        return step1(ctx);
    }
    state.page = Math.max(1, state.page - 1);
    ctx.wizard.state.parameters.coinSearchState = state;
    await coinSearchComponent.showResults(ctx, state, 'coinsearch');
    await ctx.answerCbQuery();
});
exports.ChartingWizard.action(/^cmbpicker_.+$/, async (ctx) => {
    const data = ctx.callbackQuery && 'data' in ctx.callbackQuery
        ? ctx.callbackQuery.data
        : undefined;
    if (!data)
        return;
    const currentState = ctx.wizard.state.parameters.pickerState || {
        selectedPairing: 'USD',
        selectedTimeframe: '1D'
    };
    const result = await pairTimePickerHandler.handleCallback(ctx, data, currentState);
    ctx.wizard.state.parameters.pickerState = result.state;
    if (result.proceed) {
        return step4(ctx);
    }
    return step3(ctx);
});
exports.ChartingWizard.action(/^(add_watchlist|set_alert|follow_source)_.+$/, async (ctx) => {
    logger.log('Action button callback triggered');
    const data = ctx.callbackQuery && 'data' in ctx.callbackQuery
        ? ctx.callbackQuery.data
        : '';
    await actionButtonsHandler.handleCallback(ctx, data);
});
exports.ChartingWizard.action('go_back', async (ctx) => {
    const wizardState = ctx.wizard.state;
    if (wizardState.step && wizardState.step > 1) {
        wizardState.step = wizardState.step - 1;
        if (wizardState.step === 1) {
            return step1(ctx);
        }
        else if (wizardState.step === 2) {
            return step2(ctx);
        }
        else if (wizardState.step === 3) {
            return step3(ctx);
        }
    }
    else {
        await ctx.scene.leave();
    }
});
//# sourceMappingURL=charting.wizard.js.map