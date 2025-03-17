"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendAlertsMenu = sendAlertsMenu;
const telegraf_1 = require("telegraf");
function sendAlertsMenu(ctx) {
    ctx.reply('Alerts Menu:', telegraf_1.Markup.keyboard([
        ['🆕 Create Alert2.1'],
        ['🔧 Manage Alerts2.2'],
        ['🔔 Notification Settings2.3'],
        ['🔙 Back']
    ])
        .oneTime()
        .resize());
}
//# sourceMappingURL=alerts.menu.js.map