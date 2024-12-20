import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TourService } from '../../services/tour.service';
import { Tour } from '../../models/tour';
import { UserService } from '../../services/user.service';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-tour-participants',
  standalone: true,
  imports: [NgFor],
  templateUrl: './tour-participants.component.html',
  styleUrl: './tour-participants.component.css'
})
export class TourParticipantsComponent {
rejectApplication(_t24: any) {
throw new Error('Method not implemented.');
}
acceptApplication(_t24: any) {
throw new Error('Method not implemented.');
}
  tour!: Tour;
  applications!: any[];

  constructor(
    private route: ActivatedRoute,
    private tourService: TourService,
    private userService: UserService,
    private router: Router
  ) {}

  async ngOnInit() {
    const tourId = this.route.snapshot.paramMap.get('id');
    if(tourId) {
      await this.loadTour(tourId);
      let applications = await this.loadParticipants();
      this.applications = await this.processApplication(applications);
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
      const data = await this.tourService.loadAllApplications(this.tour.id);
      return data;
    } else {
      throw new Error('Tour ID is missing');
    }
  }

  async processApplication(applications: any) {
    for (let application of applications) {
      console.log(application.id);
      const userData = await this.userService.loadUserData(application.id);
      console.log(userData);
      application.userData = userData;
    }
    return applications;
  }

}
