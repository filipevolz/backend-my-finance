import { CategoriesService } from './categories.service';
import { CategoryType } from './category.entity';
export declare class CategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
    findAll(type?: CategoryType): Promise<{
        data: import("./category.entity").Category[];
    }>;
}
