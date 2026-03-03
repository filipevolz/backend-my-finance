import { Repository } from 'typeorm';
import { Category, CategoryType } from './category.entity';
export declare class CategoriesService {
    private categoriesRepository;
    constructor(categoriesRepository: Repository<Category>);
    findAll(type?: CategoryType): Promise<Category[]>;
    findOne(id: string): Promise<Category>;
    create(category: Partial<Category>): Promise<Category>;
    createMany(categories: Partial<Category>[]): Promise<Category[]>;
    updateCategoryIcons(): Promise<void>;
}
