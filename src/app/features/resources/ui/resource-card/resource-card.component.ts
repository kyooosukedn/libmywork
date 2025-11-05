import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { Resource, ResourceType } from '@core/models';

@Component({
  selector: 'app-resource-card',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="card hover:shadow-xl transition-all duration-200 group">
      <!-- Header -->
      <div class="flex justify-between items-start mb-3">
        <!-- Type Icon & Title -->
        <div class="flex items-start gap-3 flex-1">
          <div [class]="getTypeIconClasses()">
            <span class="text-2xl">{{ getTypeIcon() }}</span>
          </div>
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
              {{ resource.title }}
            </h3>
          </div>
        </div>

        <!-- Favorite Button -->
        <button
          (click)="onFavoriteClick()"
          class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          [attr.aria-label]="resource.isFavorite ? 'Remove from favorites' : 'Add to favorites'"
        >
          <svg
            class="w-5 h-5 transition-colors"
            [class.text-yellow-500]="resource.isFavorite"
            [class.text-gray-400]="!resource.isFavorite"
            [class.fill-current]="resource.isFavorite"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
            />
          </svg>
        </button>
      </div>

      <!-- Description -->
      <p class="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
        {{ resource.description }}
      </p>

      <!-- Tags -->
      <div class="flex flex-wrap gap-2 mb-4" *ngIf="resource.tags.length > 0">
        <span
          *ngFor="let tag of resource.tags.slice(0, 3)"
          class="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md text-xs"
        >
          #{{ tag }}
        </span>
        <span
          *ngIf="resource.tags.length > 3"
          class="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-md text-xs"
        >
          +{{ resource.tags.length - 3 }}
        </span>
      </div>

      <!-- Footer Actions -->
      <div class="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
        <!-- Metadata -->
        <div class="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{{ getFormattedDate(resource.createdAt) }}</span>
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            (click)="onViewClick()"
            class="p-2 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900 rounded-lg transition-colors"
            title="View"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          </button>

          <button
            (click)="onEditClick()"
            class="p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Edit"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>

          <button
            (click)="onDeleteClick()"
            class="p-2 text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-900 rounded-lg transition-colors"
            title="Delete"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  `,
})
export class ResourceCardComponent {
  @Input({ required: true }) resource!: Resource;

  @Output() favoriteToggled = new EventEmitter<string>();
  @Output() viewed = new EventEmitter<string>();
  @Output() edited = new EventEmitter<string>();
  @Output() deleted = new EventEmitter<string>();

  getTypeIcon(): string {
    const icons = {
      [ResourceType.Document]: '📄',
      [ResourceType.Link]: '🔗',
      [ResourceType.Video]: '🎥',
      [ResourceType.Code]: '💻',
      [ResourceType.File]: '📁',
    };
    return icons[this.resource.type] || '📄';
  }

  getTypeIconClasses(): string {
    const baseClasses = 'w-10 h-10 rounded-lg flex items-center justify-center';
    const typeClasses = {
      [ResourceType.Document]: 'bg-primary-100 dark:bg-primary-900',
      [ResourceType.Link]: 'bg-success-100 dark:bg-success-900',
      [ResourceType.Video]: 'bg-purple-100 dark:bg-purple-900',
      [ResourceType.Code]: 'bg-warning-100 dark:bg-warning-900',
      [ResourceType.File]: 'bg-secondary-100 dark:bg-secondary-800',
    };
    return `${baseClasses} ${typeClasses[this.resource.type] || typeClasses[ResourceType.Document]}`;
  }

  getFormattedDate(date: Date): string {
    const d = new Date(date);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - d.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
    return `${Math.floor(diffDays / 365)}y ago`;
  }

  onFavoriteClick(): void {
    this.favoriteToggled.emit(this.resource.id);
  }

  onViewClick(): void {
    this.viewed.emit(this.resource.id);
  }

  onEditClick(): void {
    this.edited.emit(this.resource.id);
  }

  onDeleteClick(): void {
    this.deleted.emit(this.resource.id);
  }
}
