import { TestBed, inject } from '@angular/core/testing';

import { LicodeService } from './licode.service';

describe('LicodeService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LicodeService]
    });
  });

  it('should ...', inject([LicodeService], (service: LicodeService) => {
    expect(service).toBeTruthy();
  }));
});
