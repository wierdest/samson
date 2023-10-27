import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as tf from '@tensorflow/tfjs';
import * as poseDetection from '@tensorflow-models/pose-detection';
import '@tensorflow/tfjs-backend-webgl';

@Component({
  selector: 'app-gesture-trainer',
  templateUrl: './gesture-trainer.component.html',
  styleUrls: ['./gesture-trainer.component.css']
})
export class GestureTrainerComponent implements AfterViewInit {
  @ViewChild('status') STATUS!: ElementRef;
  @ViewChild('webcam') VIDEO!: ElementRef;

  // Define an array to store human-readable class names
  CLASS_NAMES: string[] = [];
  
  // Additional variable declarations
  moveNet: any = undefined;
  gatherDataState: string = 'STOP_DATA_GATHER';
  videoPlaying: boolean = false;
  trainingDataInputs: any[] = [];
  trainingDataOutputs: any[] = [];
  examplesCount: number[] = [];
  predict: boolean = false;

  constructor(private http: HttpClient) { }

  ngAfterViewInit() {
    console.log('STATUS element:', this.STATUS.nativeElement);
    console.log('VIDEO element:', this.VIDEO.nativeElement);

    this.loadMoveNetFeatureModel();
  }

  enableWebCam() {
    // Implement logic for enabling the webcam
  }
  
  trainAndPredict() {
    // Implement logic for training and predicting
  }
  
  resetTrainer() {
    // Implement logic for resetting
  }

  // Define the gatherDataForClass function
  gatherDataForClass(classId: number) {
    // Implement logic for gathering data for a specific class
    // You can use the classId to determine which class is being collected
    // CLASS_NAMES[classId] will give you the corresponding human-readable class name
  }

  // Modify the function to load the Pose Detection model and log a success message
  async loadMoveNetFeatureModel() {
    try {
      const detectorConfig = { modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING };
      const detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, detectorConfig);
      console.log('Pose Detection model loaded successfully:', detectorConfig.modelType);

      // Set the moveNet variable to the loaded detector
      this.moveNet = detector;

      // Update the status element in your HTML if needed
      this.STATUS.nativeElement.innerText = 'Pose Detection model loaded successfully!';
    } catch (error) {
      console.error('Failed to load Pose Detection model:', error);
      // You can update the status element with an error message here if needed
    }
  }

}
