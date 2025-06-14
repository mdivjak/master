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

    // Subscribe to complete form changes
    this.searchForm.valueChanges
      .pipe(
        debounceTime(300), // Debounce all changes
        distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
        takeUntil(this.destroy$)
      )
      .subscribe((formValue) => {
        this.emitCriteriaWithFormValue(formValue);
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private emitCriteriaWithFormValue(formValues: any) {
    const criteria: SearchCriteria = {};
    
    // Build criteria object with explicit field handling using passed formValues
    if (formValues.searchText && formValues.searchText.trim()) {
      criteria.searchText = formValues.searchText.trim();
    }
    
    if (formValues.difficulty && formValues.difficulty !== 'all') {
      criteria.difficulty = formValues.difficulty;
    }
    
    if (formValues.dateFrom && formValues.dateFrom.trim()) {
      criteria.dateFrom = new Date(formValues.dateFrom);
    }
    
    if (formValues.dateTo && formValues.dateTo.trim()) {
      criteria.dateTo = new Date(formValues.dateTo);
    }
    
    if (formValues.hasAvailableSpots) {
      criteria.hasAvailableSpots = formValues.hasAvailableSpots;
    }
    
    if (formValues.clubName && formValues.clubName.trim()) {
      criteria.clubName = formValues.clubName.trim();
    }
    
    if (formValues.sortBy) {
      criteria.sortBy = formValues.sortBy;
    }
    
    if (formValues.sortOrder) {
      criteria.sortOrder = formValues.sortOrder;
    }

    this.criteriaChange.emit(criteria);
  }

  private emitCriteria() {
    // Fallback method for direct calls (like from clear filters)
    this.emitCriteriaWithFormValue(this.searchForm.value);
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

  getSortDisplayText(): string {
    const values = this.searchForm.value;
    const sortByOption = this.sortOptions.find(option => option.value === values.sortBy);
    const sortByLabel = sortByOption ? sortByOption.label : 'Date';
    const sortOrderLabel = values.sortOrder === 'desc' ? 'Descending' : 'Ascending';
    
    return `${sortByLabel} (${sortOrderLabel})`;
  }
}