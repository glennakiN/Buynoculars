"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelegramModule = void 0;
const common_1 = require("@nestjs/common");
const telegram_service_1 = require("./telegram.service");
const wizards_module_1 = require("./wizards/wizards.module");
const components_module_1 = require("./components/components.module");
const coin_search_service_1 = require("./services/coin-search.service");
const options_service_1 = require("./services/options.service");
const chart_image_service_1 = require("./services/chart-image.service");
const watchlist_service_1 = require("./services/watchlist.service");
const alert_service_1 = require("./services/alert.service");
const multi_picker_component_1 = require("./components/multi-picker.component");
let TelegramModule = class TelegramModule {
};
exports.TelegramModule = TelegramModule;
exports.TelegramModule = TelegramModule = __decorate([
    (0, common_1.Module)({
        imports: [wizards_module_1.WizardsModule, components_module_1.ComponentsModule],
        providers: [
            telegram_service_1.TelegramService,
            coin_search_service_1.CoinSearchService,
            options_service_1.OptionsService,
            chart_image_service_1.ChartImageService,
            watchlist_service_1.WatchlistService,
            alert_service_1.AlertService,
            multi_picker_component_1.MultiPickerComponent,
        ],
        exports: [telegram_service_1.TelegramService],
    })
], TelegramModule);
//# sourceMappingURL=telegram.module.js.map