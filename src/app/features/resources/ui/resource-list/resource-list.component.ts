import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Resource } from '@core/models';
import { ResourceCardComponent } from '../resource-card/resource-card.component';

@Component({
  selector: 'app-resource-list',
  standalone: true,
  imports: [CommonModule, ResourceCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div *ngIf="resources.length === 0" class="text-center py-16">
      <div class="inline-flex items-center justify-center w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
        <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
      </div>
      <h3 class="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
        {{ emptyTitle }}
      </h3>
      <p class="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
        {{ emptyMessage }}
      </p>
      <button
        *ngIf="showCreateButton"
        (click)="onCreateClick()"
        class="btn btn-primary"
      >
        <svg class="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Create Resource
      </button>
    </div>

    <div
      *ngIf="resources.length > 0"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      <app-resource-card
        *ngFor="let resource of resources; trackBy: trackByResourceId"
        [resource]="resource"
        (favoriteToggled)="onFavoriteToggled($event)"
        (viewed)="onResourceViewed($event)"
        (edited)="onResourceEdited($event)"
        (deleted)="onResourceDeleted($event)"
      />
    </div>

    <div
      *ngIf="resources.length > 0 && showCount"
      class="mt-6 text-center text-sm text-gray-500 dark:text-gray-400"
    >
      Showing {{ resources.length }} {{ resources.length === 1 ? 'resource' : 'resources' }}
    </div>
  `,
})
export class ResourceListComponent {
  @Input({ required: true }) resources: Resource[] = [];
  @Input() emptyTitle = 'No resources found';
  @Input() emptyMessage = 'Try adjusting your filters or create a new resource';
  @Input() showCreateButton = true;
  @Input() showCount = true;

  @Output() favoriteToggled = new EventEmitter<string>();
  @Output() resourceViewed = new EventEmitter<string>();
  @Output() resourceEdited = new EventEmitter<string>();
  @Output() resourceDeleted = new EventEmitter<string>();
  @Output() createClicked = new EventEmitter<void>();

  trackByResourceId(index: number, resource: Resource): string {
    return resource.id;
  }

  onFavoriteToggled(id: string): void {
    this.favoriteToggled.emit(id);
  }

  onResourceViewed(id: string): void {
    this.resourceViewed.emit(id);
  }

  onResourceEdited(id: string): void {
    this.resourceEdited.emit(id);
  }

  onResourceDeleted(id: string): void {
    this.resourceDeleted.emit(id);
  }

  onCreateClick(): void {
    this.createClicked.emit();
  }
}
