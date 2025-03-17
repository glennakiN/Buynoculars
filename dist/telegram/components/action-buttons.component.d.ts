import { Markup } from 'telegraf';
import { CustomContext } from '../interfaces/custom-context.interface';
export declare enum ActionButtonType {
    DEFAULT = "default",
    TRADING = "trading",
    NEWS = "news",
    CUSTOM = "custom"
}
export interface ActionButton {
    label: string;
    action: string;
    url?: string;
}
export interface ActionButtonsConfig {
    type: ActionButtonType;
    identifier?: string;
    customButtons?: ActionButton[];
    showBackButton?: boolean;
}
export declare class ActionButtonsComponent {
    generateButtons(config: ActionButtonsConfig): ActionButton[];
    createMarkup(config: ActionButtonsConfig): Markup.Markup<import("telegraf/typings/core/types/typegram").InlineKeyboardMarkup>;
    addButtonsToPhoto(ctx: CustomContext, imageBuffer: Buffer, caption: string, config: ActionButtonsConfig): Promise<void>;
    addButtonsToMessage(ctx: CustomContext, text: string, config: ActionButtonsConfig): Promise<void>;
}
export declare class ActionButtonsHandler {
    handleCallback(ctx: CustomContext, action: string): Promise<void>;
    private handleAddToWatchlist;
    private handleSetAlert;
    private handleFollowSource;
}
