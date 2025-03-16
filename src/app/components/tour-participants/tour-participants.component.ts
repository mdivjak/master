import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TourService } from '../../services/tour.service';
import { Application, Tour } from '../../models/tour';
import { NgFor, NgIf } from '@angular/common';
import { NotificationService } from '../../services/notification.service';

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
  applications!: Application[];

  constructor(
    private route: ActivatedRoute,
    private tourService: TourService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  async ngOnInit() {
    const tourId = this.route.snapshot.paramMap.get('id');
    if(tourId) {
      this.tourId = tourId;
      await this.getTour(tourId);
      this.applications = await this.getApplications() as unknown as Application[];
    } else {
      this.router.navigate(['/']);
    }
  }

  async getTour(tourId: string) {
    const tour = await this.tourService.getTour(tourId) as Tour ?? null;
    if(!tour) {
      this.router.navigate(['/']);
    } else {
      this.tour = tour;
    }
  }

  async getApplications() {
    if(this.tour.id) {
      let applications = await this.tourService.getTourApplications(this.tour.id);
      return applications;
    } else {
      throw new Error('Tour ID is missing');
    }
  }

  async rejectApplication(application: Application) {
    await this.tourService.updateApplicationStatus(this.tourId, application.userId, "declined", "");
    this.tourService.removeTourParticipant(this.tourId, application.userId);
    this.notificationService.sendNotification(application.userId, 'statusUpdate', `Your application for ${this.tour.name} has been rejected`);
    this.applications = await this.getApplications() as unknown as Application[];
    // TODO: Add logic to send a decline message
  }

  async acceptApplication(application: Application) {
    await this.tourService.updateApplicationStatus(this.tourId, application.userId, "accepted", "");
    await this.tourService.addTourParticipant(this.tourId, application.userId, application.userName, application.userPhoto);
    this.notificationService.sendNotification(application.userId, 'statusUpdate', `Your application for ${this.tour.name} has been accepted`);
    this.applications = await this.getApplications() as unknown as Application[];
  }
}
