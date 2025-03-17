"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var AlertService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlertService = exports.AlertNotificationType = exports.AlertType = void 0;
const common_1 = require("@nestjs/common");
var AlertType;
(function (AlertType) {
    AlertType["WATCHLIST"] = "watchlist";
    AlertType["DISCOVERY"] = "discovery";
})(AlertType || (exports.AlertType = AlertType = {}));
var AlertNotificationType;
(function (AlertNotificationType) {
    AlertNotificationType["HORIZON_SCORE"] = "horizon_score";
    AlertNotificationType["INDIVIDUAL_INDICATORS"] = "individual_indicators";
})(AlertNotificationType || (exports.AlertNotificationType = AlertNotificationType = {}));
let AlertService = AlertService_1 = class AlertService {
    logger = new common_1.Logger(AlertService_1.name);
    alerts = new Map();
    alertCounter = 1;
    async createAlert(config) {
        const alertId = `alert_${this.alertCounter++}`;
        const newAlert = {
            ...config,
            id: alertId,
            createdAt: new Date(),
            active: true
        };
        this.alerts.set(alertId, newAlert);
        this.logger.log(`Created alert: ${alertId} - ${newAlert.name}`);
        await this.mockApiCall('createAlert', newAlert);
        return newAlert;
    }
    async getAlerts(userId, type) {
        await this.mockApiCall('getAlerts', { userId, type });
        return Array.from(this.alerts.values()).filter(alert => alert.userId === userId &&
            (type === undefined || alert.type === type));
    }
    async deleteAlert(alertId) {
        await this.mockApiCall('deleteAlert', { alertId });
        const result = this.alerts.delete(alertId);
        if (result) {
            this.logger.log(`Deleted alert: ${alertId}`);
        }
        else {
            this.logger.warn(`Alert not found for deletion: ${alertId}`);
        }
        return result;
    }
    async toggleAlertStatus(alertId) {
        const alert = this.alerts.get(alertId);
        if (!alert) {
            this.logger.warn(`Alert not found for toggle: ${alertId}`);
            return null;
        }
        alert.active = !alert.active;
        this.alerts.set(alertId, alert);
        this.logger.log(`Toggle alert status: ${alertId} - now ${alert.active ? 'active' : 'inactive'}`);
        await this.mockApiCall('toggleAlert', { alertId, active: alert.active });
        return alert;
    }
    getAlertsLimits() {
        return {
            watchlistLimit: 10,
            discoveryLimit: 5,
            indicatorLimit: 3
        };
    }
    async mockApiCall(endpoint, data) {
        this.logger.debug(`API call to ${endpoint} with data:`, data);
        await new Promise(resolve => setTimeout(resolve, 500));
        return { success: true, timestamp: new Date().toISOString() };
    }
};
exports.AlertService = AlertService;
exports.AlertService = AlertService = AlertService_1 = __decorate([
    (0, common_1.Injectable)()
], AlertService);
//# sourceMappingURL=alert.service.js.map