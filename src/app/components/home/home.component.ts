import { Component, inject, OnInit } from '@angular/core';
import { Observable, combineLatest, of } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { Tour } from '../../models/tour';
import { collection, collectionData, Firestore, doc, getDoc } from '@angular/fire/firestore';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
viewDetails(arg0: any) {
throw new Error('Method not implemented.');
}
  tours$: Observable<(Tour & { createdByName: string })[]>;

  private firestore = inject(Firestore);

  constructor() {
    const toursCollection = collection(this.firestore, 'tours');
    this.tours$ = collectionData(toursCollection, { idField: 'id' }).pipe(
      switchMap((tours: Tour[]) => {
        if (tours.length === 0) {
          return of([]);
        }

        const userObservables = tours.map(tour =>
          getDoc(doc(this.firestore, 'users', tour.createdBy)).then(userDoc => ({
            ...tour,
            createdByName: userDoc.exists() ? userDoc.data()?.['firstName'] : 'Unknown'
          }))
        );

        return combineLatest(userObservables);
      })
    ) as Observable<(Tour & { createdByName: string })[]>;
  }

  ngOnInit(): void {}
}
