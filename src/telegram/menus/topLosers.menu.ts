// src/telegram/menus/topLosers.menu.ts
import { Context, Markup } from 'telegraf';

export function sendTopLosersMenu(ctx: Context) {
    ctx.reply(
        'Top Losers Menu:',
        Markup.keyboard([
            ['📅 Daily Losers4.1'],
            ['📊 Weekly/Monthly Losers4.2'],
            ['🔙 Back']
        ])
        .oneTime()
        .resize()
    );
}
