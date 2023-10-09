import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { BackTrack } from './models/back-track.model';

@Injectable({
  providedIn: 'root'
})
export class TracklistService {
  private tracklistSubject = new BehaviorSubject<BackTrack[]>([]);
  tracklist$ = this.tracklistSubject.asObservable();

  private removeTrackSubject = new Subject<number>();

  removeTrack$ = this.removeTrackSubject.asObservable();

  updateTracklist(tracklist: BackTrack[]) {
    console.log('updated track list!')
    this.tracklistSubject.next(tracklist);
  }

  getTracklist(): BackTrack[] {
    return this.tracklistSubject.value;
  }

  removeTrack(trackIndex: number) {
    this.removeTrackSubject.next(trackIndex);

  }
  
}
