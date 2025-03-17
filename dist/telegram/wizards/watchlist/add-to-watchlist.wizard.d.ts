import { Scenes } from 'telegraf';
import { CustomContext } from '../../interfaces/custom-context.interface';
import { WatchlistService } from '../../services/watchlist.service';
import { CoinSearchService } from '../../services/coin-search.service';
export declare const createAddToWatchlistWizard: (watchlistService: WatchlistService, coinSearchService: CoinSearchService) => Scenes.WizardScene<CustomContext>;
