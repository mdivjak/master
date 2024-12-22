import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { hikerGuard } from './hiker.guard';

describe('hikerGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => hikerGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
