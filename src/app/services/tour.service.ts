import { inject, Injectable } from '@angular/core';
import { addDoc, collection, collectionData, doc, Firestore, getDoc } from '@angular/fire/firestore';
import { Tour } from '../models/tour';
import { combineLatest, Observable, of, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TourService {
  private firestore = inject(Firestore);

  constructor() { }

  async loadTour(tourId: string) {
    const tourDoc = await getDoc(doc(this.firestore, 'tours', tourId));
    if (tourDoc.exists()) {
      return tourDoc.data() as Tour;
    } else {
      console.error('Tour not found');
    }
    return undefined;
  }

  getTours() {
    const toursCollection = collection(this.firestore, 'tours');
    let tours$ = collectionData(toursCollection, { idField: 'id' }).pipe(
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

    return tours$;
  }

  async addTour(tour: Tour) {
    return addDoc(collection(this.firestore, 'tours'), tour);
  }
}
