import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TourService } from '../../services/tour.service';
import { Tour } from '../../models/tour';
import { NgFor, NgIf } from '@angular/common';
import { NotificationService } from '../../services/notification.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-tour-participants',
  standalone: true,
  imports: [NgFor, NgIf],
  templateUrl: './tour-participants.component.html',
  styleUrl: './tour-participants.component.css'
})
export class TourParticipantsComponent {
  tourId!: string;
  tour!: Tour;
  applications!: any[];

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private tourService: TourService,
    private notificationService: NotificationService,
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
      const userData = await this.authService.getUserData(application.id);
      application.userData = userData;
    }
    return applications;
  }

  async rejectApplication(application: any) {
    await this.tourService.rejectApplication(this.tourId, application.id);
    this.notificationService.sendNotification(application.id, 'statusUpdate', `Your application for ${this.tour.name} has been rejected`);
    this.applications = await this.loadApplications();
  }

  async acceptApplication(application: any) {
    await this.tourService.acceptApplication(this.tourId, application.id);
    this.notificationService.sendNotification(application.id, 'statusUpdate', `Your application for ${this.tour.name} has been accepted`);
    this.applications = await this.loadApplications();
  }
}
