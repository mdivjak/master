import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { hikingClubGuard } from './hiking-club.guard';

describe('hikingClubGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => hikingClubGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
