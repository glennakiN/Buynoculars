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
var WatchlistService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WatchlistService = void 0;
const common_1 = require("@nestjs/common");
const uuid_1 = require("uuid");
let WatchlistService = WatchlistService_1 = class WatchlistService {
    logger = new common_1.Logger(WatchlistService_1.name);
    watchlists = [];
    constructor() {
        this.initializeMockData();
    }
    initializeMockData() {
        this.watchlists = [
            {
                id: (0, uuid_1.v4)(),
                name: 'Top DeFi',
                isPublic: true,
                createdAt: new Date(),
                updatedAt: new Date(),
                coins: [
                    {
                        coinIdentifier: 'ethereum',
                        coin: {
                            name: 'Ethereum',
                            symbol: 'ETH',
                            price: 4500.21,
                            priceChange24h: 5.2,
                        }
                    },
                    {
                        coinIdentifier: 'uniswap',
                        coin: {
                            name: 'Uniswap',
                            symbol: 'UNI',
                            price: 7.35,
                            priceChange24h: -2.1,
                        }
                    },
                    {
                        coinIdentifier: 'aave',
                        coin: {
                            name: 'Aave',
                            symbol: 'AAVE',
                            price: 120.50,
                            priceChange24h: 3.7,
                        }
                    }
                ]
            },
            {
                id: (0, uuid_1.v4)(),
                name: 'Market Leaders',
                isPublic: true,
                createdAt: new Date(),
                updatedAt: new Date(),
                coins: [
                    {
                        coinIdentifier: 'bitcoin',
                        coin: {
                            name: 'Bitcoin',
                            symbol: 'BTC',
                            price: 68421.32,
                            priceChange24h: 2.3,
                        }
                    },
                    {
                        coinIdentifier: 'ethereum',
                        coin: {
                            name: 'Ethereum',
                            symbol: 'ETH',
                            price: 4500.21,
                            priceChange24h: 5.2,
                        }
                    },
                    {
                        coinIdentifier: 'binancecoin',
                        coin: {
                            name: 'Binance Coin',
                            symbol: 'BNB',
                            price: 650.75,
                            priceChange24h: 1.8,
                        }
                    }
                ]
            }
        ];
    }
    async getWatchlists(telegramId, isGroup) {
        this.logger.log(`Getting watchlists for ${isGroup ? 'group' : 'user'}: ${telegramId}`);
        return this.watchlists;
    }
    async getWatchlistById(watchlistId) {
        const watchlist = this.watchlists.find(w => w.id === watchlistId);
        if (!watchlist) {
            throw new common_1.NotFoundException(`Watchlist with ID ${watchlistId} not found`);
        }
        return watchlist;
    }
    async createWatchlist(telegramId, isGroup, name) {
        this.logger.log(`Creating watchlist "${name}" for ${isGroup ? 'group' : 'user'}: ${telegramId}`);
        const newWatchlist = {
            id: (0, uuid_1.v4)(),
            name,
            isPublic: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            ...(isGroup ? { telegramGroupId: telegramId } : { telegramUserId: telegramId }),
            coins: []
        };
        this.watchlists.push(newWatchlist);
        return newWatchlist;
    }
    async renameWatchlist(telegramId, isGroup, watchlistId, newName) {
        this.logger.log(`Renaming watchlist ${watchlistId} to "${newName}"`);
        const watchlist = await this.getWatchlistById(watchlistId);
        watchlist.name = newName;
        watchlist.updatedAt = new Date();
        return watchlist;
    }
    async deleteWatchlist(telegramId, isGroup, watchlistId) {
        this.logger.log(`Deleting watchlist ${watchlistId}`);
        const index = this.watchlists.findIndex(w => w.id === watchlistId);
        if (index === -1) {
            throw new common_1.NotFoundException(`Watchlist with ID ${watchlistId} not found`);
        }
        this.watchlists.splice(index, 1);
        return true;
    }
    async addToWatchlist(telegramId, isGroup, coinIdentifier, watchlistId) {
        this.logger.log(`Adding coin ${coinIdentifier} to watchlist ${watchlistId}`);
        const watchlist = await this.getWatchlistById(watchlistId);
        const existingCoin = watchlist.coins.find(c => c.coinIdentifier === coinIdentifier);
        if (existingCoin) {
            this.logger.log(`Coin ${coinIdentifier} already exists in watchlist`);
            return watchlist;
        }
        const coinData = {
            name: coinIdentifier.charAt(0).toUpperCase() + coinIdentifier.slice(1),
            symbol: coinIdentifier.substring(0, 3).toUpperCase(),
            price: Math.random() * 1000,
            priceChange24h: (Math.random() * 20) - 10
        };
        watchlist.coins.push({
            coinIdentifier,
            coin: coinData
        });
        watchlist.updatedAt = new Date();
        return watchlist;
    }
    async removeFromWatchlist(telegramId, isGroup, coinIdentifier, watchlistId) {
        this.logger.log(`Removing coin ${coinIdentifier} from watchlist ${watchlistId}`);
        const watchlist = await this.getWatchlistById(watchlistId);
        const coinIndex = watchlist.coins.findIndex(c => c.coinIdentifier === coinIdentifier);
        if (coinIndex === -1) {
            this.logger.log(`Coin ${coinIdentifier} not found in watchlist`);
            return watchlist;
        }
        watchlist.coins.splice(coinIndex, 1);
        watchlist.updatedAt = new Date();
        return watchlist;
    }
    transformWatchlistsToDisplayItems(watchlists) {
        const items = [];
        watchlists.forEach(watchlist => {
            watchlist.coins.forEach(entry => {
                if (entry.coin) {
                    items.push({
                        id: entry.coinIdentifier,
                        name: entry.coin.name,
                        symbol: entry.coin.symbol,
                        price: entry.coin.price,
                        priceChange24h: entry.coin.priceChange24h,
                        watchlistId: watchlist.id,
                        watchlistName: watchlist.name
                    });
                }
            });
        });
        return items;
    }
};
exports.WatchlistService = WatchlistService;
exports.WatchlistService = WatchlistService = WatchlistService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], WatchlistService);
//# sourceMappingURL=watchlist.service.js.map