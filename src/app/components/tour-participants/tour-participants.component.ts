import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TourService } from '../../services/tour.service';
import { Tour } from '../../models/tour';

@Component({
  selector: 'app-tour-participants',
  standalone: true,
  imports: [],
  templateUrl: './tour-participants.component.html',
  styleUrl: './tour-participants.component.css'
})
export class TourParticipantsComponent {
  tour!: Tour;

  constructor(
    private route: ActivatedRoute,
    private tourService: TourService,
    private router: Router
  ) {}

  async ngOnInit() {
    const tourId = this.route.snapshot.paramMap.get('id');
    console.log(tourId);
    if(tourId) {
      await this.loadTour(tourId);
      //await this.loadParticipants();
    } else {
      this.router.navigate(['/']);
    }
  }

  async loadTour(tourId: string) {
    const tour = await this.tourService.loadTour(tourId) ?? null;
    if(!tour) {
      this.router.navigate(['/']);
    } else {
      this.tour = tour;
    }
  }

  async loadParticipants() {
    if(this.tour.id) {
      const data = await this.tourService.loadParticipants(this.tour.id);
      console.log(data);
    } else {
      throw new Error('Tour ID is missing');
    }
  }

}
