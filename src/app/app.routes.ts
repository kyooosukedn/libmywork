import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/feature/dashboard-page/dashboard-page.component').then(
        (m) => m.DashboardPageComponent
      ),
  },
  {
    path: 'resources',
    loadComponent: () =>
      import('./features/resources/feature/resources-page/resources-page.component').then(
        (m) => m.ResourcesPageComponent
      ),
  },
  {
    path: 'notes',
    loadComponent: () =>
      import('./features/notes/feature/notes-page/notes-page.component').then(
        (m) => m.NotesPageComponent
      ),
  },
  {
    path: 'categories',
    loadComponent: () =>
      import('./features/categories/feature/categories-page/categories-page.component').then(
        (m) => m.CategoriesPageComponent
      ),
  },
  {
    path: 'tags',
    loadComponent: () =>
      import('./features/tags/feature/tags-page/tags-page.component').then(
        (m) => m.TagsPageComponent
      ),
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
