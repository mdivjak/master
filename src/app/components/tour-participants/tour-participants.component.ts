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
  tourId!: string;
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
      this.tourId = tourId;
      await this.loadTour(tourId);
      this.applications = await this.loadApplications();
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

  async loadApplications() {
    if(this.tour.id) {
      let applications = await this.tourService.loadAllApplications(this.tour.id);
      applications = await this.processApplication(applications);
      return applications;
    } else {
      throw new Error('Tour ID is missing');
    }
  }

  async processApplication(applications: any) {
    for (let application of applications) {
      const userData = await this.userService.loadUserData(application.id);
      application.userData = userData;
    }
    return applications;
  }

  async rejectApplication(application: any) {
    await this.tourService.rejectApplication(this.tourId, application.id);
    this.applications = await this.loadApplications();
  }

  async acceptApplication(application: any) {
    await this.tourService.acceptApplication(this.tourId, application.id);
    this.applications = await this.loadApplications();
  }
}
