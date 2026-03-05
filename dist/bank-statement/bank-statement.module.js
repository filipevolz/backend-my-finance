"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BankStatementModule = void 0;
const common_1 = require("@nestjs/common");
const bank_statement_controller_1 = require("./bank-statement.controller");
const bank_statement_service_1 = require("./bank-statement.service");
const expenses_module_1 = require("../expenses/expenses.module");
const incomes_module_1 = require("../incomes/incomes.module");
const auth_module_1 = require("../auth/auth.module");
let BankStatementModule = class BankStatementModule {
};
exports.BankStatementModule = BankStatementModule;
exports.BankStatementModule = BankStatementModule = __decorate([
    (0, common_1.Module)({
        imports: [auth_module_1.AuthModule, expenses_module_1.ExpensesModule, incomes_module_1.IncomesModule],
        controllers: [bank_statement_controller_1.BankStatementController],
        providers: [bank_statement_service_1.BankStatementService],
    })
], BankStatementModule);
//# sourceMappingURL=bank-statement.module.js.map