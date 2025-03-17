"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.escapeMarkdown = escapeMarkdown;
function escapeMarkdown(text) {
    return text.replace(/([_*\[\]()~`>#+-=|{}.!])/g, '\\$1');
}
//# sourceMappingURL=escape-markdown.js.map