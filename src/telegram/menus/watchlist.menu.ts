// src/telegram/menus/watchlist.menu.ts
import { Context, Markup } from 'telegraf';

export function sendWatchlistMenu(ctx: Context) {
    ctx.reply(
        'Watchlist Menu:',
        Markup.keyboard([
            ['🛠 Manage Watchlists1.1'],
            ['👀 View Watchlists1.2'],
            ['📊 Track Crypto1.3'],
            ['🔙 Back']
        ])
        .oneTime()
        .resize()
    );
}