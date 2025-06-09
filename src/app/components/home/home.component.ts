import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Tour } from '../../models/tour';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TourService } from '../../services/tour.service';
import { SidebarMenuComponent } from "../sidebar-menu/sidebar-menu.component";
import { AuthService } from '../../services/auth.service';
import { TourCardComponent } from "../tour-card/tour-card.component";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, SidebarMenuComponent, TourCardComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  userType!: string | null;
  tours: Tour[] = [];

  constructor(
    private authService: AuthService,
    private tourService: TourService) {

    this.authService.userType$.subscribe((userType) => {
      this.userType = userType;
    });
  }

  async ngOnInit() {
    this.tours = await this.tourService.getAllTours();
  }

  trackByTourId(index: number, tour: Tour): string {
    return tour.id || index.toString();
  }
}
