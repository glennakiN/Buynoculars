"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAlertWizard = void 0;
const telegraf_1 = require("telegraf");
const common_1 = require("@nestjs/common");
const picker_component_1 = require("../../components/picker.component/picker.component");
const confirmation_component_1 = require("../../components/confirmation.component");
const coin_search_component_1 = require("../../components/coin-search.component");
const coin_search_service_1 = require("../../services/coin-search.service");
const multi_picker_component_1 = require("../../components/multi-picker.component");
const pair_time_picker_component_1 = require("../../components/pair-time-picker.component");
const options_service_1 = require("../../services/options.service");
const alert_service_1 = require("../../services/alert.service");
const alerts_menu_1 = require("../../menus/alerts.menu");
const escape_markdown_1 = require("../../helpers/escape-markdown");
const logger = new common_1.Logger('CreateAlertWizard');
const confirmationComponent = new confirmation_component_1.ConfirmationComponent();
const coinSearchComponent = new coin_search_component_1.CoinSearchComponent(new coin_search_service_1.CoinSearchService());
const multiPicker = new multi_picker_component_1.MultiPickerComponent();
const multiPickerHandler = new multi_picker_component_1.MultiPickerCallbackHandler();
const combinedPicker = new pair_time_picker_component_1.PairTimePickerComponent();
const combinedPickerHandler = new pair_time_picker_component_1.PairTimePickerComponentCallbackHandler();
const optionsService = new options_service_1.OptionsService();
async function step1(ctx) {
    ctx.wizard.state.step = 1;
    logger.log('Entering step 1: Alert type selection');
    const alertService = ctx.alertService;
    const watchlistService = ctx.watchlistService;
    if (!alertService || !watchlistService) {
        logger.error('Services not properly injected into context');
        await ctx.reply('An error occurred. Please try again later.');
        await ctx.scene.leave();
        return (0, alerts_menu_1.sendAlertsMenu)(ctx);
    }
    const limits = alertService.getAlertsLimits();
    const pickerConfig = {
        text: '🔔 *Create New Alert*\n\nWould you like to set up an alert for a specific coin or an entire watchlist?',
        options: [
            { label: '💰 Specific Coin', action: 'alert_type_coin' },
            { label: '📋 Watchlist', action: 'alert_type_watchlist' },
        ],
    };
    await (0, picker_component_1.pickerComponent)(ctx, pickerConfig);
}
async function step3Coin(ctx) {
    ctx.wizard.state.step = 3;
    logger.log('Entering step 3: Coin search prompt');
    const searchConfig = {
        promptText: '🔍 *Search for a cryptocurrency:*\n\nPlease enter the name or symbol of the coin you want to track.',
        fieldName: 'selectedCoin',
        confidenceThreshold: 2.5,
        searchCallbackPrefix: 'alertcoinsearch'
    };
    await coinSearchComponent.prompt(ctx, searchConfig);
}
async function step3CoinResults(ctx) {
    logger.log('Entering step 3b: Showing coin search results');
    const searchState = ctx.wizard.state.parameters.coinSearchState;
    if (!searchState) {
        logger.error('Search state is missing, returning to search prompt');
        return step3Coin(ctx);
    }
    await coinSearchComponent.showResults(ctx, searchState, 'alertcoinsearch');
}
async function step3Watchlist(ctx) {
    ctx.wizard.state.step = 3;
    logger.log('Entering step 3: Watchlist selection');
    const watchlistService = ctx.watchlistService;
    if (!watchlistService) {
        logger.error('Watchlist service not properly injected');
        await ctx.reply('An error occurred. Please try again later.');
        await ctx.scene.leave();
        return (0, alerts_menu_1.sendAlertsMenu)(ctx);
    }
    try {
        const telegramId = ctx.from?.id.toString() || 'unknown';
        const isGroup = false;
        const watchlists = await watchlistService.getWatchlists(telegramId, isGroup);
        if (!watchlists || watchlists.length === 0) {
            await ctx.reply('You don\'t have any watchlists yet. Please create a watchlist first.');
            await ctx.scene.leave();
            return (0, alerts_menu_1.sendAlertsMenu)(ctx);
        }
        const options = watchlists.map(watchlist => ({
            label: `${watchlist.name} (${watchlist.coins.length} coins)`,
            action: `select_watchlist_${watchlist.id}`
        }));
        const pickerConfig = {
            text: '📋 *Select a Watchlist*\n\nChoose a watchlist to set up alerts for:',
            options
        };
        await (0, picker_component_1.pickerComponent)(ctx, pickerConfig);
    }
    catch (error) {
        logger.error(`Error fetching watchlists: ${error.message}`);
        await ctx.reply('An error occurred while fetching your watchlists. Please try again.');
        await ctx.scene.leave();
        return (0, alerts_menu_1.sendAlertsMenu)(ctx);
    }
}
async function step4(ctx) {
    ctx.wizard.state.step = 4;
    logger.log('Entering step 4: Notification type selection');
    const pickerConfig = {
        text: '📈 *Alert Type Selection*\n\nHow would you like to be notified?',
        options: [
            { label: '🌟 Horizon Score', action: 'notification_type_horizon' },
            { label: '📊 Indicators', action: 'notification_type_indicators' },
        ],
    };
    await (0, picker_component_1.pickerComponent)(ctx, pickerConfig);
}
async function step5Indicators(ctx) {
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
        const messageText = '📊 *Select Indicators*\n\nChoose up to 3 indicators for your alert:';
        const keyboard = multiPicker.render('alertmultipicker', ctx.wizard.state.parameters.multiPickerState, options, ctx.wizard.state.parameters.optionsLimit);
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
    catch (error) {
        logger.error(`Error fetching options: ${error.message}`);
        await ctx.reply('An error occurred. Please try again.');
        return step6(ctx);
    }
}
async function step6(ctx) {
    ctx.wizard.state.step = 6;
    logger.log('Entering step 6: Pair/timeframe picker');
    if (!ctx.wizard.state.parameters.pickerState) {
        ctx.wizard.state.parameters.pickerState = {
            selectedPairing: 'USD',
            selectedTimeframe: '1D'
        };
    }
    const messageText = '⏱️ *Select Currency Pair and Timeframe*\n\nChoose the trading pair and time interval for your alert:';
    const keyboard = combinedPicker.render('alertpicker', ctx.wizard.state.parameters.pickerState);
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
async function step7(ctx) {
    ctx.wizard.state.step = 7;
    logger.log('Entering step 7: Confirmation');
    const { alertType, pickerState, multiPickerState, notificationType } = ctx.wizard.state.parameters;
    let alertName = '';
    if (alertType === alert_service_1.AlertType.WATCHLIST) {
        const watchlist = ctx.wizard.state.parameters.selectedWatchlist;
        alertName = `${watchlist.name} Alert`;
    }
    else {
        const coin = ctx.wizard.state.parameters.selectedCoin;
        alertName = `${coin.name} (${coin.symbol}) Alert`;
    }
    ctx.wizard.state.parameters.alertName = alertName;
    const pair = pickerState?.selectedPairing || 'USD';
    const timeframe = pickerState?.selectedTimeframe || '1D';
    let targetInfo = '';
    if (alertType === alert_service_1.AlertType.WATCHLIST) {
        const watchlist = ctx.wizard.state.parameters.selectedWatchlist;
        targetInfo = `Watchlist: ${watchlist.name}`;
    }
    else {
        const coin = ctx.wizard.state.parameters.selectedCoin;
        targetInfo = `Coin: ${coin.name} (${coin.symbol})`;
    }
    let notificationInfo = '';
    if (notificationType === alert_service_1.AlertNotificationType.HORIZON_SCORE) {
        notificationInfo = 'Notification: Horizon Score';
    }
    else {
        const indicators = multiPickerState?.selectedOptions || [];
        notificationInfo = `Notification: Indicators\nIndicators: ${indicators.length > 0 ? indicators.join(', ') : 'None'}`;
    }
    const confirmationMessage = `
*Please confirm your alert settings:*

• Alert Name: ${(0, escape_markdown_1.escapeMarkdown)(alertName)}
• ${(0, escape_markdown_1.escapeMarkdown)(targetInfo)}
• ${(0, escape_markdown_1.escapeMarkdown)(notificationInfo)}
• Pair: ${(0, escape_markdown_1.escapeMarkdown)(pair)}
• Timeframe: ${(0, escape_markdown_1.escapeMarkdown)(timeframe)}

Are you sure you want to create this alert?
`;
    await confirmationComponent.prompt(ctx, {
        message: confirmationMessage,
        confirmButtonText: '✅ Create Alert',
        cancelButtonText: '← Go Back',
        confirmCallbackData: 'create_alert_confirm',
        parse_mode: 'Markdown'
    });
}
async function finalStep(ctx) {
    ctx.wizard.state.step = 8;
    logger.log('Entering final step: Creating alert');
    const alertService = ctx.alertService;
    if (!alertService) {
        logger.error('Alert service not properly injected');
        await ctx.reply('An error occurred. Please try again later.');
        await ctx.scene.leave();
        return (0, alerts_menu_1.sendAlertsMenu)(ctx);
    }
    const { alertType, alertName, notificationType, pickerState, multiPickerState } = ctx.wizard.state.parameters;
    const userId = ctx.from?.id.toString() || 'unknown';
    let targetId = '';
    let targetName = '';
    if (alertType === alert_service_1.AlertType.WATCHLIST) {
        const watchlist = ctx.wizard.state.parameters.selectedWatchlist;
        targetId = watchlist.id;
        targetName = watchlist.name;
    }
    else {
        const coin = ctx.wizard.state.parameters.selectedCoin;
        targetId = coin.id;
        targetName = `${coin.name} (${coin.symbol})`;
    }
    try {
        console.log("About to create alert");
        const newAlert = await alertService.createAlert({
            userId,
            name: alertName,
            type: alertType,
            targetId,
            targetName,
            notificationType,
            indicators: notificationType === alert_service_1.AlertNotificationType.INDIVIDUAL_INDICATORS
                ? multiPickerState?.selectedOptions || []
                : undefined,
            pairing: pickerState?.selectedPairing || 'USD',
            timeframe: pickerState?.selectedTimeframe || '1D',
            active: true
        });
        console.log("Alert created successfully:", newAlert);
        const responseText = `
    ✅ *Alert Successfully Created!*
    
    Your alert "${(0, escape_markdown_1.escapeMarkdown)(newAlert.name)}" has been set up and is now active. You will receive notifications based on your selected criteria.
    
    *Alert Details:*
    - ID: ${newAlert.id}
    - Target: ${(0, escape_markdown_1.escapeMarkdown)(newAlert.targetName)}
    - Timeframe: ${newAlert.timeframe}
    - Created: ${newAlert.createdAt.toLocaleString()}
    `;
        await ctx.reply(responseText);
        await ctx.scene.leave();
        return (0, alerts_menu_1.sendAlertsMenu)(ctx);
    }
    catch (error) {
        logger.error(`Error creating alert: ${error.message}`);
        await ctx.reply('An error occurred while creating your alert. Please try again.');
        await ctx.scene.leave();
        return (0, alerts_menu_1.sendAlertsMenu)(ctx);
    }
}
exports.createAlertWizard = new telegraf_1.Scenes.WizardScene('create-alert-wizard', step1);
exports.createAlertWizard.action(/^alertmultipicker_.+$/, async (ctx) => {
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
    const result = await multiPickerHandler.handleCallback(ctx, data.replace('alertmultipicker', 'multipicker'), currentState, options, limit);
    ctx.wizard.state.parameters.multiPickerState = result.state;
    if (result.proceed) {
        return step6(ctx);
    }
    if (result.redraw !== false) {
        return step5Indicators(ctx);
    }
});
exports.createAlertWizard.action(/^alertpicker_.+$/, async (ctx) => {
    const data = ctx.callbackQuery && 'data' in ctx.callbackQuery
        ? ctx.callbackQuery.data
        : undefined;
    if (!data)
        return;
    const currentState = ctx.wizard.state.parameters.pickerState || {
        selectedPairing: 'USD',
        selectedTimeframe: '1D'
    };
    const result = await combinedPickerHandler.handleCallback(ctx, data.replace('alertpicker', 'cmbpicker'), currentState);
    ctx.wizard.state.parameters.pickerState = result.state;
    if (result.proceed) {
        return step7(ctx);
    }
    return step6(ctx);
});
(0, confirmation_component_1.registerConfirmationHandler)(exports.createAlertWizard, 'create_alert_confirm', async (ctx) => {
    ctx.wizard.state.step = 8;
    logger.log('Entering final step: Creating alert');
    const alertService = ctx.alertService;
    if (!alertService) {
        logger.error('Alert service not properly injected');
        await ctx.reply('An error occurred. Please try again later.');
        await ctx.scene.leave();
        return (0, alerts_menu_1.sendAlertsMenu)(ctx);
    }
    const { alertType, alertName, notificationType, pickerState, multiPickerState } = ctx.wizard.state.parameters;
    const userId = ctx.from?.id.toString() || 'unknown';
    let targetId = '';
    let targetName = '';
    if (alertType === alert_service_1.AlertType.WATCHLIST) {
        const watchlist = ctx.wizard.state.parameters.selectedWatchlist;
        targetId = watchlist.id;
        targetName = watchlist.name;
    }
    else {
        const coin = ctx.wizard.state.parameters.selectedCoin;
        targetId = coin.id;
        targetName = `${coin.name} (${coin.symbol})`;
    }
    try {
        logger.log(`Creating alert with service: ${!!alertService}`);
        const newAlert = await alertService.createAlert({
            userId,
            name: alertName,
            type: alertType,
            targetId,
            targetName,
            notificationType,
            indicators: notificationType === alert_service_1.AlertNotificationType.INDIVIDUAL_INDICATORS
                ? multiPickerState?.selectedOptions || []
                : undefined,
            pairing: pickerState?.selectedPairing || 'USD',
            timeframe: pickerState?.selectedTimeframe || '1D',
            active: true
        });
        const responseText = `
✅ Alert Successfully Created!

Your alert "${(0, escape_markdown_1.escapeMarkdown)(newAlert.name)}" has been set up and is now active. You will receive notifications based on your selected criteria.

Alert Details:
- ID: ${newAlert.id}
- Target: ${(0, escape_markdown_1.escapeMarkdown)(newAlert.targetName)}
- Timeframe: ${newAlert.timeframe}
- Created: ${newAlert.createdAt.toLocaleString()}
    `;
        await ctx.reply(responseText);
        await ctx.scene.leave();
        return (0, alerts_menu_1.sendAlertsMenu)(ctx);
    }
    catch (error) {
        logger.error(`Error creating alert: ${error.message}`);
        await ctx.reply('An error occurred while creating your alert. Please try again.');
        await ctx.scene.leave();
        return (0, alerts_menu_1.sendAlertsMenu)(ctx);
    }
});
exports.createAlertWizard.use((ctx, next) => {
    const alertService = ctx.alertService;
    const watchlistService = ctx.watchlistService;
    if (!alertService) {
        logger.warn('Alert service missing in wizard middleware');
        if (ctx.session.alertService) {
            logger.log('Restoring alertService from session in wizard middleware');
            ctx.alertService = ctx.session.alertService;
        }
    }
    if (!watchlistService) {
        logger.warn('Watchlist service missing in wizard middleware');
        if (ctx.session.watchlistService) {
            logger.log('Restoring watchlistService from session in wizard middleware');
            ctx.watchlistService = ctx.session.watchlistService;
        }
    }
    return next();
});
exports.createAlertWizard.action('go_back', async (ctx) => {
    const wizardState = ctx.wizard.state;
    if (wizardState.step && wizardState.step > 1) {
        let previousStep = wizardState.step - 1;
        wizardState.step = previousStep;
        logger.log(`Going back to step ${previousStep}`);
        switch (previousStep) {
            case 1:
                return step1(ctx);
            case 3:
                if (wizardState.parameters.alertType === alert_service_1.AlertType.WATCHLIST) {
                    return step3Watchlist(ctx);
                }
                else {
                    return step3Coin(ctx);
                }
            case 4:
                return step4(ctx);
            case 5:
                if (wizardState.parameters.notificationType === alert_service_1.AlertNotificationType.INDIVIDUAL_INDICATORS) {
                    return step5Indicators(ctx);
                }
                else {
                    return step4(ctx);
                }
            case 6:
                return step6(ctx);
            default:
                return step1(ctx);
        }
    }
    else {
        await ctx.answerCbQuery('Returning to menu');
        await ctx.scene.leave();
        return (0, alerts_menu_1.sendAlertsMenu)(ctx);
    }
});
exports.createAlertWizard.action('alert_type_coin', async (ctx) => {
    ctx.wizard.state.parameters = {
        ...ctx.wizard.state.parameters,
        alertType: alert_service_1.AlertType.DISCOVERY
    };
    await ctx.answerCbQuery('Selected: Specific Coin');
    return step3Coin(ctx);
});
exports.createAlertWizard.action('alert_type_watchlist', async (ctx) => {
    ctx.wizard.state.parameters = {
        ...ctx.wizard.state.parameters,
        alertType: alert_service_1.AlertType.WATCHLIST
    };
    await ctx.answerCbQuery('Selected: Watchlist');
    return step3Watchlist(ctx);
});
exports.createAlertWizard.on('text', async (ctx) => {
    const wizardState = ctx.wizard.state;
    const step = wizardState.step;
    if (step === 3 && wizardState.parameters.alertType !== alert_service_1.AlertType.WATCHLIST) {
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
            return step3CoinResults(ctx);
        }
        catch (error) {
            logger.error(`Error processing search: ${error.message}`);
            await ctx.reply('An error occurred while searching. Please try again.');
            return step3Coin(ctx);
        }
    }
});
exports.createAlertWizard.action(/^select_watchlist_(.+)$/, async (ctx) => {
    const callbackData = ctx.callbackQuery && 'data' in ctx.callbackQuery
        ? ctx.callbackQuery.data
        : '';
    const watchlistId = callbackData.split('_').pop();
    logger.log(`Selected watchlist ID: ${watchlistId}`);
    const watchlistService = ctx.watchlistService;
    if (!watchlistService) {
        logger.error('Watchlist service not properly injected');
        await ctx.answerCbQuery('Service error. Please try again.');
        await ctx.scene.leave();
        return (0, alerts_menu_1.sendAlertsMenu)(ctx);
    }
    try {
        const watchlist = await watchlistService.getWatchlistById(watchlistId);
        if (!watchlist) {
            logger.error(`Watchlist not found with ID: ${watchlistId}`);
            await ctx.answerCbQuery('Error: Watchlist not found');
            return step3Watchlist(ctx);
        }
        ctx.wizard.state.parameters.selectedWatchlist = watchlist;
        await ctx.answerCbQuery(`Selected watchlist: ${watchlist.name}`);
        return step4(ctx);
    }
    catch (error) {
        logger.error(`Error getting watchlist: ${error.message}`);
        await ctx.answerCbQuery('Error retrieving watchlist');
        return step3Watchlist(ctx);
    }
});
exports.createAlertWizard.action(/^alertcoinsearch_select_\w+$/, async (ctx) => {
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
    return step3CoinResults(ctx);
});
exports.createAlertWizard.action(/^alertcoinsearch_next_\d+$/, async (ctx) => {
    logger.log('Next page action triggered');
    const state = ctx.wizard.state.parameters.coinSearchState;
    if (!state) {
        logger.error('Search state is missing');
        return step3Coin(ctx);
    }
    state.page += 1;
    ctx.wizard.state.parameters.coinSearchState = state;
    await coinSearchComponent.showResults(ctx, state, 'alertcoinsearch');
    await ctx.answerCbQuery();
});
exports.createAlertWizard.action(/^alertcoinsearch_prev_\d+$/, async (ctx) => {
    logger.log('Previous page action triggered');
    const state = ctx.wizard.state.parameters.coinSearchState;
    if (!state) {
        logger.error('Search state is missing');
        return step3Coin(ctx);
    }
    state.page = Math.max(1, state.page - 1);
    ctx.wizard.state.parameters.coinSearchState = state;
    await coinSearchComponent.showResults(ctx, state, 'alertcoinsearch');
    await ctx.answerCbQuery();
});
exports.createAlertWizard.action('notification_type_horizon', async (ctx) => {
    ctx.wizard.state.parameters = {
        ...ctx.wizard.state.parameters,
        notificationType: alert_service_1.AlertNotificationType.HORIZON_SCORE
    };
    await ctx.answerCbQuery('Selected: Horizon Score');
    return step6(ctx);
});
exports.createAlertWizard.action('notification_type_indicators', async (ctx) => {
    ctx.wizard.state.parameters = {
        ...ctx.wizard.state.parameters,
        notificationType: alert_service_1.AlertNotificationType.INDIVIDUAL_INDICATORS
    };
    await ctx.answerCbQuery('Selected: Indicators');
    return step5Indicators(ctx);
});
//# sourceMappingURL=create-alert.wizard.js.map