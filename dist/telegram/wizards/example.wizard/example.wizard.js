"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exampleWizard = void 0;
const telegraf_1 = require("telegraf");
const picker_component_1 = require("../../components/picker.component/picker.component");
const options_component_1 = require("../../components/options.component/options.component");
const response_component_1 = require("../../components/response.component/response.component");
const sub_menu_1 = require("../../menus/sub.menu");
const pair_time_picker_component_1 = require("../../components/pair-time-picker.component");
const multi_picker_component_1 = require("../../components/multi-picker.component");
const options_service_1 = require("../../services/options.service");
const common_1 = require("@nestjs/common");
const text_input_component_1 = require("../../components/text-input.component");
const confirmation_component_1 = require("../../components/confirmation.component");
const coin_search_component_1 = require("../../components/coin-search.component");
const coin_search_service_1 = require("../../services/coin-search.service");
const logger = new common_1.Logger('ExampleWizard');
const combinedPicker = new pair_time_picker_component_1.PairTimePickerComponent();
const combinedPickerHandler = new pair_time_picker_component_1.PairTimePickerComponentCallbackHandler();
const multiPicker = new multi_picker_component_1.MultiPickerComponent();
const multiPickerHandler = new multi_picker_component_1.MultiPickerCallbackHandler();
const optionsService = new options_service_1.OptionsService();
const textInputComponent = new text_input_component_1.TextInputComponent();
const confirmationComponent = new confirmation_component_1.ConfirmationComponent();
const coinSearchService = new coin_search_service_1.CoinSearchService();
const coinSearchComponent = new coin_search_component_1.CoinSearchComponent(coinSearchService);
async function step1(ctx) {
    ctx.wizard.state.step = 1;
    logger.log('Entering step 1: Initial options');
    const pickerConfig = {
        text: 'Please pick an option:',
        options: [
            { label: 'Option 1', action: 'picker_option_1' },
            { label: 'Option 2', action: 'picker_option_2' },
        ],
    };
    await (0, picker_component_1.pickerComponent)(ctx, pickerConfig);
}
async function step2(ctx) {
    ctx.wizard.state.step = 2;
    logger.log('Entering step 2: Alert name input');
    const textInputConfig = {
        question: '📝 *Please provide a name for this alert:*\n\nType your response below.',
        fieldName: 'alertName',
        showSkipButton: true,
        skipButtonText: 'Use default name'
    };
    await textInputComponent.prompt(ctx, textInputConfig);
}
async function step3(ctx) {
    ctx.wizard.state.step = 3;
    logger.log('Entering step 3: Coin search prompt');
    const searchConfig = {
        promptText: '🔍 *Search for a cryptocurrency:*\n\nPlease enter the name or symbol of the coin you want to track.',
        fieldName: 'selectedCoin',
        confidenceThreshold: 2.5,
        searchCallbackPrefix: 'coinsearch'
    };
    await coinSearchComponent.prompt(ctx, searchConfig);
}
async function step3b(ctx) {
    logger.log('Entering step 3b: Showing search results');
    const searchState = ctx.wizard.state.parameters.coinSearchState;
    if (!searchState) {
        logger.error('Search state is missing, returning to search prompt');
        return step3(ctx);
    }
    await coinSearchComponent.showResults(ctx, searchState, 'coinsearch');
}
async function step4(ctx) {
    ctx.wizard.state.step = 4;
    logger.log('Entering step 4: Pair/timeframe picker');
    if (!ctx.wizard.state.parameters.pickerState) {
        ctx.wizard.state.parameters.pickerState = {
            selectedPairing: 'USD',
            selectedTimeframe: '1D'
        };
    }
    const messageText = 'Please select currency pair and timeframe:';
    const keyboard = combinedPicker.render('cmbpicker', ctx.wizard.state.parameters.pickerState);
    if (ctx.callbackQuery) {
        try {
            await ctx.editMessageText(messageText, {
                reply_markup: keyboard.reply_markup,
            });
        }
        catch (error) {
            await ctx.reply(messageText, {
                reply_markup: keyboard.reply_markup,
            });
        }
    }
    else {
        await ctx.reply(messageText, {
            reply_markup: keyboard.reply_markup,
        });
    }
}
async function step5(ctx) {
    ctx.wizard.state.step = 5;
    logger.log('Entering step 5: Indicators multi-picker');
    if (!ctx.wizard.state.parameters.multiPickerState) {
        ctx.wizard.state.parameters.multiPickerState = {
            selectedOptions: [],
            type: options_service_1.OptionsType.INDICATORS
        };
    }
    try {
        const options = await optionsService.getOptions(options_service_1.OptionsType.INDICATORS);
        ctx.wizard.state.parameters.availableOptions = options;
        ctx.wizard.state.parameters.optionsLimit = 3;
        const messageText = 'Select up to 3 indicators for your alert:';
        const keyboard = multiPicker.render('multipicker', ctx.wizard.state.parameters.multiPickerState, options, ctx.wizard.state.parameters.optionsLimit);
        if (ctx.callbackQuery) {
            try {
                await ctx.editMessageText(messageText, {
                    reply_markup: keyboard.reply_markup,
                });
            }
            catch (error) {
                await ctx.reply(messageText, {
                    reply_markup: keyboard.reply_markup,
                });
            }
        }
        else {
            await ctx.reply(messageText, {
                reply_markup: keyboard.reply_markup,
            });
        }
    }
    catch (error) {
        logger.error(`Error fetching options: ${error.message}`);
        await ctx.reply('An error occurred. Please try again.');
        return step6(ctx);
    }
}
async function step6(ctx) {
    ctx.wizard.state.step = 6;
    logger.log('Entering step 6: Route selection');
    const optionsConfig = {
        text: 'Choose an action:',
        buttons: [
            { label: 'Route A', action: 'route_a' },
            { label: 'Route B', action: 'route_b' },
        ],
    };
    await (0, options_component_1.optionsComponent)(ctx, optionsConfig);
}
async function step7(ctx) {
    ctx.wizard.state.step = 7;
    logger.log('Entering step 7: Confirmation');
    const { picker, alertName = 'Default Alert Name', pickerState, multiPickerState } = ctx.wizard.state.parameters;
    const pair = pickerState?.selectedPairing || 'USD';
    const timeframe = pickerState?.selectedTimeframe || '1D';
    const indicators = multiPickerState?.selectedOptions || [];
    const route = ctx.wizard.state.parameters.route || 'Not selected';
    const selectedCoin = ctx.wizard.state.parameters.selectedCoin;
    const coinInfo = selectedCoin
        ? `${selectedCoin.name} (${selectedCoin.symbol})`
        : 'No coin selected';
    const confirmationMessage = `
*Please confirm your alert settings:*

• Option: ${picker}
• Alert Name: ${alertName}
• Coin: ${coinInfo}
• Pair: ${pair}
• Timeframe: ${timeframe}
• Indicators: ${indicators.length > 0 ? indicators.join(', ') : 'None'}
• Route: ${route}

Are you sure you want to create this alert?
  `;
    await confirmationComponent.prompt(ctx, {
        message: confirmationMessage,
        confirmButtonText: '✅ Create Alert',
        cancelButtonText: '← Go Back',
        confirmCallbackData: 'create_alert_confirm'
    });
}
async function step8(ctx) {
    ctx.wizard.state.step = 8;
    logger.log('Entering step 8: Final response');
    const { picker, alertName, route, pickerState, selectedCoin, multiPickerState } = ctx.wizard.state.parameters;
    const parameters = {
        picker,
        alertName: alertName || 'Default Alert Name',
        coin: selectedCoin ? {
            id: selectedCoin.id,
            name: selectedCoin.name,
            symbol: selectedCoin.symbol
        } : null,
        route,
        pair: pickerState?.selectedPairing,
        timeframe: pickerState?.selectedTimeframe,
        indicators: multiPickerState?.selectedOptions || []
    };
    const responseConfig = {
        text: '✅ Alert created successfully! Here are the final parameters:',
        parameters: parameters,
    };
    await (0, response_component_1.responseComponent)(ctx, responseConfig);
    await ctx.scene.leave();
}
exports.exampleWizard = new telegraf_1.Scenes.WizardScene('example-wizard', step1);
exports.exampleWizard.on('text', async (ctx) => {
    const wizardState = ctx.wizard.state;
    const step = wizardState.step;
    logger.log(`Received text input in step ${step}`);
    if (step === 2) {
        logger.log('Processing alert name input');
        const alertName = ctx.message.text;
        wizardState.parameters = {
            ...wizardState.parameters,
            alertName
        };
        logger.log(`Alert name set to: "${alertName}"`);
        return step3(ctx);
    }
    if (step === 3) {
        logger.log('Processing text input for coin search');
        try {
            const query = ctx.message.text;
            logger.log(`Search query: "${query}"`);
            const searchConfig = {
                promptText: '',
                fieldName: 'selectedCoin',
                confidenceThreshold: 2.5
            };
            const state = await coinSearchComponent.processSearch(ctx, query, searchConfig);
            wizardState.parameters = {
                ...wizardState.parameters,
                coinSearchState: state
            };
            if (state.selectedCoin) {
                logger.log(`High confidence match found: ${state.selectedCoin.name}`);
                wizardState.parameters.selectedCoin = state.selectedCoin;
                return step4(ctx);
            }
            logger.log('No high confidence match, showing results');
            return step3b(ctx);
        }
        catch (error) {
            logger.error(`Error processing search: ${error.message}`);
            await ctx.reply('An error occurred while searching. Please try again.');
            return step3(ctx);
        }
    }
});
(0, confirmation_component_1.registerConfirmationHandler)(exports.exampleWizard, 'create_alert_confirm', step8);
exports.exampleWizard.action('textinput_skip', async (ctx) => {
    const wizardState = ctx.wizard.state;
    if (wizardState.step !== 2)
        return;
    logger.log('Alert name input skipped');
    wizardState.parameters = {
        ...wizardState.parameters,
        alertName: ''
    };
    await ctx.answerCbQuery('Using default name');
    return step3(ctx);
});
exports.exampleWizard.action('picker_option_1', async (ctx) => {
    ctx.wizard.state.parameters = { ...ctx.wizard.state.parameters, picker: 'Option 1' };
    await ctx.toast('Selected Option 1');
    return step2(ctx);
});
exports.exampleWizard.action('picker_option_2', async (ctx) => {
    ctx.wizard.state.parameters = { ...ctx.wizard.state.parameters, picker: 'Option 2' };
    await ctx.toast('Selected Option 2');
    return step2(ctx);
});
exports.exampleWizard.action(/^cmbpicker_.+$/, async (ctx) => {
    const data = ctx.callbackQuery && 'data' in ctx.callbackQuery
        ? ctx.callbackQuery.data
        : undefined;
    if (!data)
        return;
    const currentState = ctx.wizard.state.parameters.pickerState || {
        selectedPairing: 'USD',
        selectedTimeframe: '1D'
    };
    const result = await combinedPickerHandler.handleCallback(ctx, data, currentState);
    ctx.wizard.state.parameters.pickerState = result.state;
    if (result.proceed) {
        return step5(ctx);
    }
    return step4(ctx);
});
exports.exampleWizard.action(/^multipicker_.+$/, async (ctx) => {
    const data = ctx.callbackQuery && 'data' in ctx.callbackQuery
        ? ctx.callbackQuery.data
        : undefined;
    if (!data)
        return;
    const currentState = ctx.wizard.state.parameters.multiPickerState || {
        selectedOptions: [],
        type: options_service_1.OptionsType.INDICATORS
    };
    const options = ctx.wizard.state.parameters.availableOptions || [];
    const limit = ctx.wizard.state.parameters.optionsLimit || 3;
    const result = await multiPickerHandler.handleCallback(ctx, data, currentState, options, limit);
    ctx.wizard.state.parameters.multiPickerState = result.state;
    if (result.proceed) {
        return step6(ctx);
    }
    if (result.redraw !== false) {
        return step5(ctx);
    }
});
exports.exampleWizard.action(/^coinsearch_select_\w+$/, async (ctx) => {
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
        return step4(ctx);
    }
    logger.error(`Coin not found with ID: ${coinId}`);
    await ctx.answerCbQuery('Error: Coin not found');
    return step3b(ctx);
});
exports.exampleWizard.action(/^coinsearch_next_\d+$/, async (ctx) => {
    logger.log('Next page action triggered');
    const state = ctx.wizard.state.parameters.coinSearchState;
    if (!state) {
        logger.error('Search state is missing');
        return step3(ctx);
    }
    state.page += 1;
    ctx.wizard.state.parameters.coinSearchState = state;
    await coinSearchComponent.showResults(ctx, state, 'coinsearch');
    await ctx.answerCbQuery();
});
exports.exampleWizard.action(/^coinsearch_prev_\d+$/, async (ctx) => {
    logger.log('Previous page action triggered');
    const state = ctx.wizard.state.parameters.coinSearchState;
    if (!state) {
        logger.error('Search state is missing');
        return step3(ctx);
    }
    state.page = Math.max(1, state.page - 1);
    ctx.wizard.state.parameters.coinSearchState = state;
    await coinSearchComponent.showResults(ctx, state, 'coinsearch');
    await ctx.answerCbQuery();
});
exports.exampleWizard.action('route_a', async (ctx) => {
    ctx.wizard.state.parameters = { ...ctx.wizard.state.parameters, route: 'Route A' };
    await ctx.toast('Route A chosen');
    return step7(ctx);
});
exports.exampleWizard.action('route_b', async (ctx) => {
    ctx.wizard.state.parameters = { ...ctx.wizard.state.parameters, route: 'Route B' };
    await ctx.toast('Route B chosen');
    return step7(ctx);
});
exports.exampleWizard.action('go_back', async (ctx) => {
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
        else if (wizardState.step === 4) {
            return step4(ctx);
        }
        else if (wizardState.step === 5) {
            return step5(ctx);
        }
        else if (wizardState.step === 6) {
            return step6(ctx);
        }
        else if (wizardState.step === 7) {
            return step7(ctx);
        }
    }
    else {
        await ctx.scene.leave();
        return (0, sub_menu_1.showSubMenu)(ctx);
    }
});
//# sourceMappingURL=example.wizard.js.map