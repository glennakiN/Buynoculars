"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendTopGainersMenu = sendTopGainersMenu;
const telegraf_1 = require("telegraf");
function sendTopGainersMenu(ctx) {
    ctx.reply('Top Gainers Menu:', telegraf_1.Markup.keyboard([
        ['📅 Daily Gainers3.1'],
        ['📊 Weekly/Monthly Gainers3.2'],
        ['ℹ️ Details3.3'],
        ['🔙 Back']
    ])
        .oneTime()
        .resize());
}
//# sourceMappingURL=topGainers.menu.js.map