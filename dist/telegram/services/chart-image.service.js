"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ChartImageService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChartImageService = void 0;
const common_1 = require("@nestjs/common");
const d3 = require("d3");
const jsdom_1 = require("jsdom");
const sharp = require("sharp");
let ChartImageService = ChartImageService_1 = class ChartImageService {
    logger = new common_1.Logger(ChartImageService_1.name);
    async generateMockChart(coin, pairing, timeframe) {
        this.logger.log(`Generating mock chart for ${coin} - ${pairing} (${timeframe})`);
        const ohlcData = this.generateMockOHLC();
        const smaData = this.generateMockSMA(ohlcData);
        const dom = new jsdom_1.JSDOM(`<!DOCTYPE html><html><body></body></html>`);
        const body = d3.select(dom.window.document).select('body');
        const width = 800;
        const height = 400;
        const margin = { top: 20, right: 20, bottom: 30, left: 40 };
        const svg = body.append('svg')
            .attr('width', width)
            .attr('height', height);
        const xScale = d3.scaleLinear()
            .domain([0, ohlcData.length - 1])
            .range([margin.left, width - margin.right]);
        const yExtent = [
            d3.min(ohlcData, d => d.low),
            d3.max(ohlcData, d => d.high),
        ];
        const yScale = d3.scaleLinear()
            .domain(yExtent)
            .range([height - margin.bottom, margin.top]);
        ohlcData.forEach((d, i) => {
            const x = xScale(i);
            svg.append('rect')
                .attr('x', x - 5)
                .attr('y', yScale(Math.max(d.open, d.close)))
                .attr('width', 10)
                .attr('height', Math.abs(yScale(d.open) - yScale(d.close)))
                .attr('fill', d.close > d.open ? 'green' : 'red');
            svg.append('line')
                .attr('x1', x)
                .attr('x2', x)
                .attr('y1', yScale(d.high))
                .attr('y2', yScale(d.low))
                .attr('stroke', 'black');
        });
        const line = d3.line()
            .x((d, i) => xScale(i))
            .y(d => yScale(d));
        svg.append('path')
            .datum(smaData)
            .attr('fill', 'none')
            .attr('stroke', 'blue')
            .attr('stroke-width', 2)
            .attr('d', line);
        const sma2 = smaData.map(v => v * 0.98);
        const area = d3.area()
            .x((d, i) => xScale(i))
            .y0((d, i) => yScale(sma2[i]))
            .y1(d => yScale(d));
        svg.append('path')
            .datum(smaData)
            .attr('fill', 'orange')
            .attr('opacity', 0.3)
            .attr('d', area);
        svg.append('text')
            .attr('x', width / 2)
            .attr('y', margin.top)
            .attr('text-anchor', 'middle')
            .attr('fill', 'black')
            .attr('font-size', '16px')
            .text(`${coin} Chart`);
        const svgString = body.html();
        return await sharp(Buffer.from(svgString)).png().toBuffer();
    }
    generateMockOHLC() {
        const data = [];
        let price = 100;
        for (let i = 0; i < 30; i++) {
            const open = price;
            const close = open + (Math.random() - 0.5) * 10;
            const high = Math.max(open, close) + Math.random() * 5;
            const low = Math.min(open, close) - Math.random() * 5;
            data.push({ open, close, high, low });
            price = close;
        }
        return data;
    }
    generateMockSMA(data) {
        const sma = [];
        for (let i = 0; i < data.length; i++) {
            const windowData = data.slice(Math.max(0, i - 4), i + 1);
            const sum = windowData.reduce((acc, d) => acc + d.close, 0);
            sma.push(sum / windowData.length);
        }
        return sma;
    }
};
exports.ChartImageService = ChartImageService;
exports.ChartImageService = ChartImageService = ChartImageService_1 = __decorate([
    (0, common_1.Injectable)()
], ChartImageService);
//# sourceMappingURL=chart-image.service.js.map