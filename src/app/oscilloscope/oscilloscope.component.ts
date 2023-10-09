import { Component, ElementRef, ViewChild } from '@angular/core';
import { BackTrackAudioService } from '../back-track-audio.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-oscilloscope',
  templateUrl: './oscilloscope.component.html',
  styleUrls: ['./oscilloscope.component.css']
})
export class OscilloscopeComponent {

  @ViewChild('oscilloscope') canvas!: ElementRef<HTMLCanvasElement>;

  private ctx: CanvasRenderingContext2D | null = null;
  private analyser: AnalyserNode | null = null;
  private source: MediaElementAudioSourceNode | null = null;
  private playbackSubscription!: Subscription;
  



  constructor(private backTrackAudioService: BackTrackAudioService) {}

  ngAfterViewInit() {
    // Get the canvas element and its 2D rendering context
    const canvasElement: HTMLCanvasElement = this.canvas.nativeElement;
    this.ctx = canvasElement.getContext('2d');
    this.drawDefaultLine();

    // Call the initializeAudio method when the audio is playing
    this.playbackSubscription = this.backTrackAudioService.getPlaybackState().subscribe((state) => {
      if(state) {
        this.initializeAudio();
      }
    });
    this.animate();

  }

  ngOnDestroy() {
    this.playbackSubscription.unsubscribe();
  }

  private initializeAudio() {
    // Create an AnalyserNode
    this.analyser = this.backTrackAudioService.createAnalyserNode();

    // Connect the AnalyserNode to your audio source
    this.source = this.backTrackAudioService.getAudioSourceNode();
    if (this.source !== null) {
      this.source.connect(this.analyser);
    }
  }

  private animate() {
    requestAnimationFrame(() => {
      this.animate();
    });
    // Update the dynamic spectrogram
    this.draw();
  }

  private draw() {
    if (this.ctx === null || this.analyser === null) {
      return; // Check for null values to avoid errors
    }
    // Get the audio data
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteTimeDomainData(dataArray);

    // Clear the canvas
    this.ctx.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);

    // Add glow effect
    this.ctx.shadowBlur = 14; // Adjust the blur size as needed
    this.ctx.shadowColor = 'white'; // Adjust the glow color as needed

    this.ctx.strokeStyle = 'deeppink';
    this.ctx.lineWidth = 12; // Adjust the value as needed


    // Draw the waveform
    this.ctx.beginPath();
    const sliceWidth = (this.canvas.nativeElement.width * 1.0) / dataArray.length;
    let x = 0;
    for (let i = 0; i < dataArray.length; i++) {
      const v = dataArray[i] / 128.0;
      const y = (v * this.canvas.nativeElement.height) / 2;

      if (i === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }

      x += sliceWidth;
    }
    this.ctx.lineTo(this.canvas.nativeElement.width, this.canvas.nativeElement.height / 2);
    this.ctx.stroke();
  }

  private drawDefaultLine() {
    if (this.ctx === null) {
      return;
    }

    // Clear the canvas
    this.ctx.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);

    this.ctx.shadowBlur = 14; // Adjust the blur size as needed
    this.ctx.shadowColor = 'white'; // Adjust the glow color as needed

    this.ctx.strokeStyle = 'deeppink';
    this.ctx.lineWidth = 12; // Adjust the value as needed

    // Draw a default line in the center
    this.ctx.beginPath();
    this.ctx.moveTo(0, this.canvas.nativeElement.height / 2);
    this.ctx.lineTo(this.canvas.nativeElement.width, this.canvas.nativeElement.height / 2);
    this.ctx.stroke();
  }

}
