"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlertWizardsModule = void 0;
const common_1 = require("@nestjs/common");
const create_alert_wizard_1 = require("./create-alert.wizard");
const show_alerts_wizard_1 = require("./show-alerts.wizard");
const alert_service_1 = require("../../services/alert.service");
const watchlist_service_1 = require("../../services/watchlist.service");
const coin_search_service_1 = require("../../services/coin-search.service");
const options_service_1 = require("../../services/options.service");
let AlertWizardsModule = class AlertWizardsModule {
};
exports.AlertWizardsModule = AlertWizardsModule;
exports.AlertWizardsModule = AlertWizardsModule = __decorate([
    (0, common_1.Module)({
        imports: [],
        providers: [
            {
                provide: 'CREATE_ALERT_WIZARD',
                useValue: create_alert_wizard_1.createAlertWizard,
            },
            {
                provide: 'SHOW_ALL_ALERTS_WIZARD',
                useValue: show_alerts_wizard_1.showAllAlertsWizard,
            },
            alert_service_1.AlertService,
            watchlist_service_1.WatchlistService,
            coin_search_service_1.CoinSearchService,
            options_service_1.OptionsService,
        ],
        exports: ['CREATE_ALERT_WIZARD', 'SHOW_ALL_ALERTS_WIZARD', alert_service_1.AlertService],
    })
], AlertWizardsModule);
//# sourceMappingURL=alert-wizards.module.js.map