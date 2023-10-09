import { trigger, state, style, transition, animate } from '@angular/animations';
import { Component, Output } from '@angular/core';
import { Subscription, interval } from 'rxjs';
import { BackTrack } from '../models/back-track.model';
import { TracklistService } from '../tracklist.service';
import { BackTrackAudioService } from '../back-track-audio.service';
import { BackTrackDatabaseService } from '../back-track-database.service';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.css'],
  animations: [
    trigger('fabRotate', [
      state('open', style({
        transform: 'rotate(-360deg)'
      })),
      state('closed', style({
        transform: 'rotate(0deg)'
      })),
      transition('open => closed', [
        animate('0.5s')
      ]),
      transition('closed => open', [
        animate('0.2s')
      ]),
    ]),
    trigger('fadeInOut', [
      state('in', style({ opacity: 1 })),
      transition(':enter', [
        style({ opacity: 0 }),
        animate(300),
        animate('300ms ease-in', style({ opacity: 1 })),
      ]),
      transition(':leave', [
        animate('300ms ease-out', style({ opacity: 0 })),
      ]),
    ]),
  ],
})
export class PlayerComponent {
  isPlaying = false;
  isPaused = false;
  hasFadeOut = false;
  hasGestureControl = false;
  private playbackSubscription!: Subscription;

  static readonly DEFAULT_VOLUME = 60;
  static readonly DEFAULT_PAN = 50;
  static readonly DEFAULT_COMPRESSION_THRESHOLD = 0;
  static readonly DEFAULT_COMPRESSION_KNEE = 5;
  static readonly DEFAULT_COMPRESSION_RATIO = 12;
  static readonly DEFAULT_COMPRESSION_ATTACK = 0.001;
  static readonly DEFAULT_COMPRESSION_RELEASE = 0.003;

  static readonly DEFAULT_FADE_IN = 4.0;
  static readonly DEFAULT_FADE_OUT = 4.0;

  volumeValue = PlayerComponent.DEFAULT_VOLUME;
  panValue = PlayerComponent.DEFAULT_PAN;

  fadeInValue = PlayerComponent.DEFAULT_FADE_IN;
  fadeOutValue = PlayerComponent.DEFAULT_FADE_OUT;

  compressionThresholdValue = PlayerComponent.DEFAULT_COMPRESSION_THRESHOLD;
  compressionKneeValue = PlayerComponent.DEFAULT_COMPRESSION_KNEE;
  compressionRatioValue = PlayerComponent.DEFAULT_COMPRESSION_RATIO;
  compressionAttackValue = PlayerComponent.DEFAULT_COMPRESSION_ATTACK;
  compressionReleaseValue = PlayerComponent.DEFAULT_COMPRESSION_RELEASE;

  equalizerLowValue = 0;
  equalizerMidValue = 0;
  equalizerHighValue = 0;

  private timeUpdateSubscription!: Subscription;
  private tracklistSubscription!: Subscription;
  private bufferSubscription!: Subscription;
  private volumeSubscription!: Subscription;

  
  track: BackTrack | null = null;
  tracklist: BackTrack[] = [];
  trackProgress = 0;
  trackDuration = 0;


  private nextPlay: boolean = false;
  private hasUpdatedTrack: boolean = false;


  constructor(
    private databaseService: BackTrackDatabaseService,
    private audioService: BackTrackAudioService,
    private tracklistService: TracklistService) {}
  
  ngOnInit() {
    // Playback Subscription
    this.playbackSubscription = this.audioService.getPlaybackState().subscribe((state) => {
      this.isPlaying = state;

      if(this.audioService.backTrackEnded) {
        // back track ended
        // console.log('track ended');
        this.playNext();
      }
     
    });
    // Tracklist subscription
    this.tracklistSubscription = this.tracklistService.tracklist$.subscribe((list) => {
      if(list != null) {
        this.tracklist = list;
        if(this.tracklist.length) {
          this.track = this.tracklist[0];
          this.trackDuration = this.track.duration;
          this.audioService.loadAudioBuffer(this.track.sourcePath);
          if(this.nextPlay) {
            this.nextPlay = false;
            this.audioService.playBackTrackAudio(this.track.sourcePath);
          }
        }
      }
    })
    // Time update subscription
    this.timeUpdateSubscription = interval(1000).subscribe(() => {
      if(this.isPlaying && this.track) {
        this.audioService.getCurrentTime().subscribe((time) => {
          this.trackProgress = time;
        });
      }
    });

    this.bufferSubscription = this.audioService.getAudioBuffer().subscribe((buffer) => {
      if(buffer) {
        console.log('got a buffer track is', this.track?.title)
        this.trackDuration = buffer.duration;
        if(this.track) {
          if(this.track.duration === 0) {
            console.log('we are going to update the duration in the database');
            console.log('the duration in the buffer is', buffer.duration);
            this.track.duration = buffer.duration;
            this.databaseService.updateTrackDurationIfZero(this.track);
          }
        }
      }
    });

    this.volumeSubscription = this.audioService.getVolumeLevel().subscribe((volume) => {
      if(volume <= 0.02 && this.isPlaying) {
        this.audioService.stopBackTrackAudio();
        this.tracklistService.removeTrack(0);
        this.track = null;
        this.trackDuration = 0;
        this.trackProgress = 0;
      }
    })
  }

  ngOnDestroy() {
    // Don't forget to unsubscribe to prevent memory leaks
    this.playbackSubscription.unsubscribe();
    this.timeUpdateSubscription.unsubscribe();
    this.tracklistSubscription.unsubscribe();
    this.bufferSubscription.unsubscribe();
    this.volumeSubscription.unsubscribe();
  };

  // Function to handle the closeComponent event from gesture control
  handleCloseGestureControl() {
    this.hasGestureControl = false;
  }

  // Function to handle fadeIn event from gesture control
  handleFadeInGestureControl() {
    this.fadeIn();
  }

  // Function to handle fadeOut event from gesture control
  handleFadeOutGestureControl() {
    this.fadeOut();
  }

  setGestureControl() {
    this.hasGestureControl = !this.hasGestureControl
  }

  playNext() {
    if (this.tracklist.length < 2) {
      // If there's only one track or none, there's no "next" track to play
      return;
    }
    this.nextPlay = true;
    const currentTrack = this.tracklist.shift();
    this.tracklist.push(currentTrack!); 
    this.tracklistService.updateTracklist(this.tracklist);

  }

  fadeOut() {
    this.audioService.fadeOut(PlayerComponent.DEFAULT_FADE_OUT);
    this.hasFadeOut = true;
  }

  fadeIn() {

    if(this.track === null) {
      return
    }
    this.hasFadeOut = false;
    if(!this.isPlaying) {
      this.audioService.playBackTrackAudio(this.track.sourcePath);
    }
  
    this.audioService.fadeIn(PlayerComponent.DEFAULT_FADE_IN);

  }

  selectedTrackPlayOrJustLoad(play: boolean) {
    if(this.track != null) {

      this.audioService.loadAudioBuffer(this.track.sourcePath);
      if(play) {
        this.audioService.playBackTrackAudio(this.track.sourcePath);
      }
    }
  }

  calculateProgress(): number {
    if (this.audioService.backTrackDuration === 0) {
      return 0; // To prevent division by zero
    }
  
    const rawProgress = (this.trackProgress / this.audioService.backTrackDuration) * 100;
  
    // Round the progress to a fixed number of decimal places, for example, 2 decimal places
    const smoothedProgress = Math.round(rawProgress * 100) / 100;
  
    return smoothedProgress;
  }
  
  pauseSelectedTrack() {
    this.isPaused =  true;
    // this.audioService.pauseBackTrackAudio();
    this.audioService.pauseBackTrackAudio();
  }

  togglePlayback() {
    if(this.track === null) {
      return
    }
    if(this.isPlaying) {
   
      this.audioService.stopBackTrackAudio()
      return
    }
    this.audioService.playBackTrackAudio(this.track.sourcePath);
    this.isPaused = false;
  }

  // Function to handle volume slider value change
  onVolumeChange(event: Event) {
    const sliderValue = +(<HTMLInputElement>event.target).value;
    // this.audioService.setBackTrackVolume(sliderValue);
    this.audioService.setBackTrackVolume(sliderValue);
  }

  formatVolumeSliderLabel(value: number): string {
    // Ensure the value is within the valid range of 0 to 100
    const clampedValue = Math.min(100, Math.max(0, value));
  
    return `${clampedValue}%`;
  }
  
  setDefaultVolume() {
    this.volumeValue = PlayerComponent.DEFAULT_VOLUME
    this.audioService.setBackTrackVolume(this.volumeValue);
  }

  // Function to handle pan slider value change
  onPanChange(event: Event) {
    const sliderValue = +(<HTMLInputElement>event.target).value;
    this.audioService.setBackTrackPan(sliderValue);

  }

  formatPanSliderLabel(value: number): string {
    if (value < 50) {
      return `${100 - value}%L`;
    } else if (value > 50) {
      return `${value}%R`;
    } else {
      return 'Mid';
    }
  }

  setDefaultPan() {
    this.panValue = PlayerComponent.DEFAULT_PAN;
    this.audioService.setBackTrackPan(this.panValue);
  }


  onCompressionThresholdChange(event: Event) {
    const sliderValue = +(<HTMLInputElement>event.target).value;
    this.audioService.setBackTrackCompressionThreshold(sliderValue);

  }

  formatCompressionThresholdSliderLabel(value: number): string {
    const clampedValue = Math.max(-60, Math.min(0, value));
    return `${clampedValue}dB`;
  }

  setDefaultCompressionThreshold() {
    this.compressionThresholdValue = PlayerComponent.DEFAULT_COMPRESSION_THRESHOLD;
    this.audioService.setBackTrackCompressionThreshold(this.compressionThresholdValue);
  }

  onCompressionKneeChange(event: Event) {
    const sliderValue = +(<HTMLInputElement>event.target).value;
    this.audioService.setBackTrackCompressionKnee(sliderValue);
  }
    // Format compression knee slider label
  formatCompressionKneeSliderLabel(value: number): string {
    const clampedValue = Math.max(0, Math.min(40, value));
    return `${clampedValue}`;
  }
    
  // Set default compression knee
  setDefaultCompressionKnee() {
    this.compressionKneeValue = PlayerComponent.DEFAULT_COMPRESSION_KNEE;
    this.audioService.setBackTrackCompressionKnee(this.compressionKneeValue);
  }

  onCompressionRatioChange(event: Event) {
    this.compressionRatioValue = +(<HTMLInputElement>event.target).value;
    this.audioService.setBackTrackCompressionRatio(this.compressionRatioValue);
  }

  // Format compression ratio slider label
  formatCompressionRatioSliderLabel(value: number): string {
    const clampedValue = Math.max(1, Math.min(20, value));
    return `${clampedValue}`;
  }

  // Set default compression ratio
  setDefaultCompressionRatio() {
    this.compressionRatioValue = PlayerComponent.DEFAULT_COMPRESSION_RATIO;
    this.audioService.setBackTrackCompressionRatio(this.compressionRatioValue);
  }
  
  onCompressionAttackChange(event: Event) {
    const sliderValue = +(<HTMLInputElement>event.target).value;
    this.audioService.setBackTrackCompressionAttack(sliderValue);
  }

  // Format compression attack slider label
  formatCompressionAttackSliderLabel(value: number): string {
    const clampedValue = Math.max(0, Math.min(1, value));
    return `${clampedValue}`;
  }
  // Set default compression attack
  setDefaultCompressionAttack() {
    this.compressionAttackValue = PlayerComponent.DEFAULT_COMPRESSION_ATTACK;
    this.audioService.setBackTrackCompressionAttack(this.compressionAttackValue);
  }
  
  onCompressionReleaseChange(event: Event) {
    const sliderValue = +(<HTMLInputElement>event.target).value;
    this.audioService.setBackTrackCompressionRelease(sliderValue);
  }

  // Format compression release slider label
  formatCompressionReleaseSliderLabel(value: number): string {
    const clampedValue = Math.max(0, Math.min(1, value));
    return `${clampedValue}`;
  }

  // Set default compression release
  setDefaultCompressionRelease() {
    this.compressionReleaseValue = PlayerComponent.DEFAULT_COMPRESSION_RELEASE;
    this.audioService.setBackTrackCompressionRelease(this.compressionReleaseValue);
  }

  onEqualizerLowSliderChange(event: Event) {
    const sliderValue = +(<HTMLInputElement>event.target).value;
    this.audioService.setLowBandGain(sliderValue);
  }
  setEqualizerDefaultLow() {
    this.equalizerLowValue = 0;
    this.audioService.setLowBandGain(0);


  }

  onEqualizerMidSliderChange(event: Event) {
    const sliderValue = +(<HTMLInputElement>event.target).value;
    this.audioService.setLowBandGain(sliderValue);
  }

  setEqualizerDefaultMid() {
    this.equalizerMidValue = 0;
    this.audioService.setMidBandGain(0);

  }

  onEqualizerHighSliderChange(event: Event) {
    const sliderValue = +(<HTMLInputElement>event.target).value;
    this.audioService.setHighBandGain(sliderValue);
  }
  setEqualizerDefaultHigh() {
    this.equalizerHighValue = 0;
    this.audioService.setHighBandGain(0);
  }

  
}
