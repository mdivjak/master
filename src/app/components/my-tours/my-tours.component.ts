import { Component } from '@angular/core';
import { TourService } from '../../services/tour.service';
import { AuthService } from '../../services/auth.service';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-my-tours',
  standalone: true,
  imports: [NgFor, NgIf],
  templateUrl: './my-tours.component.html',
  styleUrl: './my-tours.component.css'
})
export class MyToursComponent {
  tours: any[] = [];

  constructor(private tourService: TourService, private authService: AuthService) {}

  async ngOnInit(): Promise<void> {
    this.authService.user$.subscribe(async (user) => {
      if (user) {
        this.loadToursUserAppliedFor();
      }
    });
  }

  cancelApplication(tourId: string) {
    this.tourService.cancelApplication(tourId, this.authService.currentUser?.uid);
    this.loadToursUserAppliedFor();
  }

  async loadToursUserAppliedFor() {
    if (this.authService.currentUser) {
      this.tours = await this.tourService.getToursUserAppliedFor(this.authService.currentUser.uid);
    }
  }
}
