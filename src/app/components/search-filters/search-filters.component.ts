import { Component, EventEmitter, Input, Output, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
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

    // Subscribe to search text changes with debounce
    this.searchForm.get('searchText')?.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => this.emitCriteria());

    // Subscribe to other form changes immediately (except searchText)
    ['difficulty', 'dateFrom', 'dateTo', 'hasAvailableSpots', 'clubName', 'sortBy', 'sortOrder'].forEach(controlName => {
      this.searchForm.get(controlName)?.valueChanges
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => this.emitCriteria());
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

    // Convert date strings to Date objects if present
    if (criteria.dateFrom) {
      criteria.dateFrom = new Date(criteria.dateFrom);
    }
    if (criteria.dateTo) {
      criteria.dateTo = new Date(criteria.dateTo);
    }

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