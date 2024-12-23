import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Tour } from '../../models/tour';
import { TourService } from '../../services/tour.service';
import { NgClass, NgIf } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { MapComponent } from "../map/map.component";

@Component({
  selector: 'app-tour-details',
  standalone: true,
  imports: [NgIf, NgClass, MapComponent],
  templateUrl: './tour-details.component.html',
  styleUrl: './tour-details.component.css'
})
export class TourDetailsComponent {
  tour!: Tour;
  userId!: string;
  isHiker: boolean = false;
  hasApplied: boolean = false;

  constructor(
    private route: ActivatedRoute, 
    private tourService: TourService,
    private authService: AuthService,
    private router: Router) {}

  /**
   * Initializes the component by loading tour details and setting user-specific properties.
   * 
   * - Retrieves the tour ID from the route parameters.
   * - Loads the tour details if the tour ID is available, otherwise navigates to the home page.
   * - Subscribes to the user observable to get the current user and checks if the user has applied for the tour.
   * - Subscribes to the userType observable to determine if the current user is a hiker.
   * 
   * @returns {Promise<void>} A promise that resolves when the initialization is complete.
   */
  async ngOnInit(): Promise<void> {
    const tourId = this.route.snapshot.paramMap.get('id');

    // load tour details
    if (tourId) {
      await this.loadTour(tourId);
    } else {
      this.router.navigate(['/']);
    }

    this.authService.user$.subscribe(async user => {
      const userId = user?.uid;

      if (userId) {
        this.userId = userId;
        this.hasApplied = await this.checkIfUserHasApplied(this.tour.id!, this.userId);
      }
    });

    this.authService.userType$.subscribe(userType => {
      if (userType === 'hiker') {
        this.isHiker = true;
      }
    });
  }

  async loadTour(tourId: string) {
    const tour = await this.tourService.loadTour(tourId) ?? null;
    if(!tour) {
      this.router.navigate(['/']);
    } else {
      this.tour = tour;
    }
  }

  async applyForTour() {
    const currentUser = this.authService.currentUser;
    if (currentUser) {
      await this.tourService.applyForTour(this.tour.id!, this.tour.createdBy, currentUser.uid);
      this.hasApplied = true;
    } else {
      this.router.navigate(['/']);
    }
  }

  async checkIfUserHasApplied(tourId: string, userId: string): Promise<boolean> {
    return this.tourService.hasUserApplied(tourId, userId);
  }

}
