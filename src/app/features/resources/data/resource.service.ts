import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseHttpService } from '@core/services/base-http.service';
import { Resource, CreateResourceDto, UpdateResourceDto } from '@core/models';

@Injectable({ providedIn: 'root' })
export class ResourceService extends BaseHttpService {
  protected apiPath = '/resources';

  getAll(): Observable<Resource[]> {
    return this.get<Resource[]>();
  }

  getById(id: string): Observable<Resource> {
    return this.get<Resource>(`/${id}`);
  }

  create(resource: CreateResourceDto): Observable<Resource> {
    return this.post<Resource>('', resource);
  }

  update(id: string, updates: UpdateResourceDto): Observable<Resource> {
    return this.patch<Resource>(`/${id}`, updates);
  }

  deleteResource(id: string): Observable<void> {
    return super.delete<void>(`/${id}`);
  }

  toggleFavorite(id: string, isFavorite: boolean): Observable<Resource> {
    return this.patch<Resource>(`/${id}`, { isFavorite });
  }

  archive(id: string): Observable<Resource> {
    return this.patch<Resource>(`/${id}`, { isArchived: true });
  }

  unarchive(id: string): Observable<Resource> {
    return this.patch<Resource>(`/${id}`, { isArchived: false });
  }
}
