"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WatchlistWizardsModule = void 0;
const common_1 = require("@nestjs/common");
const watchlist_service_1 = require("../services/watchlist.service");
const coin_search_service_1 = require("../services/coin-search.service");
const show_watchlist_wizard_1 = require("./watchlist/show-watchlist.wizard");
const rename_watchlist_wizard_1 = require("./watchlist/rename-watchlist.wizard");
const create_watchlist_wizard_1 = require("./watchlist/create-watchlist.wizard");
const delete_watchlist_wizard_1 = require("./watchlist/delete-watchlist.wizard");
const add_to_watchlist_wizard_1 = require("./watchlist/add-to-watchlist.wizard");
const alert_wizards_module_1 = require("./alerts/alert-wizards.module");
let WatchlistWizardsModule = class WatchlistWizardsModule {
};
exports.WatchlistWizardsModule = WatchlistWizardsModule;
exports.WatchlistWizardsModule = WatchlistWizardsModule = __decorate([
    (0, common_1.Module)({
        providers: [
            watchlist_service_1.WatchlistService,
            coin_search_service_1.CoinSearchService,
            {
                provide: 'SHOW_WATCHLIST_WIZARD',
                useFactory: (watchlistService) => {
                    return (0, show_watchlist_wizard_1.createShowWatchlistWizard)(watchlistService);
                },
                inject: [watchlist_service_1.WatchlistService]
            },
            {
                provide: 'CREATE_WATCHLIST_WIZARD',
                useFactory: (watchlistService) => {
                    return (0, create_watchlist_wizard_1.createCreateWatchlistWizard)(watchlistService);
                },
                inject: [watchlist_service_1.WatchlistService]
            },
            {
                provide: 'RENAME_WATCHLIST_WIZARD',
                useFactory: (watchlistService) => {
                    return (0, rename_watchlist_wizard_1.createRenameWatchlistWizard)(watchlistService);
                },
                inject: [watchlist_service_1.WatchlistService]
            },
            {
                provide: 'DELETE_WATCHLIST_WIZARD',
                useFactory: (watchlistService) => {
                    return (0, delete_watchlist_wizard_1.createDeleteWatchlistWizard)(watchlistService);
                },
                inject: [watchlist_service_1.WatchlistService]
            },
            {
                provide: 'ADD_TO_WATCHLIST_WIZARD',
                useFactory: (watchlistService, coinSearchService) => {
                    return (0, add_to_watchlist_wizard_1.createAddToWatchlistWizard)(watchlistService, coinSearchService);
                },
                inject: [watchlist_service_1.WatchlistService, coin_search_service_1.CoinSearchService]
            }
        ],
        exports: [
            'SHOW_WATCHLIST_WIZARD',
            'CREATE_WATCHLIST_WIZARD',
            'RENAME_WATCHLIST_WIZARD',
            'DELETE_WATCHLIST_WIZARD',
            'ADD_TO_WATCHLIST_WIZARD',
            watchlist_service_1.WatchlistService,
            coin_search_service_1.CoinSearchService
        ],
        imports: [alert_wizards_module_1.AlertWizardsModule]
    })
], WatchlistWizardsModule);
//# sourceMappingURL=watchlist-wizards.module.js.map