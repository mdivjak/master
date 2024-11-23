import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Tour } from '../../models/tour';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TourService } from '../../services/tour.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  tours$: Observable<(Tour & { createdByName: string })[]>;

  constructor(private tourService: TourService) {
    this.tours$ = this.tourService.getTours();
  }

  ngOnInit(): void {}
}
