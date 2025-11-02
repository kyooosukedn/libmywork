import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-resources-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Resources</h1>
          <p class="text-gray-600 dark:text-gray-400 mt-1">
            Manage your documents, links, and files
          </p>
        </div>
        <button class="btn btn-primary">Add Resource</button>
      </div>

      <div class="card text-center py-12">
        <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
        <h3 class="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
          No resources yet
        </h3>
        <p class="text-gray-500 dark:text-gray-400 mb-6">
          Get started by creating your first resource
        </p>
        <button class="btn btn-primary">Create Resource</button>
      </div>
    </div>
  `,
})
export class ResourcesPageComponent {}
