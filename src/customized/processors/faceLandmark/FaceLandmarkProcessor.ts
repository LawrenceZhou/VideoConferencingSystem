// Import @tensorflow/tfjs or @tensorflow/tfjs-core
//import * as tf from '@tensorflow/tfjs-core';
// Adds the WASM backend to the global backend registry.
//import * as tfjsWasm from "@tensorflow/tfjs-backend-wasm";
//import "@tensorflow/tfjs-backend-webgl";
import * as fd from '@mediapipe/face_detection';

//import {
//FaceDetector,
//createDetector,
//SupportedModels,
//FilesetResolver,
//Detection
//} from "@tensorflow-models/face-detection";

// Set the backend to WASM and wait for the module to be ready.

export class FaceLandmarkProcessor {
  private static _model: fd.FaceDetection | null = null;

  constructor() {
    //this.loadModel();
    this.loadModel();
  }

  onResults(results: fd.Results) {
    // Draw the overlays.
    if (!results && results) {
    }
  }

  //0: Left eye (from the observer’s point of view)
  //1: Right eye
  //2: Nose tip
  //3: Mouth
  //4: Left eye tragion
  //5: Right eye tragion
  calculateDistance(pointA: fd.NormalizedLandmark, pointB: fd.NormalizedLandmark) {
    let a = pointA.x - pointB.x;
    let b = pointB.y - pointB.y;
    return Math.sqrt(a * a + b * b);
  }

  loadModel() {
    try {
      FaceLandmarkProcessor._model = new fd.FaceDetection({
        locateFile: file => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection@0.4/${file}`;
        },
      });

      FaceLandmarkProcessor._model.setOptions({
        model: 'short',
        minDetectionConfidence: 0.5,
      });

      FaceLandmarkProcessor._model.onResults(this.onResults);
      console.log('Loaded face detection model successfully.');
    } catch (error) {
      console.error('Unable to load face landmarks model.', error);
    }
  }

  async processFrame(inputFrameBuffer: HTMLVideoElement, outputFrameBuffer: HTMLCanvasElement) {
    // Get image bitmap from input frame
    console.log('sfsfsf', inputFrameBuffer.videoWidth, inputFrameBuffer.videoHeight);
    //console.log("sfsfsf", inputFrameBuffer.width, inputFrameBuffer.height);
    //const inputImageBitmap = inputFrameBuffer.transferToImageBitmap();
    await FaceLandmarkProcessor._model!.send({ image: inputFrameBuffer });
    const ctx = outputFrameBuffer.getContext('2d', { alpha: true });
    ctx!.drawImage(inputFrameBuffer, 0, 0);
  }
}
