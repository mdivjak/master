import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateHikingTourComponent } from './create-hiking-tour.component';

describe('CreateHikingTourComponent', () => {
  let component: CreateHikingTourComponent;
  let fixture: ComponentFixture<CreateHikingTourComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateHikingTourComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateHikingTourComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
