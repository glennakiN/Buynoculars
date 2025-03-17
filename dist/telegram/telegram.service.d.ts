import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Message } from 'telegraf/types';
export declare class TelegramService implements OnModuleInit {
    private configService;
    private bot;
    private readonly logger;
    constructor(configService: ConfigService);
    onModuleInit(): Promise<void>;
    private setupCommands;
    sendMessage(chatId: number, message: string): Promise<Message.TextMessage>;
}
