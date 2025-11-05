import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoryTree } from '@core/models';

@Component({
  selector: 'app-category-tree-item',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="category-tree-item">
      <div
        class="flex items-center gap-2 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
        [style.paddingLeft.rem]="category.level * 1.5 + 0.75"
      >
        <button
          *ngIf="category.children.length > 0"
          (click)="toggleExpand()"
          class="w-5 h-5 flex items-center justify-center text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        >
          <svg
            class="w-4 h-4 transition-transform"
            [class.rotate-90]="isExpanded()"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
        <div *ngIf="category.children.length === 0" class="w-5"></div>

        <div
          *ngIf="category.icon"
          class="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
          [style.backgroundColor]="category.color || '#e5e7eb'"
        >
          {{ category.icon }}
        </div>

        <div class="flex-1 min-w-0">
          <h3 class="text-sm font-medium text-gray-900 dark:text-white truncate">
            {{ category.name }}
          </h3>
          <p *ngIf="category.description" class="text-xs text-gray-500 dark:text-gray-400 truncate">
            {{ category.description }}
          </p>
        </div>

        <div class="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <span *ngIf="category.metadata.resourceCount" class="flex items-center gap-1">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            {{ category.metadata.resourceCount }}
          </span>
          <span *ngIf="category.metadata.noteCount" class="flex items-center gap-1">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {{ category.metadata.noteCount }}
          </span>
        </div>

        <div class="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
          <button
            (click)="onEdit()"
            class="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
            title="Edit"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            (click)="onDelete()"
            class="p-1.5 rounded hover:bg-danger-50 dark:hover:bg-danger-900/20 text-danger-600 dark:text-danger-400"
            title="Delete"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      <div *ngIf="isExpanded() && category.children.length > 0">
        <app-category-tree-item
          *ngFor="let child of category.children; trackBy: trackById"
          [category]="child"
          (edited)="edited.emit($event)"
          (deleted)="deleted.emit($event)"
        />
      </div>
    </div>
  `,
})
export class CategoryTreeItemComponent {
  @Input({ required: true }) category!: CategoryTree;
  @Output() edited = new EventEmitter<string>();
  @Output() deleted = new EventEmitter<string>();

  isExpanded = signal(true);

  toggleExpand(): void {
    this.isExpanded.update(v => !v);
  }

  onEdit(): void {
    this.edited.emit(this.category.id);
  }

  onDelete(): void {
    this.deleted.emit(this.category.id);
  }

  trackById(_index: number, item: CategoryTree): string {
    return item.id;
  }
}
