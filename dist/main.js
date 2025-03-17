"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableShutdownHooks();
    await app.listen(process.env.PORT ?? 4000);
    process.on('SIGTERM', async () => {
        await app.close();
        process.exit(0);
    });
    process.on('SIGINT', async () => {
        await app.close();
        process.exit(0);
    });
}
bootstrap();
//# sourceMappingURL=main.js.map