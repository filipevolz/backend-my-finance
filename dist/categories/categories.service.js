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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoriesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const category_entity_1 = require("./category.entity");
const categories_seed_1 = require("./categories.seed");
const INCOME_ORDER = [
    'Salário',
    'Freelance',
    'Comissão',
    'Vendas',
    'Cashback',
    'Rendimentos',
    'Aluguel recebido',
    'Reembolso',
    'Presentes',
    'Outros',
];
let CategoriesService = class CategoriesService {
    categoriesRepository;
    constructor(categoriesRepository) {
        this.categoriesRepository = categoriesRepository;
    }
    async findAll(type) {
        if (type) {
            const categories = await this.categoriesRepository.find({
                where: { type },
            });
            if (type === category_entity_1.CategoryType.INCOME) {
                return categories.sort((a, b) => {
                    const indexA = INCOME_ORDER.indexOf(a.name);
                    const indexB = INCOME_ORDER.indexOf(b.name);
                    if (indexA === -1)
                        return 1;
                    if (indexB === -1)
                        return -1;
                    return indexA - indexB;
                });
            }
            return categories.sort((a, b) => a.name.localeCompare(b.name));
        }
        return await this.categoriesRepository
            .createQueryBuilder('category')
            .orderBy('category.type', 'ASC')
            .addOrderBy('category.name', 'ASC')
            .getMany();
    }
    async findOne(id) {
        return await this.categoriesRepository.findOneOrFail({
            where: { id },
        });
    }
    async create(category) {
        const newCategory = this.categoriesRepository.create(category);
        return await this.categoriesRepository.save(newCategory);
    }
    async createMany(categories) {
        const newCategories = this.categoriesRepository.create(categories);
        return await this.categoriesRepository.save(newCategories);
    }
    async updateCategoryIcons() {
        const categories = await this.categoriesRepository.find();
        let updatedCount = 0;
        let skippedCount = 0;
        for (const category of categories) {
            const seedCategory = categories_seed_1.categoriesSeed.find((c) => c.name === category.name && c.type === category.type);
            if (seedCategory && seedCategory.icon) {
                if (category.icon !== seedCategory.icon) {
                    category.icon = seedCategory.icon;
                    await this.categoriesRepository.save(category);
                    updatedCount++;
                }
                else {
                    skippedCount++;
                }
            }
            else {
                console.warn(`⚠️  Categoria "${category.name}" (${category.type}) não encontrada no seed`);
            }
        }
    }
};
exports.CategoriesService = CategoriesService;
exports.CategoriesService = CategoriesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(category_entity_1.Category)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], CategoriesService);
//# sourceMappingURL=categories.service.js.map