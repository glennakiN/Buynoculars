// src/telegram/menus/main.menu.ts
import { Context, Markup } from 'telegraf';

export function sendMainMenu(ctx: Context) {
    ctx.reply(
        'Main Menu:',
        Markup.keyboard([
            ['📋 Watchlists'],
            ['⏰ Alerts'],
            ['📈 Top Gainers'],
            ['📉 Top Losers']
        ])
        .oneTime()
        .resize()
    );
}
