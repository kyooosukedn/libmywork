export enum ResourceType {
  Document = 'document',
  Link = 'link',
  Video = 'video',
  Code = 'code',
  File = 'file',
}

export interface ResourceMetadata {
  size?: number;
  fileType?: string;
  author?: string;
  readTime?: string;
  lastAccessed?: Date;
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  type: ResourceType;
  url?: string;
  filePath?: string;
  categoryId: string;
  tags: string[];
  isFavorite: boolean;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
  metadata: ResourceMetadata;
}

export interface ResourceFilters {
  search: string;
  type: ResourceType | null;
  categoryId: string | null;
  tags: string[];
  isFavorite: boolean;
  isArchived: boolean;
}

export type CreateResourceDto = Omit<Resource, 'id' | 'createdAt' | 'updatedAt'>;

export type UpdateResourceDto = Partial<Omit<Resource, 'id' | 'createdAt' | 'updatedAt'>>;

export interface ResourceStats {
  total: number;
  favorites: number;
  archived: number;
  byType: {
    documents: number;
    links: number;
    videos: number;
    code: number;
    files: number;
  };
}
