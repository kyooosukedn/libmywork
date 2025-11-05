export interface Note {
  id: string;
  title: string;
  content: string;
  categoryId: string;
  tags: string[];
  isPinned: boolean;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
  metadata: NoteMetadata;
}

export interface NoteMetadata {
  wordCount?: number;
  readingTimeMinutes?: number;
  lastEditedBy?: string;
  version?: number;
}

export type CreateNoteDto = Omit<Note, 'id' | 'createdAt' | 'updatedAt'>;

export type UpdateNoteDto = Partial<Omit<Note, 'id' | 'createdAt' | 'updatedAt'>>;

export interface NoteFilters {
  search: string;
  categoryId: string | null;
  tags: string[];
  isPinned: boolean;
  isArchived: boolean;
}

export interface NoteStats {
  total: number;
  pinned: number;
  archived: number;
  totalWords: number;
}
