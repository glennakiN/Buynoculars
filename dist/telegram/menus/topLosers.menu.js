"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendTopLosersMenu = sendTopLosersMenu;
const telegraf_1 = require("telegraf");
function sendTopLosersMenu(ctx) {
    ctx.reply('Top Losers Menu:', telegraf_1.Markup.keyboard([
        ['📅 Daily Losers4.1'],
        ['📊 Weekly/Monthly Losers4.2'],
        ['🔙 Back']
    ])
        .oneTime()
        .resize());
}
//# sourceMappingURL=topLosers.menu.js.map