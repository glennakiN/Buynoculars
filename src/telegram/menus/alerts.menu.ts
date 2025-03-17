// src/telegram/menus/alerts.menu.ts
import { Context, Markup } from 'telegraf';

export function sendAlertsMenu(ctx: Context) {
    ctx.reply(
        'Alerts Menu:',
        Markup.keyboard([
            ['🆕 Create Alert2.1'],
            ['🔧 Manage Alerts2.2'],
            ['🔔 Notification Settings2.3'],
            ['🔙 Back']
        ])
        .oneTime()
        .resize()
    );
}
