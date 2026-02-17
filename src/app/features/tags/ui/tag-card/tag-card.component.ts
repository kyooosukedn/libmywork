import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Tag } from '@core/models';

@Component({
  selector: 'app-tag-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card hover:shadow-lg transition-shadow duration-200 cursor-pointer group">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3 flex-1" (click)="onTagClick()">
          <div 
            class="w-12 h-12 rounded-lg flex items-center justify-center text-white font-semibold"
            [style.backgroundColor]="tag.color"
          >
            {{ tag.name.substring(0, 2).toUpperCase() }}
          </div>
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ tag.name }}
            </h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Used {{ tag.usageCount }} {{ tag.usageCount === 1 ? 'time' : 'times' }}
            </p>
          </div>
        </div>
        
        <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            (click)="onEdit($event)"
            class="p-2 text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
            title="Edit tag"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            (click)="onDelete($event)"
            class="p-2 text-gray-600 hover:text-danger-600 dark:text-gray-400 dark:hover:text-danger-400"
            title="Delete tag"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  `,
})
export class TagCardComponent {
  @Input({ required: true }) tag!: Tag;
  @Output() edit = new EventEmitter<Tag>();
  @Output() delete = new EventEmitter<Tag>();
  @Output() click = new EventEmitter<Tag>();

  onTagClick() {
    this.click.emit(this.tag);
  }

  onEdit(event: Event) {
    event.stopPropagation();
    this.edit.emit(this.tag);
  }

  onDelete(event: Event) {
    event.stopPropagation();
    this.delete.emit(this.tag);
  }
}
