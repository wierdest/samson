import { Component, OnInit, ElementRef, ViewChild, Input, EventEmitter, Output } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import * as tmPose from '@teachablemachine/pose';
import { Subscription, interval } from 'rxjs';
import { BackTrackAudioService } from '../back-track-audio.service';
import { TracklistService } from '../tracklist.service';
import { MatProgressBar } from '@angular/material/progress-bar';
import { TrackService } from '../track.service';


@Component({
  selector: 'app-gesture-control',
  templateUrl: './gesture-control.component.html',
  styleUrls: ['./gesture-control.component.css']
})
export class GestureControlComponent  {
  
  @ViewChild('webcam') webcamContainer!: ElementRef<HTMLCanvasElement>;

  // Declare variables here
  model: any;
  webcam: any;
  ctx: any;
  pose: any;
  webcamLoaded: boolean = false;
  loopId: number | null = null;
  maxPredictions: number = 0;
  gesture: string = ""

  @ViewChild(MatProgressBar) progressBar!: MatProgressBar;

  @Output() closeComponent = new EventEmitter<void>();

  @Output() fadeIn = new EventEmitter<void>();
  hasFadedIn: boolean = false;

  @Output() fadeOut = new EventEmitter<void>();
  canFadeOut: boolean = false;

  private playbackSubscription!: Subscription;
  isPlaying: boolean = false;
  private tracklistSubscription!: Subscription;
  hasTrack: boolean = false;
  
  // Trigger the action after a certain delay
  countdown: number = 0;
  coolingOff: boolean = false;

  constructor(
    private trackService: TrackService,
    private audioService: BackTrackAudioService,
    private tracklistService: TracklistService,

  ) { }

  ngAfterViewInit(): void {
    
    // Call the init() function when the component initializes
    // Just some comment
    this.init();

    this.playbackSubscription = this.audioService.getPlaybackState().subscribe((state) => {
      this.isPlaying = state;
    });

    this.tracklistSubscription = this.tracklistService.tracklist$.subscribe((list) => {
      this.hasTrack = list != null && list.length > 0;
    });

  }

  ngOnDestroy() : void {
    this.playbackSubscription.unsubscribe();
    this.tracklistSubscription.unsubscribe();
    console.log('stopping loop and webcam!')
    this.stopLoopAndWebcam();
  
  }

  close() {
    this.closeComponent.emit();
  }

  async init() {
    const URL = "./assets/gestures/"; // Your model URL here
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    // Load the model and metadata
    this.model = await tmPose.load(modelURL, metadataURL);
    this.maxPredictions = this.model.getTotalClasses();

    // Convenience function to set up a webcam
    const flip = true; // Whether to flip the webcam
    this.webcam = new tmPose.Webcam(200, 200, flip); // Width, height, flip
    await this.webcam.setup(); // Request access to the webcam
    await this.webcam.play();

    // Append elements to the DOM
    this.webcamContainer.nativeElement.appendChild(this.webcam.canvas);

    // Start the prediction loop
    this.loop();

    // Set webcamLoaded to true
    this.webcamLoaded = true;
    
  }

  loop = () => {
    this.webcam.update(); // Update the webcam frame
    this.predict();
    this.loopId = requestAnimationFrame(this.loop); // Store the loop ID for cancellation
  };

  async predict() {
    if(this.coolingOff) {
      // If in a cool-off state, return without processing the prediction
      // console.log('cooling off!');
      this.progressToIndeterminate();
      return;
    }
    const { pose, posenetOutput } = await this.model.estimatePose(this.webcam.canvas);
    this.pose = pose;
    // Predict using the webcam canvas
    const prediction = await this.model.predict(posenetOutput);
    for (let i = 0; i < this.maxPredictions; i++) {
      const pred = prediction[i];
      const prob = pred.probability.toFixed(2);
      const name = pred.className;
      const classPrediction =
        name + ": " + prob;
      // console.log(classPrediction);
      let gesture = "Idle"; // Default state is "Idle"

      if (prob > 0.8) {
        if (!this.hasTrack) {
          gesture = name != "Idle" ? "Add Track" : "Idle";
        } else if (this.hasTrack && !this.isPlaying) {
          gesture = name != "Idle" ? !this.hasFadedIn ? "Fade In" : "Idle" : "Idle";
        } else if (this.isPlaying) {
          gesture = name != "Idle" ? this.canFadeOut ? "Fade Out" : "Idle" : "Idle";
        }
        
      } 
      // Set the gesture
      this.gesture = gesture;
    }
    this.processPrediction()

  }

  processPrediction() {
    if(this.gesture === "Idle") {
      this.countdown = 0;
      if(this.hasFadedIn && this.isPlaying && !this.canFadeOut) {
        this.canFadeOut = true;
        console.log('can fade out!');
        return;
      }

      if(this.canFadeOut && this.hasFadedIn && !this.isPlaying) {
        console.log('reset faded in!')
        this.hasFadedIn = false;
        this.canFadeOut = false;
      }

      this.progressToBuffer();
    } else {
      // Increment the countdown by the frame interval
      this.countdown += 10 / this.maxPredictions;
      this.progressToDeterminate(this.countdown);

      // Ensure the countdown does not exceed 120 milliseconds (around 1.2 second)
      // console.log('count', this.countdown)
      if (this.countdown > 120) {
        this.countdown = 120;
        if(this.gesture === "Add Track") {
          if(!this.hasTrack) {
            console.log('sent request!');
            this.trackService.requestRandomTrack();
            
          }
          return;
        }

        if(!this.hasFadedIn && this.gesture === "Fade In") {
          if(!this.isPlaying) {
            this.hasFadedIn = true;
            this.fadeIn.emit();
            console.log('emitted event to fade in!');
            this.startCoolingOff();
          }
          return;
  
        }
        if(this.canFadeOut && this.gesture === "Fade Out") {
          if(this.isPlaying)  {
            console.log('emitted event to fade out!');
            this.fadeOut.emit();
          }
          this.startCoolingOff(); // Start the cool-off period
        }

      }

     
    }
  }

  startCoolingOff() {
    this.coolingOff = true;
    // Set a timeout to exit the cool-off state after a certain time (e.g., 2 seconds)
    this.progressToIndeterminate();
    setTimeout(() => {
      this.coolingOff = false;
    }, 2000); // 2000 milliseconds (2 seconds)
  }

  stopLoopAndWebcam(): void {
    // Stop the prediction loop
    if (this.loopId !== null) {
      cancelAnimationFrame(this.loopId);
    }
  
    // Release the webcam
    if (this.webcam) {
      this.webcamLoaded = false;
      this.webcam.stop();
    }
  }

  progressToIndeterminate() {
    this.progressBar.mode = 'indeterminate';
    console.log('progress to indeterminate!');
    this.progressBar.value = 0;
  }


  progressToDeterminate(value: number) {
    this.progressBar.mode = 'determinate';
    this.progressBar.value = value;
  }

  progressToBuffer() {
    this.progressBar.mode = 'buffer';
    this.progressBar.value = 0;
  }
}
  

