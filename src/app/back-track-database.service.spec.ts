import { TestBed } from '@angular/core/testing';

import { BackTrackDatabaseService } from './back-track-database.service';

describe('BackTrackDatabaseService', () => {
  let service: BackTrackDatabaseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BackTrackDatabaseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
