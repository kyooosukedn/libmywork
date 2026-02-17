/**
 * Tag Model
 * Represents a tag for cross-referencing content
 */

export interface Tag {
  id: string;
  name: string;
  color: string;
  usageCount: number;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateTagDto {
  name: string;
  color: string;
}

export interface UpdateTagDto {
  name?: string;
  color?: string;
}

export interface TagFilters {
  search?: string;
  sortBy?: 'name' | 'usageCount' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface TagStats {
  total: number;
  totalUsage: number;
  mostUsed: Tag | null;
}
