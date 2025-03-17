"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var CoinSearchService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoinSearchService = void 0;
const common_1 = require("@nestjs/common");
let CoinSearchService = CoinSearchService_1 = class CoinSearchService {
    logger = new common_1.Logger(CoinSearchService_1.name);
    mockCoins = [
        {
            id: '1',
            identifier: 'bitcoin',
            symbol: 'BTC',
            name: 'Bitcoin',
            dynamicMetadata: { market_cap_rank: 1 }
        },
        {
            id: '2',
            identifier: 'ethereum',
            symbol: 'ETH',
            name: 'Ethereum',
            dynamicMetadata: { market_cap_rank: 2 }
        },
        {
            id: '3',
            identifier: 'binancecoin',
            symbol: 'BNB',
            name: 'Binance Coin',
            dynamicMetadata: { market_cap_rank: 3 }
        },
        {
            id: '4',
            identifier: 'solana',
            symbol: 'SOL',
            name: 'Solana',
            dynamicMetadata: { market_cap_rank: 4 }
        },
        {
            id: '5',
            identifier: 'xrp',
            symbol: 'XRP',
            name: 'XRP',
            dynamicMetadata: { market_cap_rank: 5 }
        },
        {
            id: '6',
            identifier: 'cardano',
            symbol: 'ADA',
            name: 'Cardano',
            dynamicMetadata: { market_cap_rank: 6 }
        },
        {
            id: '7',
            identifier: 'dogecoin',
            symbol: 'DOGE',
            name: 'Dogecoin',
            dynamicMetadata: { market_cap_rank: 7 }
        },
        {
            id: '8',
            identifier: 'polkadot',
            symbol: 'DOT',
            name: 'Polkadot',
            dynamicMetadata: { market_cap_rank: 8 }
        },
        {
            id: '9',
            identifier: 'bitcoincash',
            symbol: 'BCH',
            name: 'Bitcoin Cash',
            dynamicMetadata: { market_cap_rank: 9 }
        },
        {
            id: '10',
            identifier: 'litecoin',
            symbol: 'LTC',
            name: 'Litecoin',
            dynamicMetadata: { market_cap_rank: 10 }
        },
        {
            id: '11',
            identifier: 'bitcoin-sv',
            symbol: 'BSV',
            name: 'Bitcoin SV',
            dynamicMetadata: { market_cap_rank: 11 }
        },
        {
            id: '12',
            identifier: 'bitcoin-gold',
            symbol: 'BTG',
            name: 'Bitcoin Gold',
            dynamicMetadata: { market_cap_rank: 12 }
        },
        {
            id: '13',
            identifier: 'bitcoin-diamond',
            symbol: 'BCD',
            name: 'Bitcoin Diamond',
            dynamicMetadata: { market_cap_rank: 13 }
        },
    ];
    calculateSimilarity(a, b) {
        if (a === b)
            return 1.0;
        if (b.startsWith(a))
            return 0.9;
        if (b.includes(a))
            return 0.7;
        return 0.3;
    }
    async searchCoins(query, page = 1, limit = 10) {
        this.logger.log(`Searching for coins with query: ${query}`);
        const searchTerm = query.toLowerCase().trim();
        const filteredCoins = this.mockCoins.filter(coin => coin.symbol.toLowerCase().includes(searchTerm) ||
            coin.identifier.toLowerCase().includes(searchTerm) ||
            coin.name.toLowerCase().includes(searchTerm));
        const scoredResults = filteredCoins.map(coin => {
            const symbolScore = this.calculateSimilarity(searchTerm, coin.symbol.toLowerCase()) * 2;
            const identifierScore = this.calculateSimilarity(searchTerm, coin.identifier.toLowerCase());
            const nameScore = this.calculateSimilarity(searchTerm, coin.name.toLowerCase());
            let exactMatchBonus = 0;
            if (coin.symbol.toLowerCase() === searchTerm) {
                exactMatchBonus = 3;
            }
            else if (coin.identifier.toLowerCase() === searchTerm) {
                exactMatchBonus = 2;
            }
            else if (coin.name.toLowerCase() === searchTerm) {
                exactMatchBonus = 1;
            }
            const scores = [symbolScore, identifierScore, nameScore];
            const marketCapBonus = coin.dynamicMetadata?.market_cap_rank
                ? 1 / (1 + coin.dynamicMetadata.market_cap_rank)
                : 0;
            return {
                coin,
                score: Math.max(...scores) + exactMatchBonus + marketCapBonus,
            };
        });
        const sortedResults = scoredResults.sort((a, b) => {
            const scoreDiff = b.score - a.score;
            if (scoreDiff !== 0)
                return scoreDiff;
            const aRank = a.coin.dynamicMetadata?.market_cap_rank || Infinity;
            const bRank = b.coin.dynamicMetadata?.market_cap_rank || Infinity;
            return aRank - bRank;
        });
        const skip = (page - 1) * limit;
        const paginatedResults = sortedResults.slice(skip, skip + limit);
        return {
            data: paginatedResults,
            total: sortedResults.length,
            page,
            lastPage: Math.ceil(sortedResults.length / limit),
        };
    }
    async getCoinById(id) {
        this.logger.log(`Getting coin details for ID: ${id}`);
        const coin = this.mockCoins.find(c => c.id.toLowerCase() === id.toLowerCase());
        if (coin) {
            this.logger.log(`Found coin: ${coin.name} (${coin.symbol})`);
            return coin;
        }
        this.logger.log(`Coin with ID ${id} not found`);
        return null;
    }
};
exports.CoinSearchService = CoinSearchService;
exports.CoinSearchService = CoinSearchService = CoinSearchService_1 = __decorate([
    (0, common_1.Injectable)()
], CoinSearchService);
//# sourceMappingURL=coin-search.service.js.map