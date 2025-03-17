"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var CoinSearchComponent_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoinSearchComponent = void 0;
exports.createCoinSearchHandler = createCoinSearchHandler;
const common_1 = require("@nestjs/common");
const telegraf_1 = require("telegraf");
const buttons_constant_1 = require("../constants/buttons.constant");
const coin_search_service_1 = require("../services/coin-search.service");
let CoinSearchComponent = CoinSearchComponent_1 = class CoinSearchComponent {
    coinSearchService;
    logger = new common_1.Logger(CoinSearchComponent_1.name);
    constructor(coinSearchService) {
        this.coinSearchService = coinSearchService;
    }
    async prompt(ctx, config) {
        const { promptText } = config;
        const buttons = [
            [(0, buttons_constant_1.createGoBackButton)()]
        ];
        const keyboard = telegraf_1.Markup.inlineKeyboard(buttons);
        if (ctx.callbackQuery) {
            try {
                await ctx.editMessageText(promptText, {
                    reply_markup: keyboard.reply_markup,
                    parse_mode: 'Markdown',
                });
            }
            catch (error) {
                await ctx.reply(promptText, {
                    reply_markup: keyboard.reply_markup,
                    parse_mode: 'Markdown',
                });
            }
        }
        else {
            await ctx.reply(promptText, {
                reply_markup: keyboard.reply_markup,
                parse_mode: 'Markdown',
            });
        }
        this.logger.log(`Prompted user for coin search: ${promptText}`);
    }
    async showResults(ctx, state, prefix = 'coinsearch') {
        if (!state.results || state.results.length === 0) {
            const noResultsText = `
*No results found for "${state.searchQuery}"*

Please try another search term.
      `;
            const keyboard = telegraf_1.Markup.inlineKeyboard([
                [(0, buttons_constant_1.createGoBackButton)()]
            ]);
            if (ctx.callbackQuery) {
                try {
                    await ctx.editMessageText(noResultsText, {
                        reply_markup: keyboard.reply_markup,
                        parse_mode: 'Markdown',
                    });
                }
                catch (error) {
                    await ctx.reply(noResultsText, {
                        reply_markup: keyboard.reply_markup,
                        parse_mode: 'Markdown',
                    });
                }
            }
            else {
                await ctx.reply(noResultsText, {
                    reply_markup: keyboard.reply_markup,
                    parse_mode: 'Markdown',
                });
            }
            return;
        }
        const { results, page } = state;
        const resultsPerPage = 5;
        const startIdx = (page - 1) * resultsPerPage;
        const endIdx = Math.min(startIdx + resultsPerPage, results.length);
        const pageResults = results.slice(startIdx, endIdx);
        const resultButtons = pageResults.map((result, idx) => {
            const { coin } = result;
            const rank = coin.dynamicMetadata?.market_cap_rank
                ? `#${coin.dynamicMetadata.market_cap_rank} `
                : '';
            const buttonText = `${rank}${coin.name} (${coin.symbol})`;
            return [telegraf_1.Markup.button.callback(buttonText, `${prefix}_select_${coin.id}`)];
        });
        const paginationButtons = [];
        if (page > 1) {
            paginationButtons.push(telegraf_1.Markup.button.callback('« Previous', `${prefix}_prev_${page}`));
        }
        if (endIdx < results.length) {
            paginationButtons.push(telegraf_1.Markup.button.callback('Next »', `${prefix}_next_${page}`));
        }
        if (paginationButtons.length > 0) {
            resultButtons.push(paginationButtons);
        }
        resultButtons.push([(0, buttons_constant_1.createGoBackButton)()]);
        const keyboard = telegraf_1.Markup.inlineKeyboard(resultButtons);
        const messageText = `
*Search results for "${state.searchQuery}"*

Please select a coin from the list below:
    `;
        if (ctx.callbackQuery) {
            try {
                await ctx.editMessageText(messageText, {
                    reply_markup: keyboard.reply_markup,
                    parse_mode: 'Markdown',
                });
            }
            catch (error) {
                await ctx.reply(messageText, {
                    reply_markup: keyboard.reply_markup,
                    parse_mode: 'Markdown',
                });
            }
        }
        else {
            await ctx.reply(messageText, {
                reply_markup: keyboard.reply_markup,
                parse_mode: 'Markdown',
            });
        }
        this.logger.log(`Showed search results for "${state.searchQuery}" (${results.length} results, page ${page})`);
    }
    async processSearch(ctx, query, config) {
        this.logger.log(`Processing search query: "${query}"`);
        const confidenceThreshold = config.confidenceThreshold || 0.5;
        const searchResponse = await this.coinSearchService.searchCoins(query);
        this.logger.log(`Found ${searchResponse.data.length} results for "${query}"`);
        const state = {
            searchQuery: query,
            results: searchResponse.data,
            selectedCoin: null,
            page: 1
        };
        if (searchResponse.data.length > 0) {
            const topResult = searchResponse.data[0];
            this.logger.log(`Top result: ${topResult.coin.name} (${topResult.coin.symbol}) with score ${topResult.score}`);
            if (topResult.score >= confidenceThreshold) {
                state.selectedCoin = topResult.coin;
                this.logger.log(`Auto-selected high confidence match: ${topResult.coin.name}`);
                await ctx.toast(`Found ${topResult.coin.name} (${topResult.coin.symbol})`);
            }
        }
        return state;
    }
};
exports.CoinSearchComponent = CoinSearchComponent;
exports.CoinSearchComponent = CoinSearchComponent = CoinSearchComponent_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [coin_search_service_1.CoinSearchService])
], CoinSearchComponent);
function createCoinSearchHandler(component, config, nextStep, showResultsStep) {
    return async (ctx) => {
        if (!ctx.message || !('text' in ctx.message)) {
            return;
        }
        const query = ctx.message.text;
        const logger = new common_1.Logger('CoinSearchHandler');
        logger.log(`Received search query: "${query}"`);
        try {
            const state = await component.processSearch(ctx, query, config);
            ctx.wizard.state.parameters = {
                ...ctx.wizard.state.parameters,
                coinSearchState: state
            };
            if (state.selectedCoin) {
                logger.log(`High confidence match found, proceeding to next step`);
                ctx.wizard.state.parameters[config.fieldName] = state.selectedCoin;
                return nextStep(ctx);
            }
            logger.log(`No high confidence match, showing results`);
            return showResultsStep(ctx);
        }
        catch (error) {
            logger.error(`Error processing search: ${error.message}`);
            await ctx.reply('An error occurred while searching. Please try again.');
            await component.prompt(ctx, config);
        }
    };
}
//# sourceMappingURL=coin-search.component.js.map