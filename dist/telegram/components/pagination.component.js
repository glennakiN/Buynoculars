"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var PaginationComponent_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaginationComponent = void 0;
exports.registerPaginationHandlers = registerPaginationHandlers;
exports.paginateData = paginateData;
const common_1 = require("@nestjs/common");
const telegraf_1 = require("telegraf");
let PaginationComponent = PaginationComponent_1 = class PaginationComponent {
    logger = new common_1.Logger(PaginationComponent_1.name);
    render(prefix, currentPage, totalPages) {
        const buttons = [];
        if (totalPages <= 1) {
            return buttons;
        }
        if (currentPage > 1) {
            buttons.push(telegraf_1.Markup.button.callback('« Previous', `${prefix}_page_${currentPage - 1}`));
        }
        buttons.push(telegraf_1.Markup.button.callback(`Page ${currentPage}/${totalPages}`, `${prefix}_page_current`));
        if (currentPage < totalPages) {
            buttons.push(telegraf_1.Markup.button.callback('Next »', `${prefix}_page_${currentPage + 1}`));
        }
        return buttons;
    }
    generateButtons(config) {
        try {
            const { totalItems, itemsPerPage, currentPage, callbackPrefix, showCounts = true, maxPageButtons = 5 } = config;
            const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
            const validCurrentPage = Math.max(1, Math.min(currentPage, totalPages));
            this.logger.log(`Generating pagination: page ${validCurrentPage}/${totalPages} (${totalItems} items)`);
            const buttons = [];
            if (totalPages <= 1) {
                return buttons;
            }
            const navigationRow = [];
            if (validCurrentPage > 1) {
                navigationRow.push(telegraf_1.Markup.button.callback('« Previous', `${callbackPrefix}_page_${validCurrentPage - 1}`));
            }
            if (config.currentPageLabel) {
                navigationRow.push(telegraf_1.Markup.button.callback(config.currentPageLabel, `${callbackPrefix}_page_current`));
            }
            else {
                const countInfo = showCounts
                    ? ` (${(validCurrentPage - 1) * itemsPerPage + 1}-${Math.min(validCurrentPage * itemsPerPage, totalItems)}/${totalItems})`
                    : '';
                navigationRow.push(telegraf_1.Markup.button.callback(`Page ${validCurrentPage}/${totalPages}${countInfo}`, `${callbackPrefix}_page_current`));
            }
            if (validCurrentPage < totalPages) {
                navigationRow.push(telegraf_1.Markup.button.callback('Next »', `${callbackPrefix}_page_${validCurrentPage + 1}`));
            }
            buttons.push(navigationRow);
            if (totalPages > 3 && maxPageButtons > 0) {
                const pageButtons = [];
                let startPage = Math.max(1, validCurrentPage - Math.floor(maxPageButtons / 2));
                let endPage = startPage + maxPageButtons - 1;
                if (endPage > totalPages) {
                    endPage = totalPages;
                    startPage = Math.max(1, endPage - maxPageButtons + 1);
                }
                if (startPage > 1) {
                    pageButtons.push(telegraf_1.Markup.button.callback('1', `${callbackPrefix}_page_1`));
                    if (startPage > 2) {
                        pageButtons.push(telegraf_1.Markup.button.callback('...', `${callbackPrefix}_page_ellipsis_start`));
                    }
                }
                for (let i = startPage; i <= endPage; i++) {
                    pageButtons.push(telegraf_1.Markup.button.callback(i === validCurrentPage ? `[${i}]` : `${i}`, `${callbackPrefix}_page_${i}`));
                }
                if (endPage < totalPages) {
                    if (endPage < totalPages - 1) {
                        pageButtons.push(telegraf_1.Markup.button.callback('...', `${callbackPrefix}_page_ellipsis_end`));
                    }
                    pageButtons.push(telegraf_1.Markup.button.callback(`${totalPages}`, `${callbackPrefix}_page_${totalPages}`));
                }
                const maxButtonsPerRow = 5;
                for (let i = 0; i < pageButtons.length; i += maxButtonsPerRow) {
                    buttons.push(pageButtons.slice(i, i + maxButtonsPerRow));
                }
            }
            return buttons;
        }
        catch (error) {
            this.logger.error(`Error generating pagination buttons: ${error.message}`);
            return [];
        }
    }
    addToKeyboard(keyboard, config) {
        const paginationButtons = this.generateButtons(config);
        return [...keyboard, ...paginationButtons];
    }
    createKeyboard(config) {
        const buttons = this.generateButtons(config);
        return telegraf_1.Markup.inlineKeyboard(buttons);
    }
};
exports.PaginationComponent = PaginationComponent;
exports.PaginationComponent = PaginationComponent = PaginationComponent_1 = __decorate([
    (0, common_1.Injectable)()
], PaginationComponent);
function registerPaginationHandlers(scene, callbackPrefix, onPageChange) {
    const logger = new common_1.Logger('PaginationHandlers');
    scene.action(new RegExp(`^${callbackPrefix}_page_(\\d+)$`), async (ctx) => {
        try {
            const match = new RegExp(`^${callbackPrefix}_page_(\\d+)$`).exec(ctx.callbackQuery && 'data' in ctx.callbackQuery ? ctx.callbackQuery.data : '');
            if (!match)
                return;
            const page = parseInt(match[1], 10);
            logger.log(`Pagination: navigating to page ${page}`);
            await onPageChange(ctx, page);
            await ctx.answerCbQuery();
        }
        catch (error) {
            logger.error(`Error handling pagination: ${error.message}`);
            await ctx.answerCbQuery('Error changing page');
        }
    });
    scene.action(`${callbackPrefix}_page_current`, async (ctx) => {
        await ctx.answerCbQuery();
    });
    scene.action(`${callbackPrefix}_page_ellipsis_start`, async (ctx) => {
        await ctx.answerCbQuery();
    });
    scene.action(`${callbackPrefix}_page_ellipsis_end`, async (ctx) => {
        await ctx.answerCbQuery();
    });
    scene.action(new RegExp(`^${callbackPrefix}_prev_(\\d+)$`), async (ctx) => {
        try {
            const match = new RegExp(`^${callbackPrefix}_prev_(\\d+)$`).exec(ctx.callbackQuery && 'data' in ctx.callbackQuery ? ctx.callbackQuery.data : '');
            if (!match)
                return;
            const currentPage = parseInt(match[1], 10);
            const prevPage = currentPage - 1;
            logger.log(`Pagination: navigating to previous page ${prevPage}`);
            await onPageChange(ctx, prevPage);
            await ctx.answerCbQuery();
        }
        catch (error) {
            logger.error(`Error handling pagination: ${error.message}`);
            await ctx.answerCbQuery('Error changing page');
        }
    });
    scene.action(new RegExp(`^${callbackPrefix}_next_(\\d+)$`), async (ctx) => {
        try {
            const match = new RegExp(`^${callbackPrefix}_next_(\\d+)$`).exec(ctx.callbackQuery && 'data' in ctx.callbackQuery ? ctx.callbackQuery.data : '');
            if (!match)
                return;
            const currentPage = parseInt(match[1], 10);
            const nextPage = currentPage + 1;
            logger.log(`Pagination: navigating to next page ${nextPage}`);
            await onPageChange(ctx, nextPage);
            await ctx.answerCbQuery();
        }
        catch (error) {
            logger.error(`Error handling pagination: ${error.message}`);
            await ctx.answerCbQuery('Error changing page');
        }
    });
}
function paginateData(data, page = 1, itemsPerPage = 5) {
    const totalItems = data.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const validPage = Math.max(1, Math.min(page, totalPages));
    const startIndex = (validPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    return {
        items: data.slice(startIndex, endIndex),
        pagination: {
            currentPage: validPage,
            itemsPerPage,
            totalItems
        }
    };
}
//# sourceMappingURL=pagination.component.js.map