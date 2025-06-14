# Tour Search & Filtering Implementation Plan

## Overview
This document provides a detailed implementation plan for adding comprehensive search and filtering functionality to the mountaineering club application's tour browsing experience.

## Current State Analysis
- **HomeComponent** displays all tours without filtering
- **UI elements exist** but are not functional (difficulty dropdown and filter button on lines 69-91)
- **No search input field** exists
- **TourService** only has `getAllTours()` method
- **Tour data structure** includes: name, description, location, difficulty, date, clubName, maxParticipants, participantsIds

## Implementation Steps

### Step 1: Create Search/Filter Interface Models

**File: `src/app/models/search.ts`**
```typescript
export interface SearchCriteria {
  searchText?: string;
  difficulty?: string;
  dateFrom?: Date;
  dateTo?: Date;
  hasAvailableSpots?: boolean;
  clubName?: string;
  sortBy?: 'date' | 'difficulty' | 'participants' | 'name' | 'clubName';
  sortOrder?: 'asc' | 'desc';
}

export interface FilterState {
  isActive: boolean;
  activeFilters: string[];
  resultsCount: number;
  totalCount: number;
}

export interface SearchConfig {
  debounceTime: number;
  minSearchLength: number;
  maxResults?: number;
}
```

### Step 2: Enhance TourService with Search Methods

**File: `src/app/services/tour.service.ts`**

Add the following methods:

```typescript
// Main search method that combines all filters
async searchTours(criteria: SearchCriteria): Promise<Tour[]> {
  const allTours = await this.getAllTours();
  let filteredTours = [...allTours];

  // Apply text search
  if (criteria.searchText && criteria.searchText.trim().length >= 2) {
    filteredTours = this.filterToursByText(filteredTours, criteria.searchText);
  }

  // Apply difficulty filter
  if (criteria.difficulty && criteria.difficulty !== 'all') {
    filteredTours = this.filterToursByDifficulty(filteredTours, criteria.difficulty);
  }

  // Apply date range filter
  if (criteria.dateFrom || criteria.dateTo) {
    filteredTours = this.filterToursByDateRange(filteredTours, criteria.dateFrom, criteria.dateTo);
  }

  // Apply available spots filter
  if (criteria.hasAvailableSpots) {
    filteredTours = this.filterByAvailableSpots(filteredTours);
  }

  // Apply club name filter
  if (criteria.clubName && criteria.clubName.trim()) {
    filteredTours = this.filterToursByClubName(filteredTours, criteria.clubName);
  }

  // Apply sorting
  if (criteria.sortBy) {
    filteredTours = this.sortTours(filteredTours, criteria.sortBy, criteria.sortOrder || 'asc');
  }

  return filteredTours;
}

// Individual filter methods
private filterToursByText(tours: Tour[], searchText: string): Tour[] {
  const query = searchText.toLowerCase().trim();
  return tours.filter(tour => 
    tour.name.toLowerCase().includes(query) ||
    tour.description.toLowerCase().includes(query) ||
    tour.location.toLowerCase().includes(query) ||
    tour.clubName.toLowerCase().includes(query)
  );
}

private filterToursByDifficulty(tours: Tour[], difficulty: string): Tour[] {
  return tours.filter(tour => tour.difficulty === difficulty);
}

private filterToursByDateRange(tours: Tour[], startDate?: Date, endDate?: Date): Tour[] {
  return tours.filter(tour => {
    const tourDate = new Date(tour.date);
    const isAfterStart = !startDate || tourDate >= startDate;
    const isBeforeEnd = !endDate || tourDate <= endDate;
    return isAfterStart && isBeforeEnd;
  });
}

private filterByAvailableSpots(tours: Tour[]): Tour[] {
  return tours.filter(tour => 
    tour.maxParticipants - tour.participantsIds.length > 0
  );
}

private filterToursByClubName(tours: Tour[], clubName: string): Tour[] {
  const query = clubName.toLowerCase().trim();
  return tours.filter(tour => 
    tour.clubName.toLowerCase().includes(query)
  );
}

private sortTours(tours: Tour[], sortBy: string, order: string): Tour[] {
  return tours.sort((a, b) => {
    let aValue: any, bValue: any;
    
    switch (sortBy) {
      case 'date':
        aValue = new Date(a.date).getTime();
        bValue = new Date(b.date).getTime();
        break;
      case 'difficulty':
        const difficultyOrder = { 'easy': 1, 'moderate': 2, 'hard': 3 };
        aValue = difficultyOrder[a.difficulty as keyof typeof difficultyOrder] || 0;
        bValue = difficultyOrder[b.difficulty as keyof typeof difficultyOrder] || 0;
        break;
      case 'participants':
        aValue = a.participantsIds.length;
        bValue = b.participantsIds.length;
        break;
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'clubName':
        aValue = a.clubName.toLowerCase();
        bValue = b.clubName.toLowerCase();
        break;
      default:
        return 0;
    }
    
    if (order === 'desc') {
      return bValue > aValue ? 1 : bValue < aValue ? -1 : 0;
    } else {
      return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
    }
  });
}
```

### Step 3: Create SearchFiltersComponent

**File: `src/app/components/search-filters/search-filters.component.ts`**

```typescript
import { Component, EventEmitter, Input, Output, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { SearchCriteria, FilterState } from '../../models/search';

@Component({
  selector: 'app-search-filters',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './search-filters.component.html',
  styleUrl: './search-filters.component.css'
})
export class SearchFiltersComponent implements OnInit, OnDestroy {
  @Input() initialCriteria: SearchCriteria = {};
  @Input() filterState: FilterState = { isActive: false, activeFilters: [], resultsCount: 0, totalCount: 0 };
  @Output() criteriaChange = new EventEmitter<SearchCriteria>();
  @Output() clearFilters = new EventEmitter<void>();

  searchForm: FormGroup;
  showAdvancedFilters = false;
  private destroy$ = new Subject<void>();

  difficultyOptions = [
    { value: 'all', label: 'All Difficulties' },
    { value: 'easy', label: 'Easy' },
    { value: 'moderate', label: 'Moderate' },
    { value: 'hard', label: 'Hard' }
  ];

  sortOptions = [
    { value: 'date', label: 'Date' },
    { value: 'name', label: 'Tour Name' },
    { value: 'difficulty', label: 'Difficulty' },
    { value: 'participants', label: 'Participants' },
    { value: 'clubName', label: 'Club Name' }
  ];

  constructor(private fb: FormBuilder) {
    this.searchForm = this.fb.group({
      searchText: [''],
      difficulty: ['all'],
      dateFrom: [''],
      dateTo: [''],
      hasAvailableSpots: [false],
      clubName: [''],
      sortBy: ['date'],
      sortOrder: ['asc']
    });
  }

  ngOnInit() {
    // Set initial values
    this.searchForm.patchValue(this.initialCriteria);

    // Subscribe to form changes with debounce for search text
    this.searchForm.get('searchText')?.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => this.emitCriteria());

    // Subscribe to other form changes immediately
    this.searchForm.valueChanges
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe((value) => {
        // Skip if only search text changed (handled above)
        if (this.searchForm.get('searchText')?.dirty && 
            Object.keys(this.searchForm.controls).filter(key => 
              key !== 'searchText' && this.searchForm.get(key)?.dirty
            ).length === 0) {
          return;
        }
        this.emitCriteria();
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private emitCriteria() {
    const criteria: SearchCriteria = { ...this.searchForm.value };
    
    // Clean up empty values
    Object.keys(criteria).forEach(key => {
      const value = (criteria as any)[key];
      if (value === '' || value === 'all' || value === null) {
        delete (criteria as any)[key];
      }
    });

    this.criteriaChange.emit(criteria);
  }

  toggleAdvancedFilters() {
    this.showAdvancedFilters = !this.showAdvancedFilters;
  }

  onClearFilters() {
    this.searchForm.reset({
      searchText: '',
      difficulty: 'all',
      dateFrom: '',
      dateTo: '',
      hasAvailableSpots: false,
      clubName: '',
      sortBy: 'date',
      sortOrder: 'asc'
    });
    this.clearFilters.emit();
  }

  getActiveFiltersCount(): number {
    const values = this.searchForm.value;
    let count = 0;
    
    if (values.searchText) count++;
    if (values.difficulty && values.difficulty !== 'all') count++;
    if (values.dateFrom || values.dateTo) count++;
    if (values.hasAvailableSpots) count++;
    if (values.clubName) count++;
    
    return count;
  }
}
```

### Step 4: Update HomeComponent

**File: `src/app/components/home/home.component.ts`**

Add the following properties and methods:

```typescript
// Add imports
import { SearchFiltersComponent } from '../search-filters/search-filters.component';
import { SearchCriteria, FilterState } from '../../models/search';

// Add to component class
searchCriteria: SearchCriteria = {};
filterState: FilterState = {
  isActive: false,
  activeFilters: [],
  resultsCount: 0,
  totalCount: 0
};
allTours: Tour[] = [];
filteredTours: Tour[] = [];
isSearching = false;

// Modify ngOnInit
async ngOnInit() {
  this.allTours = await this.tourService.getAllTours();
  this.filteredTours = [...this.allTours];
  this.updateFilterState();
}

// Add new methods
async onSearchCriteriaChange(criteria: SearchCriteria) {
  this.isSearching = true;
  this.searchCriteria = criteria;
  
  try {
    this.filteredTours = await this.tourService.searchTours(criteria);
    this.updateFilterState();
  } catch (error) {
    console.error('Search failed:', error);
    this.filteredTours = [...this.allTours];
  } finally {
    this.isSearching = false;
  }
}

onClearFilters() {
  this.searchCriteria = {};
  this.filteredTours = [...this.allTours];
  this.updateFilterState();
}

private updateFilterState() {
  const activeFilters: string[] = [];
  
  if (this.searchCriteria.searchText) {
    activeFilters.push(`Search: "${this.searchCriteria.searchText}"`);
  }
  if (this.searchCriteria.difficulty) {
    activeFilters.push(`Difficulty: ${this.searchCriteria.difficulty}`);
  }
  if (this.searchCriteria.dateFrom || this.searchCriteria.dateTo) {
    activeFilters.push('Date range');
  }
  if (this.searchCriteria.hasAvailableSpots) {
    activeFilters.push('Available spots');
  }
  if (this.searchCriteria.clubName) {
    activeFilters.push(`Club: "${this.searchCriteria.clubName}"`);
  }

  this.filterState = {
    isActive: activeFilters.length > 0,
    activeFilters,
    resultsCount: this.filteredTours.length,
    totalCount: this.allTours.length
  };
}

// Update the tours property getter
get tours(): Tour[] {
  return this.filteredTours;
}
```

### Step 5: Update HomeComponent Template

**File: `src/app/components/home/home.component.html`**

Replace the existing filter section (lines 68-92) with:

```html
<!-- Search and Filters Section -->
<div class="mb-8">
  <app-search-filters
    [initialCriteria]="searchCriteria"
    [filterState]="filterState"
    (criteriaChange)="onSearchCriteriaChange($event)"
    (clearFilters)="onClearFilters()">
  </app-search-filters>
  
  <!-- Results Summary -->
  <div *ngIf="filterState.isActive" class="mt-4 flex items-center justify-between">
    <div class="text-sm text-stone-600">
      <span class="font-semibold">{{ filterState.resultsCount }}</span> 
      of {{ filterState.totalCount }} tours found
    </div>
    
    <!-- Active Filters Display -->
    <div class="flex flex-wrap gap-2">
      <span *ngFor="let filter of filterState.activeFilters"
            class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-forest-100 text-forest-800 border border-forest-200">
        {{ filter }}
      </span>
    </div>
  </div>
  
  <!-- Loading State -->
  <div *ngIf="isSearching" class="mt-4 text-center">
    <div class="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-white bg-forest-500 transition ease-in-out duration-150">
      <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Searching tours...
    </div>
  </div>
</div>
```

## Implementation Order

1. **Create search models** (`src/app/models/search.ts`)
2. **Enhance TourService** with search methods
3. **Create SearchFiltersComponent** with template and styles
4. **Update HomeComponent** logic
5. **Update HomeComponent** template
6. **Test and refine** search functionality

## Technical Considerations

### Performance Optimizations
- **Debounced search** (300ms) to avoid excessive API calls
- **Client-side filtering** for fast response times
- **Memoization** of search results where possible

### User Experience
- **Progressive disclosure** of advanced filters
- **Clear visual feedback** for active filters
- **Loading states** during search operations
- **Results count** and summary information

### Responsive Design
- **Mobile-first** filter interface
- **Collapsible** advanced filters on small screens
- **Touch-friendly** filter controls

## Future Enhancements
- **Server-side search** for better performance with large datasets
- **Search suggestions** and autocomplete
- **Saved searches** for logged-in users
- **Search analytics** and popular searches

---

**Document Created:** 2025-06-14  
**Next Steps:** Begin implementation with search models and TourService enhancements