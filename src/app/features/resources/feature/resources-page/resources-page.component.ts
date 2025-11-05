import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResourcesStore } from '../../resources.store';
import { ResourceListComponent } from '../../ui/resource-list/resource-list.component';
import { ResourceSearchComponent } from '../../ui/resource-search/resource-search.component';
import { ResourceFormComponent } from '../../ui/resource-form/resource-form.component';
import { Resource, CreateResourceDto } from '@core/models';
import { ToastService } from '@core/services/toast.service';

@Component({
  selector: 'app-resources-page',
  standalone: true,
  imports: [
    CommonModule,
    ResourceListComponent,
    ResourceSearchComponent,
    ResourceFormComponent,
  ],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Resources</h1>
          <p class="text-gray-600 dark:text-gray-400 mt-1">
            Manage your documents, links, videos, and files
          </p>
        </div>
        <button
          (click)="onCreateResource()"
          class="btn btn-primary"
        >
          <svg class="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Add Resource
        </button>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Resources</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {{ stats().total }}
              </p>
            </div>
            <div class="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Favorites</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {{ stats().favorites }}
              </p>
            </div>
            <div class="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
              <span class="text-2xl">⭐</span>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Documents</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {{ stats().byType.documents }}
              </p>
            </div>
            <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <span class="text-2xl">📄</span>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Links</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {{ stats().byType.links }}
              </p>
            </div>
            <div class="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <span class="text-2xl">🔗</span>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <app-resource-search
          [searchTerm]="filters().search"
          (searchChanged)="onSearchChanged($event)"
        />
      </div>

      <div *ngIf="loading()" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>

      <div *ngIf="error()" class="card bg-danger-50 dark:bg-danger-900 border-danger-200 dark:border-danger-700">
        <div class="flex items-start gap-3">
          <svg class="w-6 h-6 text-danger-600 dark:text-danger-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div class="flex-1">
            <h3 class="text-danger-800 dark:text-danger-200 font-semibold">Error</h3>
            <p class="text-danger-700 dark:text-danger-300 mt-1">{{ error() }}</p>
          </div>
          <button
            (click)="clearError()"
            class="text-danger-600 hover:text-danger-800 dark:text-danger-400"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <app-resource-list
        [resources]="filteredResources()"
        (favoriteToggled)="onToggleFavorite($event)"
        (resourceViewed)="onViewResource($event)"
        (resourceEdited)="onEditResource($event)"
        (resourceDeleted)="onDeleteResource($event)"
        (createClicked)="onCreateResource()"
      />

      <app-resource-form
        [isOpen]="isFormOpen()"
        [resource]="editingResource()"
        [isSubmitting]="loading()"
        (closed)="onFormClosed()"
        (submitted)="onFormSubmitted($event)"
      />
    </div>
  `,
})
export class ResourcesPageComponent implements OnInit {
  private store = inject(ResourcesStore);
  private toastService = inject(ToastService);

  filteredResources = this.store.filteredResources;
  stats = this.store.stats;
  loading = this.store.loading;
  error = this.store.error;
  filters = this.store.filters;

  isFormOpen = signal(false);
  editingResource = signal<Resource | null>(null);

  ngOnInit(): void {
    this.store.loadResources();
  }

  onSearchChanged(searchTerm: string): void {
    this.store.updateFilters({ search: searchTerm });
  }

  onToggleFavorite(id: string): void {
    const resource = this.store.resources().find(r => r.id === id);
    const wasFavorite = resource?.isFavorite;
    this.store.toggleFavorite(id);

    if (wasFavorite) {
      this.toastService.info('Removed from favorites');
    } else {
      this.toastService.success('Added to favorites!');
    }
  }

  onViewResource(id: string): void {
    console.log('View resource:', id);
  }

  onEditResource(id: string): void {
    const resource = this.store.resources().find(r => r.id === id);
    if (resource) {
      this.editingResource.set(resource);
      this.isFormOpen.set(true);
    }
  }

  onDeleteResource(id: string): void {
    if (confirm('Are you sure you want to delete this resource?')) {
      this.store.deleteResource(id);
      this.toastService.success('Resource deleted successfully!');
    }
  }

  onCreateResource(): void {
    this.editingResource.set(null);
    this.isFormOpen.set(true);
  }

  onFormClosed(): void {
    this.isFormOpen.set(false);
    this.editingResource.set(null);
  }

  onFormSubmitted(data: CreateResourceDto): void {
    if (this.editingResource()) {
      this.store.updateResource({
        id: this.editingResource()!.id,
        updates: data
      });
      this.toastService.success('Resource updated successfully!');
    } else {
      this.store.addResource(data);
      this.toastService.success('Resource created successfully!');
    }
    this.onFormClosed();
  }

  clearError(): void {
    this.store.clearError();
  }
}
