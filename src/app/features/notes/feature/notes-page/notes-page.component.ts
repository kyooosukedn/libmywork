import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-notes-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Notes</h1>
          <p class="text-gray-600 dark:text-gray-400 mt-1">
            Create and organize your notes
          </p>
        </div>
        <button class="btn btn-primary">New Note</button>
      </div>

      <div class="card text-center py-12">
        <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        <h3 class="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
          No notes yet
        </h3>
        <p class="text-gray-500 dark:text-gray-400 mb-6">
          Start documenting your ideas and knowledge
        </p>
        <button class="btn btn-primary">Create Note</button>
      </div>
    </div>
  `,
})
export class NotesPageComponent {}
