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

  async ngOnInit(): Promise<void> {
    const tourId = this.route.snapshot.paramMap.get('id');

    if (tourId) {
      await this.getTour(tourId);
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

  async getTour(tourId: string) {
    const tour = await this.tourService.getTour(tourId) as Tour ?? null;
    if(!tour) {
      this.router.navigate(['/']);
    } else {
      this.tour = tour;
    }
  }

  async applyForTour() {
    const currentUser = this.authService.currentUser;
    if (currentUser) {
      await this.tourService.applyForTour(this.tour.id!, currentUser.uid, this.authService.currentUserData?.name!, this.authService.currentUserData?.photo!);
      this.hasApplied = true;
    } else {
      this.router.navigate(['/']);
    }
  }

  async checkIfUserHasApplied(tourId: string, userId: string): Promise<boolean> {
    return this.tourService.hasUserApplied(tourId, userId);
  }

}
