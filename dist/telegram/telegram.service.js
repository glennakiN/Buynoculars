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
var TelegramService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelegramService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const telegraf_1 = require("telegraf");
const main_menu_1 = require("./menus/main.menu");
const watchlist_menu_1 = require("./menus/watchlist.menu");
const alerts_menu_1 = require("./menus/alerts.menu");
const topGainers_menu_1 = require("./menus/topGainers.menu");
const topLosers_menu_1 = require("./menus/topLosers.menu");
let TelegramService = TelegramService_1 = class TelegramService {
    configService;
    bot;
    logger = new common_1.Logger(TelegramService_1.name);
    constructor(configService) {
        this.configService = configService;
        this.bot = new telegraf_1.Telegraf(this.configService.get('TELEGRAM_BOT_TOKEN') || '');
    }
    async onModuleInit() {
        this.logger.log('Initializing Telegram bot');
        this.bot.use((0, telegraf_1.session)());
        await this.setupCommands();
        this.logger.log('Launching bot');
        this.bot.launch({
            dropPendingUpdates: true,
        });
        this.logger.log('Bot launched successfully');
        process.once('SIGINT', () => {
            this.logger.log('Received SIGINT signal, stopping bot');
            this.bot.stop('SIGINT');
        });
        process.once('SIGTERM', () => {
            this.logger.log('Received SIGTERM signal, stopping bot');
            this.bot.stop('SIGTERM');
        });
    }
    async setupCommands() {
        this.logger.log('Setting up bot commands and handlers');
        this.bot.command('start', async (ctx) => {
            await ctx.reply('Welcome to TrendSniper Bot!');
            await (0, main_menu_1.sendMainMenu)(ctx);
        });
        this.bot.command('watchlist', async (ctx) => {
            this.logger.log('Watchlist command received');
            await (0, watchlist_menu_1.sendWatchlistMenu)(ctx);
        });
        this.bot.command('alerts', async (ctx) => {
            this.logger.log('Alerts command received');
            await (0, alerts_menu_1.sendAlertsMenu)(ctx);
        });
        this.bot.command('topgainers', async (ctx) => {
            this.logger.log('Top Gainers command received');
            await (0, topGainers_menu_1.sendTopGainersMenu)(ctx);
        });
        this.bot.command('toplosers', async (ctx) => {
            this.logger.log('Top Losers command received');
            await (0, topLosers_menu_1.sendTopLosersMenu)(ctx);
        });
        await this.bot.telegram.setMyCommands([
            { command: 'start', description: 'Start the TrendSniper Bot' },
            { command: 'watchlist', description: 'Manage your watchlists' },
            { command: 'alerts', description: 'Manage your alerts' },
            { command: 'topgainers', description: 'View top gainers' },
            { command: 'toplosers', description: 'View top losers' },
        ]);
    }
    async sendMessage(chatId, message) {
        return this.bot.telegram.sendMessage(chatId, message);
    }
};
exports.TelegramService = TelegramService;
exports.TelegramService = TelegramService = TelegramService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], TelegramService);
//# sourceMappingURL=telegram.service.js.map