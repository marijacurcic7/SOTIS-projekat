import { TestBed } from '@angular/core/testing';

import { TakeService } from './take.service';

describe('TakeService', () => {
  let service: TakeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TakeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
