import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Tour } from '../../models/tour';
import { TourService } from '../../services/tour.service';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { MapComponent } from "../map/map.component";
import { LoggingService } from '../../services/logging-service.service';

@Component({
  selector: 'app-tour-details',
  standalone: true,
  imports: [NgIf, NgClass, MapComponent, NgFor],
  templateUrl: './tour-details.component.html',
  styleUrl: './tour-details.component.css'
})
export class TourDetailsComponent {
  tour!: Tour;
  userId!: string;
  isHiker: boolean = false;
  hasApplied: boolean = false;

  constructor(
    private loggingService: LoggingService,
    private route: ActivatedRoute, 
    private tourService: TourService,
    private authService: AuthService,
    private router: Router) {}

  async ngOnInit(): Promise<void> {
    const tourId = this.route.snapshot.paramMap.get('id');
    this.loggingService.debug('TourDetailsComponent Tour ID from route:', tourId);

    if (tourId) {
      await this.getTour(tourId);
    } else {
      this.router.navigate(['/']);
    }

    this.authService.user$.subscribe(async user => {
      this.loggingService.debug('TourDetailsComponent Current user:', user);
      const userId = user?.uid;

      if (userId) {
        this.userId = userId;
        this.hasApplied = await this.checkIfUserHasApplied(this.tour.id!, this.userId);
        this.loggingService.debug('TourDetailsComponent User has applied:', this.hasApplied);
      }
    });

    this.authService.userType$.subscribe(userType => {
      this.loggingService.debug('TourDetailsComponent User type:', userType);
      if (userType === 'hiker') {
        this.isHiker = true;
      }
    });
  }

  async getTour(tourId: string) {
    const tour = await this.tourService.getTour(tourId) as Tour ?? null;
    if(!tour) {
      this.loggingService.error('TourDetailsComponent Tour not found:', tourId);
      this.router.navigate(['/']);
    } else {
      this.loggingService.debug('TourDetailsComponent Tour successfully retrieved:', tour);
      this.tour = tour;
    }
  }

  async applyForTour() {
    const currentUser = this.authService.currentUser;
    if (currentUser) {
      this.loggingService.debug('TourDetailsComponent Applying for tour:', this.tour.id, 'User ID:', currentUser.uid);
      await this.tourService.applyForTour(this.tour.id!, currentUser.uid, this.authService.currentUserData?.name!, this.authService.currentUserData?.photo!);
      this.hasApplied = true;
    } else {
      this.loggingService.error('TourDetailsComponent User not logged in, cannot apply for tour');
      this.router.navigate(['/']);
    }
  }

  async checkIfUserHasApplied(tourId: string, userId: string): Promise<boolean> {
    this.loggingService.debug('TourDetailsComponent Checking if user has applied for tour:', tourId, 'User ID:', userId);
    let applications = await this.tourService.getUserApplication(tourId, userId);
    this.loggingService.debug('TourDetailsComponent Applications:', applications);
    if (applications == null) {
      this.loggingService.debug('TourDetailsComponent User has not applied for this tour');
      return false;
    } else {
      this.loggingService.debug('TourDetailsComponent User has applied for this tour');
      return true;
    }
  }

}
