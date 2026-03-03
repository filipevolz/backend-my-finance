import { OnModuleInit } from '@nestjs/common';
import { CategoriesService } from './categories.service';
export declare class CategoriesModule implements OnModuleInit {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
    onModuleInit(): Promise<void>;
}
