// src/telegram/menus/sub.menu.ts
import { Context, Markup } from 'telegraf';

export function showSubMenu(ctx: Context) {
    ctx.reply('Sub Menu:', Markup.keyboard([
        ['🔍 Search'],
        ['📊 Statistics'],
        ['🔙 Back']
    ]).resize());
}
