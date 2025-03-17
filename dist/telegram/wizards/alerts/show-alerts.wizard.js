"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.showAllAlertsWizard = void 0;
const telegraf_1 = require("telegraf");
const common_1 = require("@nestjs/common");
const telegraf_2 = require("telegraf");
const buttons_constant_1 = require("../../constants/buttons.constant");
const alert_service_1 = require("../../services/alert.service");
const pagination_component_1 = require("../../components/pagination.component");
const watchlist_menu_1 = require("../../menus/watchlist.menu");
const logger = new common_1.Logger('ShowAllAlertsWizard');
const paginationComponent = new pagination_component_1.PaginationComponent();
async function step1(ctx) {
    ctx.wizard.state.step = 1;
    logger.log('Entering step 1: Show alerts list');
    const alertService = ctx.alertService;
    if (!alertService) {
        logger.error('Alert service not properly injected');
        await ctx.reply('An error occurred. Please try again later.');
        await ctx.scene.leave();
        return (0, watchlist_menu_1.sendWatchlistMenu)(ctx);
    }
    try {
        const userId = ctx.from?.id.toString() || 'unknown';
        logger.log(`Getting alerts for user: ${userId}`);
        const alerts = await alertService.getAlerts(userId);
        if (!alerts || alerts.length === 0) {
            const messageText = `
🔔 *My Alerts*

You don't have any alerts set up yet. 

To create a new alert, return to the Alerts Menu and select "New Alert".
      `;
            const keyboard = telegraf_2.Markup.inlineKeyboard([
                [(0, buttons_constant_1.createGoBackButton)()]
            ]);
            await ctx.reply(messageText, {
                reply_markup: keyboard.reply_markup,
                parse_mode: 'Markdown'
            });
            return;
        }
        ctx.wizard.state.parameters = {
            ...ctx.wizard.state.parameters,
            alerts,
            currentPage: 1
        };
        await showAlertsPage(ctx);
    }
    catch (error) {
        logger.error(`Error fetching alerts: ${error.message}`);
        await ctx.reply('An error occurred while fetching your alerts. Please try again.');
        await ctx.scene.leave();
        return (0, watchlist_menu_1.sendWatchlistMenu)(ctx);
    }
}
async function showAlertsPage(ctx) {
    const { alerts, currentPage } = ctx.wizard.state.parameters;
    const itemsPerPage = 5;
    const totalPages = Math.ceil(alerts.length / itemsPerPage);
    const startIdx = (currentPage - 1) * itemsPerPage;
    const pageAlerts = alerts.slice(startIdx, startIdx + itemsPerPage);
    let messageText = `🔔 *My Alerts* (${alerts.length} total)\n\n`;
    pageAlerts.forEach((alert, idx) => {
        const typeEmoji = alert.type === alert_service_1.AlertType.WATCHLIST ? '📋' : '💰';
        const statusEmoji = alert.active ? '✅' : '❌';
        messageText += `${idx + 1 + startIdx}. ${typeEmoji} *${alert.name}*\n`;
        messageText += `   Target: ${alert.targetName}\n`;
        messageText += `   Timeframe: ${alert.pairing}/${alert.timeframe}\n`;
        messageText += `   Status: ${statusEmoji} ${alert.active ? 'Active' : 'Inactive'}\n\n`;
    });
    const alertButtons = pageAlerts.map((alert, idx) => [
        telegraf_2.Markup.button.callback(`${idx + 1 + startIdx}. ${alert.name}`, `view_alert_${alert.id}`)
    ]);
    const paginationRow = paginationComponent.render('alert_page', currentPage, totalPages);
    const buttons = [
        ...alertButtons,
        paginationRow,
        [(0, buttons_constant_1.createGoBackButton)()]
    ];
    const keyboard = telegraf_2.Markup.inlineKeyboard(buttons);
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
async function showAlertDetails(ctx, alertId) {
    ctx.wizard.state.step = 2;
    logger.log(`Showing details for alert: ${alertId}`);
    const alertService = ctx.alertService;
    if (!alertService) {
        logger.error('Alert service not properly injected');
        await ctx.reply('An error occurred. Please try again later.');
        await ctx.scene.leave();
        return (0, watchlist_menu_1.sendWatchlistMenu)(ctx);
    }
    try {
        const userId = ctx.from?.id.toString() || 'unknown';
        const alerts = await alertService.getAlerts(userId);
        const alert = alerts.find(a => a.id === alertId);
        if (!alert) {
            await ctx.reply('Alert not found. It may have been deleted.');
            return step1(ctx);
        }
        ctx.wizard.state.parameters.selectedAlert = alert;
        const typeEmoji = alert.type === alert_service_1.AlertType.WATCHLIST ? '📋' : '💰';
        const statusEmoji = alert.active ? '✅' : '❌';
        let alertDetails = `
🔔 *Alert Details*

*${alert.name}*
${typeEmoji} Type: ${alert.type === alert_service_1.AlertType.WATCHLIST ? 'Watchlist' : 'Specific Coin'}
🎯 Target: ${alert.targetName}
💱 Pair: ${alert.pairing}
⏱️ Timeframe: ${alert.timeframe}
🔄 Status: ${statusEmoji} ${alert.active ? 'Active' : 'Inactive'}
📅 Created: ${alert.createdAt.toLocaleString()}
    `;
        if (alert.indicators && alert.indicators.length > 0) {
            alertDetails += `\n📊 *Indicators:* ${alert.indicators.join(', ')}`;
        }
        else {
            alertDetails += `\n🌟 *Notification:* Horizon Score Flip`;
        }
        const buttons = [
            [
                telegraf_2.Markup.button.callback(alert.active ? '❌ Disable Alert' : '✅ Enable Alert', `toggle_alert_${alert.id}`),
                telegraf_2.Markup.button.callback('🗑️ Delete Alert', `confirm_delete_alert_${alert.id}`)
            ],
            [
                telegraf_2.Markup.button.callback('← Back to Alerts', 'back_to_alerts_list')
            ]
        ];
        const keyboard = telegraf_2.Markup.inlineKeyboard(buttons);
        if (ctx.callbackQuery) {
            try {
                await ctx.editMessageText(alertDetails, {
                    reply_markup: keyboard.reply_markup,
                    parse_mode: 'Markdown'
                });
            }
            catch (error) {
                await ctx.reply(alertDetails, {
                    reply_markup: keyboard.reply_markup,
                    parse_mode: 'Markdown'
                });
            }
        }
        else {
            await ctx.reply(alertDetails, {
                reply_markup: keyboard.reply_markup,
                parse_mode: 'Markdown'
            });
        }
    }
    catch (error) {
        logger.error(`Error fetching alert details: ${error.message}`);
        await ctx.reply('An error occurred while fetching alert details. Please try again.');
        return step1(ctx);
    }
}
async function confirmDeleteAlert(ctx, alertId) {
    ctx.wizard.state.step = 3;
    logger.log(`Confirming deletion for alert: ${alertId}`);
    const alert = ctx.wizard.state.parameters.selectedAlert;
    if (!alert) {
        await ctx.reply('Alert not found. It may have been deleted.');
        return step1(ctx);
    }
    const confirmationMessage = `
⚠️ *Confirm Deletion*

Are you sure you want to delete the alert:
*${alert.name}*?

This action cannot be undone.
  `;
    const buttons = [
        [
            telegraf_2.Markup.button.callback('🗑️ Yes, Delete', `delete_alert_${alertId}`),
            telegraf_2.Markup.button.callback('❌ No, Cancel', `view_alert_${alertId}`)
        ]
    ];
    const keyboard = telegraf_2.Markup.inlineKeyboard(buttons);
    if (ctx.callbackQuery) {
        try {
            await ctx.editMessageText(confirmationMessage, {
                reply_markup: keyboard.reply_markup,
                parse_mode: 'Markdown'
            });
        }
        catch (error) {
            await ctx.reply(confirmationMessage, {
                reply_markup: keyboard.reply_markup,
                parse_mode: 'Markdown'
            });
        }
    }
    else {
        await ctx.reply(confirmationMessage, {
            reply_markup: keyboard.reply_markup,
            parse_mode: 'Markdown'
        });
    }
}
exports.showAllAlertsWizard = new telegraf_1.Scenes.WizardScene('show-all-alerts-wizard', step1);
exports.showAllAlertsWizard.action(/^alert_page_prev_\d+$/, async (ctx) => {
    logger.log('Previous page action triggered');
    const currentPage = ctx.wizard.state.parameters.currentPage || 1;
    ctx.wizard.state.parameters.currentPage = Math.max(1, currentPage - 1);
    await showAlertsPage(ctx);
    await ctx.answerCbQuery();
});
exports.showAllAlertsWizard.action(/^alert_page_next_\d+$/, async (ctx) => {
    logger.log('Next page action triggered');
    const currentPage = ctx.wizard.state.parameters.currentPage || 1;
    const alerts = ctx.wizard.state.parameters.alerts || [];
    const itemsPerPage = 5;
    const totalPages = Math.ceil(alerts.length / itemsPerPage);
    ctx.wizard.state.parameters.currentPage = Math.min(totalPages, currentPage + 1);
    await showAlertsPage(ctx);
    await ctx.answerCbQuery();
});
exports.showAllAlertsWizard.action(/^view_alert_(\w+)$/, async (ctx) => {
    const callbackData = ctx.callbackQuery && 'data' in ctx.callbackQuery
        ? ctx.callbackQuery.data
        : '';
    const alertId = callbackData.split('_').pop();
    logger.log(`View alert action triggered for alert: ${alertId}`);
    await ctx.answerCbQuery();
    return showAlertDetails(ctx, alertId);
});
exports.showAllAlertsWizard.action(/^toggle_alert_(\w+)$/, async (ctx) => {
    const callbackData = ctx.callbackQuery && 'data' in ctx.callbackQuery
        ? ctx.callbackQuery.data
        : '';
    const alertId = callbackData.split('_').pop();
    logger.log(`Toggle alert status triggered for alert: ${alertId}`);
    const alertService = ctx.alertService;
    if (!alertService) {
        logger.error('Alert service not properly injected');
        await ctx.answerCbQuery('Service error. Please try again.');
        await ctx.scene.leave();
        return (0, watchlist_menu_1.sendWatchlistMenu)(ctx);
    }
    try {
        const updatedAlert = await alertService.toggleAlertStatus(alertId);
        if (!updatedAlert) {
            await ctx.answerCbQuery('Error: Alert not found');
            return step1(ctx);
        }
        ctx.wizard.state.parameters.selectedAlert = updatedAlert;
        await ctx.answerCbQuery(`Alert ${updatedAlert.active ? 'enabled' : 'disabled'}`);
        return showAlertDetails(ctx, alertId);
    }
    catch (error) {
        logger.error(`Error toggling alert status: ${error.message}`);
        await ctx.answerCbQuery('Error updating alert');
        return showAlertDetails(ctx, alertId);
    }
});
exports.showAllAlertsWizard.action(/^confirm_delete_alert_(\w+)$/, async (ctx) => {
    const callbackData = ctx.callbackQuery && 'data' in ctx.callbackQuery
        ? ctx.callbackQuery.data
        : '';
    const alertId = callbackData.split('_').pop();
    logger.log(`Confirm delete alert triggered for alert: ${alertId}`);
    await ctx.answerCbQuery();
    return confirmDeleteAlert(ctx, alertId);
});
exports.showAllAlertsWizard.action(/^delete_alert_(\w+)$/, async (ctx) => {
    const callbackData = ctx.callbackQuery && 'data' in ctx.callbackQuery
        ? ctx.callbackQuery.data
        : '';
    const alertId = callbackData.split('_').pop();
    logger.log(`Delete alert triggered for alert: ${alertId}`);
    const alertService = ctx.alertService;
    if (!alertService) {
        logger.error('Alert service not properly injected');
        await ctx.answerCbQuery('Service error. Please try again.');
        await ctx.scene.leave();
        return (0, watchlist_menu_1.sendWatchlistMenu)(ctx);
    }
    try {
        const success = await alertService.deleteAlert(alertId);
        if (!success) {
            await ctx.answerCbQuery('Error: Alert not found');
            return step1(ctx);
        }
        await ctx.answerCbQuery('Alert deleted successfully');
        const userId = ctx.from?.id.toString() || 'unknown';
        const alerts = await alertService.getAlerts(userId);
        ctx.wizard.state.parameters = {
            ...ctx.wizard.state.parameters,
            alerts,
            currentPage: 1,
            selectedAlert: null
        };
        return step1(ctx);
    }
    catch (error) {
        logger.error(`Error deleting alert: ${error.message}`);
        await ctx.answerCbQuery('Error deleting alert');
        return showAlertDetails(ctx, alertId);
    }
});
exports.showAllAlertsWizard.action('back_to_alerts_list', async (ctx) => {
    logger.log('Back to alerts list action triggered');
    await ctx.answerCbQuery();
    return step1(ctx);
});
exports.showAllAlertsWizard.action('go_back', async (ctx) => {
    logger.log('Go back to menu action triggered');
    await ctx.answerCbQuery('Returning to menu');
    await ctx.scene.leave();
    return (0, watchlist_menu_1.sendWatchlistMenu)(ctx);
});
//# sourceMappingURL=show-alerts.wizard.js.map