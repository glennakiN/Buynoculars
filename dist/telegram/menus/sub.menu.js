"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.showSubMenu = showSubMenu;
const telegraf_1 = require("telegraf");
function showSubMenu(ctx) {
    ctx.reply('Sub Menu:', telegraf_1.Markup.keyboard([
        ['🔍 Search'],
        ['📊 Statistics'],
        ['🔙 Back']
    ]).resize());
}
//# sourceMappingURL=sub.menu.js.map