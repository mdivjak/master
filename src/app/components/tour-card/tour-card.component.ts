import { Component, Input } from '@angular/core';
import { Tour } from '../../models/tour';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-tour-card',
  standalone: true,
  imports: [NgIf],
  templateUrl: './tour-card.component.html',
  styleUrl: './tour-card.component.css'
})
export class TourCardComponent {
@Input() tour!: Tour;
@Input() createdByName?: string;
}
