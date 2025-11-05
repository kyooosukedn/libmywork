import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseHttpService } from '@core/services/base-http.service';
import { Note, CreateNoteDto, UpdateNoteDto } from '@core/models';

@Injectable({ providedIn: 'root' })
export class NoteService extends BaseHttpService {
  protected apiPath = '/notes';

  getAll(): Observable<Note[]> {
    return this.get<Note[]>();
  }

  getById(id: string): Observable<Note> {
    return this.get<Note>(`/${id}`);
  }

  create(note: CreateNoteDto): Observable<Note> {
    return this.post<Note>('', note);
  }

  update(id: string, updates: UpdateNoteDto): Observable<Note> {
    return this.patch<Note>(`/${id}`, updates);
  }

  deleteNote(id: string): Observable<void> {
    return super.delete<void>(`/${id}`);
  }

  togglePin(id: string, isPinned: boolean): Observable<Note> {
    return this.patch<Note>(`/${id}`, { isPinned });
  }

  archive(id: string): Observable<Note> {
    return this.patch<Note>(`/${id}`, { isArchived: true });
  }

  unarchive(id: string): Observable<Note> {
    return this.patch<Note>(`/${id}`, { isArchived: false });
  }
}
