// src/telegram/menus/topGainers.menu.ts
import { Context, Markup } from 'telegraf';

export function sendTopGainersMenu(ctx: Context) {
    ctx.reply(
        'Top Gainers Menu:',
        Markup.keyboard([
            ['📅 Daily Gainers3.1'],
            ['📊 Weekly/Monthly Gainers3.2'],
            ['ℹ️ Details3.3'],
            ['🔙 Back']
        ])
        .oneTime()
        .resize()
    );
}
