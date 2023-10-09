import { Subscription } from 'rxjs';
import { BackTrackAudioService } from '../back-track-audio.service';
import { Component, ViewChild, ElementRef, AfterViewInit, Input } from '@angular/core';

@Component({
  selector: 'app-waveform',
  templateUrl: './waveform.component.html',
  styleUrls: ['./waveform.component.css']
})
export class WaveformComponent implements AfterViewInit {
 
  @ViewChild('waveform') waveformCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('markerMask') markerCanvas!: ElementRef<HTMLCanvasElement>;

  private waveformCtx: CanvasRenderingContext2D | null = null;
  private markerCtx: CanvasRenderingContext2D | null = null;

  private buffer: AudioBuffer | null = null;
  private bufferSubscription!: Subscription;

  private currentDrawPosition = 0;
  private isPlaying:boolean = false;
  private waveformWidth = 0;
  private waveformHeight = 0;

  private markerWidth: number = 0;

  private hue = 0;
  private goodHues = [280, 160, 360, 220, 100, 328]

  // marker
  @Input() currentTime: number = 0;

  constructor(private backTrackAudioService: BackTrackAudioService) {}

  ngAfterViewInit() {
    // Get the canvas element and its 2D rendering context
    const waveformCanvasElement: HTMLCanvasElement = this.waveformCanvas.nativeElement;
    this.waveformCtx = waveformCanvasElement.getContext('2d');
    this.waveformHeight = waveformCanvasElement.height;
    this.waveformWidth = waveformCanvasElement.width;

    this.hue = this.goodHues[5];

    const markerCanvasElement: HTMLCanvasElement = this.markerCanvas.nativeElement;
    this.markerCtx = markerCanvasElement.getContext('2d');

    this.markerWidth = 0;

    this.bufferSubscription = this.backTrackAudioService.getAudioBuffer().subscribe((buffer) => {
      if(buffer) {
        this.buffer = buffer;
        this.draw(buffer);
      }
    });

    this.animate();


  }

  ngOnDestroy() {
    this.bufferSubscription.unsubscribe();

  }
  draw(buffer: AudioBuffer) {
    if (this.waveformCtx === null) {
      return;
    }
  
    const channelData = buffer.getChannelData(0); // Assuming we're visualizing the first channel
  
    // this.waveformCtx.fillStyle = 'deeppink'; // Background color
    // this.waveformCtx.fillRect(0, 0, this.waveformWidth, this.waveformHeight);
    this.waveformCtx.clearRect(0, 0, this.waveformWidth, this.waveformHeight)
    const samplesPerPixel = Math.ceil(channelData.length / this.waveformWidth);
  
    let x = 0;
    let i = 0;
  
    // Define the line path to draw the waveform
    this.waveformCtx.beginPath();
    this.waveformCtx.moveTo(x, this.waveformHeight / 2); // Start from the middle of the canvas
    this.waveformCtx.strokeStyle = "deeppink";
  
    while (x < this.waveformWidth && i < channelData.length) {

      const sample = channelData[i];
      // Calculate the y-coordinate for the current sample
      const y = (sample * 0.5 + 0.5) * this.waveformHeight;
  
      // Draw a line segment to the next point
      this.waveformCtx.lineTo(x, y);
      this.waveformCtx.lineTo(x, y - 3);
      this.waveformCtx.lineTo(x, y + 3);

      x += 1;
      i += samplesPerPixel;
    }
  
    // Set line color and width
    this.waveformCtx.lineWidth = 0.5; // Adjust line width as needed
    // Stroke the path to actually draw it
    this.waveformCtx.stroke();
    // Close the path
    this.waveformCtx.closePath();
  }
  
  

  drawMarkerMask() {
    if (this.markerCtx === null) {
      return;
    }
    
    this.markerCtx.clearRect(0, 0, this.waveformWidth, this.waveformHeight); // Clear the canvas
  
    this.markerCtx.fillStyle = 'rgba(0, 0, 0, 0.2)'; // Red with transparency
    const progress = (this.currentTime / this.backTrackAudioService.backTrackDuration);
    this.markerWidth = progress * this.waveformWidth;
    
    // Draw a single vertical line at the current time
    this.markerCtx.fillRect(0, 0, this.markerWidth, this.waveformHeight);
  }
  
  private animate() {
    requestAnimationFrame(() => {
      this.animate();
    });

    this.drawMarkerMask();
   
    
  }

  mixChannels(audioBuffer: AudioBuffer) {
    const numberOfChannels = audioBuffer.numberOfChannels;
    const length = audioBuffer.length;
    const mixedChannel = new Float32Array(length);
  
    // Initialize the mixed channel with zeros
    for (let i = 0; i < length; i++) {
      mixedChannel[i] = 0;
    }
  
    // Sum the samples from all channels
    for (let channel = 0; channel < numberOfChannels; channel++) {
      const channelData = audioBuffer.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        mixedChannel[i] += channelData[i];
      }
    }
  
    // // Normalize the mixed channel (optional)
    // const maxAmplitude = Math.max.apply(null, Array.from(mixedChannel));
    // if (maxAmplitude > 1) {
    //   for (let i = 0; i < length; i++) {
    //     mixedChannel[i] /= maxAmplitude;
    //   }
    // }
  
    return mixedChannel;
  }

  sumArrays(channel1: Float32Array, channel2: Float32Array) {
    if (channel1.length !== channel2.length) {
      throw new Error("Arrays must have the same length for element-wise addition.");
    }
  
    return channel1.map((value, index) => value + channel2[index]);
  }
  
  

  
  
}