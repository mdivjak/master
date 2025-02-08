import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Tour } from '../../models/tour';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TourService } from '../../services/tour.service';
import { SidebarMenuComponent } from "../sidebar-menu/sidebar-menu.component";
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, SidebarMenuComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  userType!: string | null;
  tours$: Observable<(Tour & { createdByName: string })[]>;

  constructor(
    private authService: AuthService,
    private tourService: TourService) {
    this.tours$ = this.tourService.getTours();

    this.authService.userType$.subscribe((userType) => {
      this.userType = userType;
    });
  }

  ngOnInit(): void {}
}
