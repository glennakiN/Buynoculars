import { CustomContext } from '../interfaces/custom-context.interface';
import { ActionButtonType } from './action-buttons.component';
export declare function getReplyWithChart(ctx: CustomContext, imageBuffer: Buffer, caption: string, coinId?: string, buttonType?: ActionButtonType): Promise<void>;
