export interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  parentId: string | null;
  order: number;
  createdAt: Date;
  updatedAt: Date;
  metadata: CategoryMetadata;
}

export interface CategoryMetadata {
  resourceCount?: number;
  noteCount?: number;
  childrenCount?: number;
  totalDescendants?: number;
  path?: string[];
}

export interface CategoryTree extends Category {
  children: CategoryTree[];
  level: number;
}

export type CreateCategoryDto = Omit<Category, 'id' | 'createdAt' | 'updatedAt'>;

export type UpdateCategoryDto = Partial<Omit<Category, 'id' | 'createdAt' | 'updatedAt'>>;

export interface CategoryFilters {
  search: string;
  parentId: string | null;
  showEmpty: boolean;
}

export interface CategoryStats {
  total: number;
  rootCategories: number;
  maxDepth: number;
  totalResources: number;
  totalNotes: number;
}

export interface MoveCategoryDto {
  categoryId: string;
  newParentId: string | null;
  newOrder?: number;
}
