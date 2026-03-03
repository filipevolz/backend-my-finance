"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const incomes_module_1 = require("./incomes/incomes.module");
const expenses_module_1 = require("./expenses/expenses.module");
const categories_module_1 = require("./categories/categories.module");
const investments_module_1 = require("./investments/investments.module");
const cards_module_1 = require("./cards/cards.module");
const user_entity_1 = require("./users/user.entity");
const income_entity_1 = require("./incomes/income.entity");
const expense_entity_1 = require("./expenses/expense.entity");
const category_entity_1 = require("./categories/category.entity");
const investment_operation_entity_1 = require("./investments/investment-operation.entity");
const asset_type_entity_1 = require("./investments/asset-type.entity");
const exchange_entity_1 = require("./investments/exchange.entity");
const asset_entity_1 = require("./investments/asset.entity");
const card_entity_1 = require("./cards/card.entity");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: (configService) => {
                    const databaseUrl = configService.get('DATABASE_URL');
                    if (!databaseUrl) {
                        throw new Error('DATABASE_URL não está definida');
                    }
                    const url = new URL(databaseUrl);
                    return {
                        type: 'postgres',
                        host: url.hostname,
                        port: parseInt(url.port) || 5432,
                        username: url.username,
                        password: url.password,
                        database: url.pathname.slice(1),
                        ssl: {
                            rejectUnauthorized: false,
                        },
                        entities: [user_entity_1.User, income_entity_1.Income, expense_entity_1.Expense, category_entity_1.Category, investment_operation_entity_1.InvestmentOperation, asset_type_entity_1.AssetType, exchange_entity_1.Exchange, asset_entity_1.Asset, card_entity_1.Card],
                        synchronize: true,
                    };
                },
                inject: [config_1.ConfigService],
            }),
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            incomes_module_1.IncomesModule,
            expenses_module_1.ExpensesModule,
            categories_module_1.CategoriesModule,
            investments_module_1.InvestmentsModule,
            cards_module_1.CardsModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map