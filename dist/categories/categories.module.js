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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoriesModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const categories_service_1 = require("./categories.service");
const categories_controller_1 = require("./categories.controller");
const category_entity_1 = require("./category.entity");
const auth_module_1 = require("../auth/auth.module");
const categories_seed_1 = require("./categories.seed");
let CategoriesModule = class CategoriesModule {
    categoriesService;
    constructor(categoriesService) {
        this.categoriesService = categoriesService;
    }
    async onModuleInit() {
        const existingCategories = await this.categoriesService.findAll();
        if (existingCategories.length === 0) {
            await this.categoriesService.createMany(categories_seed_1.categoriesSeed);
        }
        else {
            await this.categoriesService.updateCategoryIcons();
        }
    }
};
exports.CategoriesModule = CategoriesModule;
exports.CategoriesModule = CategoriesModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([category_entity_1.Category]), auth_module_1.AuthModule],
        controllers: [categories_controller_1.CategoriesController],
        providers: [categories_service_1.CategoriesService],
        exports: [categories_service_1.CategoriesService],
    }),
    __metadata("design:paramtypes", [categories_service_1.CategoriesService])
], CategoriesModule);
//# sourceMappingURL=categories.module.js.map