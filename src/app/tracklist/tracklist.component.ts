import { Component } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop'; // Importing CDK drag and drop
import { BackTrack } from '../models/back-track.model';
import { TrackService } from '../track.service';
import { Subscription } from 'rxjs';
import { ThemePalette } from '@angular/material/core';
import { TracklistService } from '../tracklist.service';
import { BackTrackAudioService } from '../back-track-audio.service';

@Component({
  selector: 'app-tracklist',
  templateUrl: './tracklist.component.html',
  styleUrls: ['./tracklist.component.css']
})
export class TracklistComponent {

  constructor(
    private trackService: TrackService,
    private backTrackAudioService: BackTrackAudioService, 
    private tracklistService: TracklistService) {}

  private selectedTrackSubscription!: Subscription;
  private playbackSubscription!: Subscription;
  isPlaying: boolean = false;
  tracklist: BackTrack[] = [];
  dropSelecting: boolean = false;

  ngOnInit() {

    this.playbackSubscription = this.backTrackAudioService.getPlaybackState().subscribe((state) => {
      this.isPlaying = state;
      
    });

    this.tracklistService.removeTrack$.subscribe((trackIndex) => {
      // Remove the track from the tracklist
      if (trackIndex >= 0 && trackIndex < this.tracklist.length) {
        this.tracklist.splice(trackIndex, 1);
        this.tracklistService.updateTracklist(this.tracklist);
      }
    });

    this.selectedTrackSubscription = this.trackService.getSelectedTrack().subscribe((track) => {

      if(track != null) {
        if(this.tracklist.includes(track)) {
          // reselecting the track
        } else {
          // adding a new track

          if(this.isPlaying) {
            this.tracklist.push(track);
          } else {
            this.tracklist.unshift(track);
          }
        }
        this.tracklistService.updateTracklist(this.tracklist);

      }
    });
  }
  ngOnDestroy() {
    // Don't forget to unsubscribe to prevent memory leaks
    this.selectedTrackSubscription.unsubscribe();
    this.playbackSubscription.unsubscribe();
  };

  removeTrack(track: BackTrack) {
    const indexToRemove = this.tracklist.indexOf(track);
    if (indexToRemove !== -1) {
      this.tracklistService.removeTrack(indexToRemove); // Remove the track from the tracklist
      // Remove the track from the audioService
      // this.audioService.removeTrack(track.source);
    }
  }
  
  drop(event: CdkDragDrop<BackTrack[]>) {
    if(this.isPlaying) {
      return;
    }
    moveItemInArray(this.tracklist, event.previousIndex, event.currentIndex);
    this.tracklistService.updateTracklist(this.tracklist);      

  }
  
}
