import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseHttpService } from '@core/services/base-http.service';
import { Tag, CreateTagDto, UpdateTagDto } from '@core/models';

@Injectable({ providedIn: 'root' })
export class TagService extends BaseHttpService {
  protected apiPath = '/tags';

  getAll(): Observable<Tag[]> {
    return this.get<Tag[]>();
  }

  getById(id: string): Observable<Tag> {
    return this.get<Tag>(`/${id}`);
  }

  create(tag: CreateTagDto): Observable<Tag> {
    return this.post<Tag>('', tag);
  }

  update(id: string, updates: UpdateTagDto): Observable<Tag> {
    return this.patch<Tag>(`/${id}`, updates);
  }

  deleteTag(id: string): Observable<void> {
    return super.delete<void>(`/${id}`);
  }
}
