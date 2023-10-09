import { TestBed } from '@angular/core/testing';

import { BackTrackAudioService } from './back-track-audio.service';

describe('BacktrackAudioService', () => {
  let service: BackTrackAudioService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BackTrackAudioService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
