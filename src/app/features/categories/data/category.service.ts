import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseHttpService } from '@core/services/base-http.service';
import { Category, CreateCategoryDto, UpdateCategoryDto, MoveCategoryDto } from '@core/models';

@Injectable({ providedIn: 'root' })
export class CategoryService extends BaseHttpService {
  protected apiPath = '/categories';

  getAll(): Observable<Category[]> {
    return this.get<Category[]>();
  }

  getById(id: string): Observable<Category> {
    return this.get<Category>(`/${id}`);
  }

  getRootCategories(): Observable<Category[]> {
    return this.get<Category[]>('?parentId=null');
  }

  getChildren(parentId: string): Observable<Category[]> {
    return this.get<Category[]>(`?parentId=${parentId}`);
  }

  create(category: CreateCategoryDto): Observable<Category> {
    return this.post<Category>('', category);
  }

  update(id: string, updates: UpdateCategoryDto): Observable<Category> {
    return this.patch<Category>(`/${id}`, updates);
  }

  deleteCategory(id: string): Observable<void> {
    return super.delete<void>(`/${id}`);
  }

  moveCategory(dto: MoveCategoryDto): Observable<Category> {
    return this.patch<Category>(`/${dto.categoryId}`, {
      parentId: dto.newParentId,
      order: dto.newOrder,
    });
  }

  reorder(categoryIds: string[], parentId: string | null): Observable<void> {
    return this.post<void>('/reorder', { categoryIds, parentId });
  }
}
