import { Injectable, OnModuleInit, Inject, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Telegraf, session, Scenes } from 'telegraf';
import { CustomContext } from './interfaces/custom-context.interface';
import { Message } from 'telegraf/types';
import { sendMainMenu } from './menus/main.menu';
import { sendWatchlistMenu } from './menus/watchlist.menu';
import { sendAlertsMenu } from './menus/alerts.menu';
import { sendTopGainersMenu } from './menus/topGainers.menu';
import { sendTopLosersMenu } from './menus/topLosers.menu';

@Injectable()
export class TelegramService implements OnModuleInit {
  private bot: Telegraf<CustomContext>;
  private readonly logger = new Logger(TelegramService.name);

  constructor(
    private configService: ConfigService,
  ) {
    this.bot = new Telegraf<CustomContext>(
      this.configService.get<string>('TELEGRAM_BOT_TOKEN') || '',
    );
  }

  async onModuleInit() {
    this.logger.log('Initializing Telegram bot');

    this.bot.use(session());
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

  private async setupCommands() {
    this.logger.log('Setting up bot commands and handlers');

    this.bot.command('start', async (ctx) => {
      await ctx.reply('Welcome to TrendSniper Bot!');
      await sendMainMenu(ctx);
    });

    this.bot.command('watchlist', async (ctx) => {
      this.logger.log('Watchlist command received');
      await sendWatchlistMenu(ctx);
    });

    this.bot.command('alerts', async (ctx) => {
      this.logger.log('Alerts command received');
      await sendAlertsMenu(ctx);
    });

    this.bot.command('topgainers', async (ctx) => {
      this.logger.log('Top Gainers command received');
      await sendTopGainersMenu(ctx);
    });

    this.bot.command('toplosers', async (ctx) => {
      this.logger.log('Top Losers command received');
      await sendTopLosersMenu(ctx);
    });

    await this.bot.telegram.setMyCommands([
      { command: 'start', description: 'Start the TrendSniper Bot' },
      { command: 'watchlist', description: 'Manage your watchlists' },
      { command: 'alerts', description: 'Manage your alerts' },
      { command: 'topgainers', description: 'View top gainers' },
      { command: 'toplosers', description: 'View top losers' },
    ]);
  }

  async sendMessage(chatId: number, message: string): Promise<Message.TextMessage> {
    return this.bot.telegram.sendMessage(chatId, message);
  }
}
