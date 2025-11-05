import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-resource-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative">
      <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <svg
          class="w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      <input
        type="text"
        [(ngModel)]="searchValue"
        (ngModelChange)="onSearchChange($event)"
        [placeholder]="placeholder"
        class="input pl-12 pr-10"
      />

      <button
        *ngIf="searchValue"
        (click)="clearSearch()"
        class="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        type="button"
        aria-label="Clear search"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  `,
})
export class ResourceSearchComponent implements OnInit, OnDestroy {
  @Input() placeholder = 'Search resources...';
  @Input() debounceMs = 300;

  private _searchTerm = '';
  @Input()
  set searchTerm(value: string) {
    this._searchTerm = value;
    this.searchValue = value;
  }
  get searchTerm(): string {
    return this._searchTerm;
  }

  @Output() searchChanged = new EventEmitter<string>();

  searchValue = '';
  private searchSubject = new Subject<string>();

  ngOnInit(): void {
    this.searchSubject
      .pipe(
        debounceTime(this.debounceMs),
        distinctUntilChanged()
      )
      .subscribe((searchTerm) => {
        this.searchChanged.emit(searchTerm);
      });
  }

  ngOnDestroy(): void {
    this.searchSubject.complete();
  }

  onSearchChange(value: string): void {
    this.searchSubject.next(value);
  }

  clearSearch(): void {
    this.searchValue = '';
    this.searchSubject.next('');
  }
}
