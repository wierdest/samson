import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { BackTrack } from './models/back-track.model';

@Injectable({
  providedIn: 'root'
})
export class TrackService {
  private selectedTrackSubject: BehaviorSubject<BackTrack | null> = new BehaviorSubject<BackTrack | null>(null);
  private trackRequestSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  // Observable for track requests
  getTrackRequest(): Observable<boolean> {
    return this.trackRequestSubject.asObservable();
  }

  // Trigger a request for a random track
  requestRandomTrack(): void {
    this.trackRequestSubject.next(true);
  }

  // Set the selected track
  setSelectedTrack(track: BackTrack | null): void {
    this.selectedTrackSubject.next(track);
  }

  // Get the selected track as an observable
  getSelectedTrack(): Observable<BackTrack | null> {
    return this.selectedTrackSubject.asObservable();
  }
}
