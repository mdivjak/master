import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Tour } from '../../models/tour';
import { TourService } from '../../services/tour.service';
import { NgIf } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-tour-details',
  standalone: true,
  imports: [NgIf],
  templateUrl: './tour-details.component.html',
  styleUrl: './tour-details.component.css'
})
export class TourDetailsComponent {
  tour!: Tour;
  isHiker: boolean = false;

  constructor(
    private route: ActivatedRoute, 
    private tourService: TourService,
    private authService: AuthService,
    private router: Router) {}

  async ngOnInit(): Promise<void> {
    const tourId = this.route.snapshot.paramMap.get('id');
    if (tourId) {
      await this.loadTour(tourId);
    } else {
      this.router.navigate(['/']);
    }

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
      await this.tourService.applyForTour(this.tour.id!, currentUser.uid);
      alert('You have successfully applied for the tour.');
    } else {
      alert('You need to be logged in to apply for the tour.');
    }
  }

}
