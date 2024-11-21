import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileHikerComponent } from './profile-hiker.component';

describe('ProfileHikerComponent', () => {
  let component: ProfileHikerComponent;
  let fixture: ComponentFixture<ProfileHikerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileHikerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfileHikerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
