"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendWatchlistMenu = sendWatchlistMenu;
const telegraf_1 = require("telegraf");
function sendWatchlistMenu(ctx) {
    ctx.reply('Watchlist Menu:', telegraf_1.Markup.keyboard([
        ['🛠 Manage Watchlists1.1'],
        ['👀 View Watchlists1.2'],
        ['📊 Track Crypto1.3'],
        ['🔙 Back']
    ])
        .oneTime()
        .resize());
}
//# sourceMappingURL=watchlist.menu.js.map