import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tags-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Tags</h1>
          <p class="text-gray-600 dark:text-gray-400 mt-1">
            Manage tags for flexible organization
          </p>
        </div>
        <button class="btn btn-primary">Add Tag</button>
      </div>

      <div class="card text-center py-12">
        <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
        <h3 class="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
          No tags yet
        </h3>
        <p class="text-gray-500 dark:text-gray-400 mb-6">
          Create tags to cross-reference your content
        </p>
        <button class="btn btn-primary">Create Tag</button>
      </div>
    </div>
  `,
})
export class TagsPageComponent {}
