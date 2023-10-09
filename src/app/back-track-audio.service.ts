import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject, Observable, BehaviorSubject } from 'rxjs';
import { BackTrackDatabaseService } from './back-track-database.service';

@Injectable({
  providedIn: 'root',
})
export class BackTrackAudioService {
  
  //  HTMLAudioElement for simple playback functionality
  private backTrack: HTMLAudioElement;
  // this backTrackDuration is set onloadedmetadata for the MediaElementSource
  // it's a quick way of getting the duration without loading the buffer. Not use, but I'll leave in for now.
  backTrackDuration: number = 0;
  public backTrackEnded = false;
  // WebAudio source node for more complex manipulation
  private backTrackSourceNode: MediaElementAudioSourceNode;
  
  private audioContext: AudioContext;
  // Gain node controls volume
  private gainNode: GainNode;
  // Stereo panner node controls panning
  private panNode: StereoPannerNode;
  // Dynamic Compressor node
  private compressorNode: DynamicsCompressorNode;

  // Biquad Filter Nodes for a simple 3-band Equalizer
  private lowBandFilterNode: BiquadFilterNode;
  private midBandFilterNode: BiquadFilterNode;
  private highBandFilterNode: BiquadFilterNode;

  private audioBuffer: AudioBuffer | null = null;
  private bufferSubject: Subject<AudioBuffer | null> = new Subject<AudioBuffer | null>();
  startedLoadingBuffer: boolean = false;

  // Observable for playback state = either playing or not
  private playbackSubject: Subject<boolean> = new Subject<boolean>();
  // Observable for the current playback time
  private currentTimeSubject: Subject<number> = new Subject<number>();
  // Observable for volume
  private volumeSubject: BehaviorSubject<number> = new BehaviorSubject<number>(100);

  constructor(private http: HttpClient) {
    // Start with the audio context
    this.audioContext = new AudioContext();
    // Create an audio element for the first track
    this.backTrack = new Audio();
    // Pass the audio element into the context
    this.backTrackSourceNode = this.audioContext.createMediaElementSource(this.backTrack);
    // Create the node that controls the volume
    this.gainNode = this.audioContext.createGain();
    // Create the pan node
    this.panNode = this.audioContext.createStereoPanner();
    // Create the compressor node
    this.compressorNode = this.audioContext.createDynamicsCompressor();
    // to do create more presets
    this.compressorNode.threshold.value = 0; // Set threshold
    this.compressorNode.knee.value = 5; // Set knee
    this.compressorNode.ratio.value = 12; // Set ratio
    this.compressorNode.attack.value = 0.001; // Set attack time
    this.compressorNode.release.value = 0.003; // Set release time

    // 3-band EQ
    // Create three BiquadFilterNodes for low, mid, and high frequency bands
    this.lowBandFilterNode = this.audioContext.createBiquadFilter();
    this.midBandFilterNode = this.audioContext.createBiquadFilter();
    this.highBandFilterNode = this.audioContext.createBiquadFilter();

    // Configure filter types (e.g., 'lowpass', 'bandpass', 'highpass') and frequency ranges
    this.lowBandFilterNode.type = 'lowshelf';
    this.lowBandFilterNode.frequency.value = 250; // Adjust the frequency range as needed

    this.midBandFilterNode.type = 'peaking';
    this.midBandFilterNode.frequency.value = 1000; // Adjust the frequency range as needed

    this.highBandFilterNode.type = 'highshelf';
    this.highBandFilterNode.frequency.value = 4000; // Adjust the frequency range as needed

    this.backTrackSourceNode
      .connect(this.compressorNode)
      .connect(this.panNode)
      .connect(this.lowBandFilterNode)
      .connect(this.midBandFilterNode)
      .connect(this.highBandFilterNode)
      .connect(this.gainNode)
      .connect(this.audioContext.destination);

    this.backTrack.addEventListener('play', () => {
      this.playBackTrack();
      // load the buffer

    }); 
    this.backTrack.addEventListener('pause', () => this.pauseBackTrack());
    this.backTrack.addEventListener('ended', () => this.endBackTrack()); // Cleanup when audio ends
    this.backTrack.addEventListener('loadedmetadata', () => this.setDuration()); // Cleanup when audio ends
    // Add an event listener to track the current time and emit it
    this.backTrack.addEventListener('timeupdate', () => {
      this.currentTimeSubject.next(this.backTrack.currentTime);
    });
   
  }

  ngOnDestroy() {

    this.backTrackSourceNode.disconnect();
    this.gainNode.disconnect();
    this.panNode.disconnect();
    this.compressorNode.disconnect();
    this.lowBandFilterNode.disconnect();
    this.midBandFilterNode.disconnect();
    this.highBandFilterNode.disconnect();
    this.audioContext.close();
  }

  getAudioBuffer(): Observable<AudioBuffer | null> {
    return this.bufferSubject.asObservable();
  }
  

  getPlaybackState(): Observable<boolean> {
    return this.playbackSubject.asObservable();
  }

  getCurrentTime(): Observable<number> {
    return this.currentTimeSubject.asObservable();
  }

  // Getter for volume level observable
  getVolumeLevel(): Observable<number> {
    return this.volumeSubject.asObservable();
  }

  private playBackTrack() {
    this.backTrackEnded = false;
    return this.playbackSubject.next(true);
  }

  private pauseBackTrack() {
    return this.playbackSubject.next(false);
  }

  private endBackTrack() {
    // console.log('ending backtrack!')
    this.backTrackEnded = true;
    this.cleanUpBackTrackAudio();
    return this.playbackSubject.next(false);
  }

  // Load audio from an HTTP source and play it once loaded
  playOnLoad(sourcePath: string) {
    this.http.get(sourcePath, { responseType: 'blob' }).subscribe((blob: Blob) => {
      const audioUrl = URL.createObjectURL(blob);
      this.backTrack.src = audioUrl;
      this.backTrack.load();
      this.backTrack.play();
    });
  }

  loadAudioBuffer(sourcePath: string) {
    this.startedLoadingBuffer = true;
    this.http.get(sourcePath, { responseType: 'arraybuffer' }).subscribe(
      (arrayBuffer: ArrayBuffer) => {
        this.audioContext.decodeAudioData(
          arrayBuffer,
          (buffer) => {
            this.startedLoadingBuffer = false;
            this.audioBuffer = buffer; // Store the decoded audio buffer
            this.bufferSubject.next(buffer); // Notify subscribers that the buffer is ready
          },
          (error) => {
            console.error('Error decoding audio data:', error);
            this.bufferSubject.next(null); // Notify subscribers of the error
            this.startedLoadingBuffer = false;

          }
        );
      },
      (error) => {
        console.error('Error loading audio data:', error);
        this.bufferSubject.next(null); // Notify subscribers of the error
        this.startedLoadingBuffer = false;

      }
    );
  }
  
  setDuration() {
    this.backTrackDuration = this.backTrack.duration;
    console.log('Track duration:', this.backTrackDuration);
  }

  // Cleanup audio
  cleanUpBackTrackAudio() {
    this.backTrack.pause();
    this.backTrack.currentTime = 0; // Reset playback position to the beginning
    URL.revokeObjectURL(this.backTrack.src); // Release the associated resource
  }

  // Play back track audio
  playBackTrackAudio(sourcePath: string) {

    if(this.audioContext.state === "suspended") {
      this.audioContext.resume();
    }
    if(this.backTrack.src != '' && this.backTrack.paused && this.backTrack.currentTime > 0) {
      console.log('audio is paused!');
      this.backTrack.play();
      return;
    }
    this.playOnLoad(sourcePath);
  }

  // Pause  back track audio
  pauseBackTrackAudio() {
    this.backTrack.pause();
  }
  
  // Stop back track audio (pause and reset to the beginning)
  stopBackTrackAudio() {
    this.cleanUpBackTrackAudio();
  }
  // Set back track volume
  setBackTrackVolume(volume: number) {
    // Clamp the volume level between 0 and 100
    const clampedVolume = Math.min(100, Math.max(0, volume));
    this.gainNode.gain.setValueAtTime(clampedVolume / 100, this.audioContext.currentTime);
    this.volumeSubject.next(clampedVolume); // Notify subscribers
  }

  setBackTrackPan(pan: number) {
    const clampedPan = Math.min(1, Math.max(0, pan / 100));
    this.panNode.pan.value = clampedPan;
  }

  setBackTrackCompressionThreshold(threshold: number) {
    // Clamp the threshold value between -60 and 0
    const clampedThreshold = Math.max(-60, Math.min(0, threshold));
    this.compressorNode.threshold.setValueAtTime(clampedThreshold, this.audioContext.currentTime);  
  }

  setBackTrackCompressionKnee(knee: number) {
    // Clamp the knee value between an appropriate range (e.g., 0 to 40)
    const clampedKnee = Math.max(0, Math.min(40, knee));
    this.compressorNode.knee.setValueAtTime(clampedKnee, this.audioContext.currentTime);
  }
  
  setBackTrackCompressionRatio(ratio: number) {
    // Clamp the ratio value between an appropriate range (e.g., 1 to 20)
    const clampedRatio = Math.max(1, Math.min(20, ratio));
    this.compressorNode.ratio.setValueAtTime(clampedRatio, this.audioContext.currentTime);
  }
  
  setBackTrackCompressionAttack(attack: number) {
    // Clamp the attack value between an appropriate range (e.g., 0 to 1)
    const clampedAttack = Math.max(0, Math.min(1, attack));
    this.compressorNode.attack.setValueAtTime(clampedAttack, this.audioContext.currentTime);
  }
  
  setBackTrackCompressionRelease(release: number) {
    // Clamp the release value between an appropriate range (e.g., 0 to 1)
    const clampedRelease = Math.max(0, Math.min(1, release));
    this.compressorNode.release.setValueAtTime(clampedRelease, this.audioContext.currentTime);
  }

  setLowBandGain(gainValue: number) {
    // Clamp the gain value between an appropriate range (e.g., -12 to 12)
    const clampedGain = Math.max(-12, Math.min(12, gainValue));
    this.lowBandFilterNode.gain.setValueAtTime(clampedGain, this.audioContext.currentTime);
  }
  
  setMidBandGain(gainValue: number) {
    // Clamp the gain value between an appropriate range (e.g., -12 to 12)
    const clampedGain = Math.max(-12, Math.min(12, gainValue));
    this.midBandFilterNode.gain.setValueAtTime(clampedGain, this.audioContext.currentTime);
  }
  
  setHighBandGain(gainValue: number) {
    // Clamp the gain value between an appropriate range (e.g., -12 to 12)
    const clampedGain = Math.max(-12, Math.min(12, gainValue));
    this.highBandFilterNode.gain.setValueAtTime(clampedGain, this.audioContext.currentTime);
  }
  
  

 // Fade out and notify subscribers when the volume changes
 fadeOut(durationInSeconds: number, andStop: boolean = false) {
  const initialVolume = this.gainNode.gain.value;
  const targetVolume = 0; // Fade out to silence

  // Calculate the time when the fade-out should complete
  const endTime = this.audioContext.currentTime + durationInSeconds;

  // Schedule a linear ramp to decrease the volume
  this.gainNode.gain.setValueAtTime(initialVolume, this.audioContext.currentTime);
  this.gainNode.gain.linearRampToValueAtTime(targetVolume, endTime);

  // Notify subscribers of volume changes during fade-out
  const intervalMs = 50; // Notify every 50 milliseconds during the fade-out
  const numSteps = Math.ceil(durationInSeconds * 1000 / intervalMs);
  const volumeChangePerStep = initialVolume / numSteps;
  for (let i = 0; i < numSteps; i++) {
    setTimeout(() => {
      this.setBackTrackVolume(initialVolume - i * volumeChangePerStep);
    }, i * intervalMs);
  }

  // // Optionally stop the audio after fading out
  // if (andStop) {
  //   setTimeout(() => {
  //     this.stopBackTrackAudio();
  //   }, durationInSeconds * 1000);
  // }
}

// Fade in and notify subscribers when the volume changes
fadeIn(durationInSeconds: number) {
  this.gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
  const initialVolume = this.gainNode.gain.value; // Get the current volume
  const targetVolume = 1.0; // Fade in to full volume (1.0)

  // Calculate the change in volume per second to achieve the fade-in effect
  const volumeChangePerSecond = (targetVolume - initialVolume) / durationInSeconds;

  // Schedule the volume changes over time
  const currentTime = this.audioContext.currentTime;
  this.gainNode.gain.setValueAtTime(initialVolume, currentTime);
  this.gainNode.gain.linearRampToValueAtTime(targetVolume, currentTime + durationInSeconds);

  // Notify subscribers of volume changes during fade-in
  const intervalMs = 50; // Notify every 50 milliseconds during the fade-in
  const numSteps = Math.ceil(durationInSeconds * 1000 / intervalMs);
  const volumeChangePerStep = (targetVolume - initialVolume) / numSteps;
  for (let i = 0; i < numSteps; i++) {
    setTimeout(() => {
      this.setBackTrackVolume(initialVolume + i * volumeChangePerStep);
    }, i * intervalMs);
  }
}

  createAnalyserNode(): AnalyserNode {
    // Create an AnalyserNode
    const analyserNode = this.audioContext.createAnalyser();
  
    // Configure the AnalyserNode as needed (e.g., setting FFT size, smoothing, etc.)
    analyserNode.fftSize = 2048; // You can adjust this value as needed
    analyserNode.smoothingTimeConstant = 0.8; // Adjust smoothing as needed
  
    // Connect the AnalyserNode to the desired part of your audio processing chain
    // For example, if you want to analyze the audio after the compressor:
    this.compressorNode.connect(analyserNode);
  
    return analyserNode;
  }

  getAudioSourceNode(): MediaElementAudioSourceNode {
    // Ensure the audio context is in the correct state
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    // Return the existing source node
    return this.backTrackSourceNode;
  }
  
  

  
  
}
