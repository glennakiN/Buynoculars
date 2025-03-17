"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createGoBackButton = createGoBackButton;
const telegraf_1 = require("telegraf");
function createGoBackButton() {
    return telegraf_1.Markup.button.callback('← Go Back', 'go_back');
}
//# sourceMappingURL=buttons.constant.js.map