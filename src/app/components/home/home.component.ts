import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Tour } from '../../models/tour';
import { SearchCriteria, FilterState } from '../../models/search';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TourService } from '../../services/tour.service';
import { SidebarMenuComponent } from "../sidebar-menu/sidebar-menu.component";
import { AuthService } from '../../services/auth.service';
import { TourCardComponent } from "../tour-card/tour-card.component";
import { SearchFiltersComponent } from "../search-filters/search-filters.component";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, SidebarMenuComponent, TourCardComponent, SearchFiltersComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  userType!: string | null;
  allTours: Tour[] = [];
  filteredTours: Tour[] = [];
  isSearching = false;
  
  searchCriteria: SearchCriteria = {};
  filterState: FilterState = {
    isActive: false,
    activeFilters: [],
    resultsCount: 0,
    totalCount: 0
  };

  constructor(
    private authService: AuthService,
    private tourService: TourService) {

    this.authService.userType$.subscribe((userType) => {
      this.userType = userType;
    });
  }

  async ngOnInit() {
    this.allTours = await this.tourService.getAllTours();
    this.filteredTours = [...this.allTours];
    this.updateFilterState();
  }

  // Getter for template compatibility
  get tours(): Tour[] {
    return this.filteredTours;
  }

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

  trackByTourId(index: number, tour: Tour): string {
    return tour.id || index.toString();
  }
}
