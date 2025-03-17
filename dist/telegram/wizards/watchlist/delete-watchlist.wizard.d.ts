import { Scenes } from 'telegraf';
import { CustomContext } from '../../interfaces/custom-context.interface';
import { WatchlistService } from '../../services/watchlist.service';
export declare const createDeleteWatchlistWizard: (watchlistService: WatchlistService) => Scenes.WizardScene<CustomContext>;
