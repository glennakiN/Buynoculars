"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMainMenu = sendMainMenu;
const telegraf_1 = require("telegraf");
function sendMainMenu(ctx) {
    ctx.reply('Main Menu:', telegraf_1.Markup.keyboard([
        ['📋 Watchlists'],
        ['⏰ Alerts'],
        ['📈 Top Gainers'],
        ['📉 Top Losers']
    ])
        .oneTime()
        .resize());
}
//# sourceMappingURL=main.menu.js.map