import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TourParticipantsComponent } from './tour-participants.component';

describe('TourParticipantsComponent', () => {
  let component: TourParticipantsComponent;
  let fixture: ComponentFixture<TourParticipantsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TourParticipantsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TourParticipantsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
