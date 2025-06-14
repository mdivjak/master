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