import { Component, ElementRef, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { BackTrackAudioService } from '../back-track-audio.service';

@Component({
  selector: 'app-spectrogram',
  templateUrl: './spectrogram.component.html',
  styleUrls: ['./spectrogram.component.css']
})
export class SpectrogramComponent {

  @ViewChild('spectrogram') canvas!: ElementRef<HTMLCanvasElement>;

  bufferLoad: boolean = false;
  isPlaying: boolean = false;
  private buffer: AudioBuffer | null = null;

  private analyser: AnalyserNode | null = null;
  private source: MediaElementAudioSourceNode | null = null;

  private spectrum: Uint8Array | null = null;
  private spectrumLength = 0;
  private spectrumHeight = 0;
  private spectrumX = 0;
  private spectrogramXOffset = 0;

  private ctx: CanvasRenderingContext2D | null = null;
  private playbackSubscription!: Subscription;

  private spectrogramWidth = 0;
  private spectrogramHeight = 0;

  private hue = 0;
  private goodHues = [280, 160, 360, 220, 100, 328]


  constructor(public backTrackAudioService: BackTrackAudioService) {}

  ngAfterViewInit() {
    // Get the canvas element and its 2D rendering context
    const canvasElement: HTMLCanvasElement = this.canvas.nativeElement;
    this.ctx = canvasElement.getContext('2d');

    this.spectrogramWidth = canvasElement.width;
    this.spectrogramHeight = canvasElement.height;

    this.hue = this.goodHues[5];

    this.playbackSubscription = this.backTrackAudioService.getPlaybackState().subscribe((state) => {
      this.isPlaying = state;
      if(state) {
        this.initializeAnalyser();
      }
    });


    this.animate();
  }

  ngOnDestroy() {
    this.playbackSubscription.unsubscribe();
  }

  private initializeAnalyser() {
    // console.log('initializing analyser')
    // Create an AnalyserNode
    this.analyser = this.backTrackAudioService.createAnalyserNode();

    // Connect the AnalyserNode to your audio source
    this.source = this.backTrackAudioService.getAudioSourceNode();
    if (this.source !== null) {
      this.source.connect(this.analyser);
    }

    this.analyser.fftSize = 4096;

    this.spectrum = new Uint8Array(this.analyser.frequencyBinCount);
    this.spectrumLength = this.spectrum.length;
    this.spectrumHeight = this.spectrogramHeight / this.spectrumLength;

    this.spectrumX = this.spectrogramWidth - 1 - this.spectrogramXOffset;

    if(this.ctx != null) {
      // this.ctx.fillStyle = `hsl(${this.hue}, 100%, 50%)`;
      this.ctx.fillStyle = 'deeppink'

      this.ctx.fillRect(0, 0, this.spectrogramWidth, this.spectrogramHeight);
    }
  }

  private drawSpectrogram() {
    if (!this.ctx || !this.spectrum || !this.analyser) {
      return;
    }
    const imgData = this.ctx.getImageData(1, 0, this.spectrogramWidth - 1, this.spectrogramHeight);
    this.ctx.fillRect(0, 0, this.spectrogramWidth, this.spectrogramHeight);
    this.ctx.putImageData(imgData, 0, 0);

    this.analyser.getByteFrequencyData(this.spectrum);
  
    // Update the spectrogramX based on the offset
    // this.spectrumX = this.spectrogramWidth - 1 - this.spectrogramXOffset;
  
    for (let i = 0; i < this.spectrumLength; i++) {
      let rat = this.spectrum[i] / 255;
      let hue = Math.round((rat * 160) + this.hue % 360);
      let sat = '100%';
      let lit = 54 + (200 * rat) + '%';
      this.ctx.beginPath();
      this.ctx.strokeStyle = `hsl(${hue}, ${sat}, ${lit})`;
      this.ctx.moveTo(this.spectrumX, this.spectrogramHeight - (i * this.spectrumHeight));
      this.ctx.lineTo(this.spectrumX, this.spectrogramHeight - (i * this.spectrumHeight + this.spectrumHeight));
      this.ctx.stroke();
    }
  
    // Increment the x-axis offset to create the appearance of motion
    // this.spectrogramXOffset += 1; // You can adjust the speed as needed
  }
  

  private animate() {
    requestAnimationFrame(() => {
      this.animate();
    });
    if(this.isPlaying) {
      this.drawSpectrogram()
    }

  }

}
