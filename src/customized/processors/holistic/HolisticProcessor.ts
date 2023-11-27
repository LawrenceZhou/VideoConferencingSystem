// Import @tensorflow/tfjs or @tensorflow/tfjs-core
//import * as tf from '@tensorflow/tfjs-core';
// Adds the WASM backend to the global backend registry.
//import * as tfjsWasm from "@tensorflow/tfjs-backend-wasm";
//import "@tensorflow/tfjs-backend-webgl";
import * as mediapipe_holistic from '@mediapipe/holistic';
//import { drawLandmarks, drawConnectors, drawImage, lerp } from "https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js";

//import {
//FaceDetector,
//createDetector,
//SupportedModels,
//FilesetResolver,
//Detection
//} from "@tensorflow-models/face-detection";

// Set the backend to WASM and wait for the module to be ready.

export class HolisticProcessor {
  private static holistic: mediapipe_holistic.Holistic | null = null;
  private static transparentOutput: mediapipe_holistic.GpuBuffer | null = null;
  private static ctx: CanvasRenderingContext2D | null = null;
  private static blurRadius: number;
  private static results: mediapipe_holistic.Results | null;
  constructor() {
    //this.loadModel();
    this.loadModel();
    HolisticProcessor.transparentOutput = null;
    HolisticProcessor.ctx = null;
    HolisticProcessor.blurRadius = 0;
  }

  onResults(results: mediapipe_holistic.Results) {
    // Draw the overlays.
    if (results) {
      console.log(results);
      HolisticProcessor.results = results;
      if (results['faceLandmarks']) {
        var sumZ = 0;
        results['faceLandmarks'].forEach(fL => {
          sumZ += fL['z'];
        });
        //console.log('face z: ', sumZ/478.0);
      }
      var count = 0;
      if (results.poseLandmarks) {
        var sumZ = 0;
        var count = 0;
        results.poseLandmarks.forEach(pL => {
          if (pL.visibility && pL.visibility > 0.9) {
            sumZ += pL.z;
            count += 1;
          }
        });
        //console.log('body z: ', sumZ/count);
        var z = sumZ / count;
        if (z < -2) {
          HolisticProcessor.blurRadius = 0;
        } else if (z >= -2 && z <= -0.5) {
          HolisticProcessor.blurRadius = 10;
        } else {
          HolisticProcessor.blurRadius = 20;
        }
      }

      //if (HolisticProcessor.ctx){
      if (count < 0 && HolisticProcessor.ctx) {
        HolisticProcessor.ctx.save();
        //HolisticProcessor.ctx.drawImage(results.image, 0, 0);
        HolisticProcessor.transparentOutput = results.image;
        let width = results.image.width;
        let height = results.image.height;

        if (results.segmentationMask) {
          HolisticProcessor.ctx.drawImage(results.segmentationMask, 0, 0, width, height);
          HolisticProcessor.ctx.globalCompositeOperation = 'source-in';
          // This can be a color or a texture or whatever...
          //HolisticProcessor.ctx.fillStyle = '#0000000F';
          //HolisticProcessor.ctx.fillStyle = '#00FF0080';
          //HolisticProcessor.ctx.fillRect(0, 0, width, height);

          // HolisticProcessor.ctx.globalCompositeOperation = 'source-out';
          // HolisticProcessor.ctx.fillStyle = '#00FF00';
          //  HolisticProcessor.ctx.fillRect(0, 0, width, height);

          //HolisticProcessor.ctx.globalCompositeOperation = 'destination-atop';

          //HolisticProcessor.ctx.globalCompositeOperation = 'source-in';
          // This can be a color or a texture or whatever...
          //HolisticProcessor.ctx.globalAlpha=1.0;
          //HolisticProcessor.ctx.fillStyle = '#FFFFFF';
          //HolisticProcessor.ctx.fillRect(0, 0, width, height);
          //HolisticProcessor.ctx.globalAlpha=0.0;
          //HolisticProcessor.ctx.filter = "blur(" + HolisticProcessor.blurRadius + "px)";
          HolisticProcessor.ctx.drawImage(results.image, 0, 0, width, height);
          //HolisticProcessor.ctx.globalCompositeOperation = "destination-atop";
          //HolisticProcessor.ctx.drawImage(
          //  results.image, 0, 0, width, height);
          //HolisticProcessor.ctx.fillStyle = '#00FF00';
          //HolisticProcessor.ctx.fillRect(0, 0, width, height);
          HolisticProcessor.ctx.restore();
          //HolisticProcessor.ctx.filter = 'none';
          //HolisticProcessor.ctx.globalAlpha=0.0;
          /*
      var myImageData = HolisticProcessor.ctx.getImageData(0, 0, width, height);
      //var myImageData_ = myImageData.data;
      for (let r = 0, g = 1, b = 2, a = 3; a < myImageData.data.length; r += 4, g += 4, b += 4, a += 4) {
        //console.log(data[r], data[g], data[b], data[a]);
        //if(r<200){
        console.log(myImageData.data[a],myImageData.data[r], myImageData.data[g], myImageData.data[b]);
      //}
        if (myImageData.data[a]== 0 && myImageData.data[r]== 0 && myImageData.data[g]== 0 && myImageData.data[b]== 0 ){
        //if (data[g] >=100){
          console.log("fffff");
            myImageData.data[a] = 0;
            myImageData.data[r] = 0;
            myImageData.data[g] = 255;
            myImageData.data[b] = 0;
            
        }
    }
   HolisticProcessor.ctx.putImageData(myImageData,0,0);//put image data back
*/

          //HolisticProcessor.ctx.globalCompositeOperation = 'source-out';
          //HolisticProcessor.ctx.fillStyle = '#00FF00';
          //HolisticProcessor.ctx.fillRect(0, 0, width, height);

          HolisticProcessor.ctx.globalCompositeOperation = 'source-over';
          //HolisticProcessor.ctx.restore();
        } else {
          HolisticProcessor.ctx.drawImage(results.image, 0, 0, width, height);
        }

        //HolisticProcessor.semioutput = HolisticProcessor.ctx!.getImageData(0, 0, width, height).data;
      }
    }
  }

  //0: Left eye (from the observer’s point of view)
  //1: Right eye
  //2: Nose tip
  //3: Mouth
  //4: Left eye tragion
  //5: Right eye tragion
  calculateDistance(
    pointA: mediapipe_holistic.NormalizedLandmark,
    pointB: mediapipe_holistic.NormalizedLandmark
  ): GLfloat {
    let a = pointA.x - pointB.x;
    let b = pointB.y - pointB.y;
    return Math.sqrt(a * a + b * b);
  }

  loadModel() {
    try {
      HolisticProcessor.holistic = new mediapipe_holistic.Holistic({
        locateFile: file => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`;
        },
      });
      HolisticProcessor.holistic.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: true,
        smoothSegmentation: true,
        refineFaceLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });
      HolisticProcessor.holistic.onResults(this.onResults);
    } catch (error) {
      console.error('Unable to load face landmarks model.', error);
    }
  }

  async processFrame(inputFrameBuffer: HTMLVideoElement, outputFrameBuffer: HTMLCanvasElement) {
    // Get image bitmap from input frame
    console.log('sfsfsf', inputFrameBuffer.videoWidth, inputFrameBuffer.videoHeight);
    //console.log("sfsfsf", inputFrameBuffer.width, inputFrameBuffer.height);
    //const inputImageBitmap = inputFrameBuffer.transferToImageBitmap();
    if (HolisticProcessor.holistic) {
      await HolisticProcessor.holistic.send({ image: inputFrameBuffer });
    }
    //const ctx = outputFrameBuffer.getContext('2d', {alpha: true});
    //ctx!.drawImage(inputFrameBuffer, 0, 0);

    //trasparent background
    if (!HolisticProcessor.ctx) {
      HolisticProcessor.ctx = outputFrameBuffer.getContext('2d', { alpha: true });
      //outputFrameBuffer=HolisticProcessor.semioutput;
    }
    //HolisticProcessor.ctx!.drawImage(inputFrameBuffer, 0, 0);

    //this.ctx!.drawImage(inputFrameBuffer, 0, 0);
    const width = inputFrameBuffer.videoWidth;
    const height = inputFrameBuffer.videoHeight;
    //HolisticProcessor.ctx!.drawImage(inputFrameBuffer, 0, 0, width, height);
    if (HolisticProcessor.results && HolisticProcessor.results.segmentationMask) {
      let ctx = outputFrameBuffer.getContext('2d', { alpha: true });
      //ctx!.save();
      ctx!.drawImage(HolisticProcessor.results.segmentationMask, 0, 0, width, height);
      ctx!.globalCompositeOperation = 'source-in';
      ctx!.filter = 'blur(' + HolisticProcessor.blurRadius + 'px)';
      ctx!.drawImage(HolisticProcessor.results.image, 0, 0, width, height);
      ctx!.globalCompositeOperation = 'destination-atop';
      ctx!.filter = 'blur(0px)';
      ctx!.fillStyle = '#00FF00';
      ctx!.fillRect(0, 0, width, height);
      ctx!.globalCompositeOperation = 'copy';
      //ctx!.clearRect(0, 0, width, height)
      //ctx!.restore();
      /*const imageData = ctx!.getImageData(0, 0, width, height);
      ctx!.drawImage(
        inputFrameBuffer, 0, 0, width, height);
      ctx!.globalCompositeOperation = 'source-out';
       ctx!.fillStyle = '#00FF00';
       ctx!.fillRect(0, 0, width, height);*/
      //const transparentImageData = addAlpha(imageData);
      //ctx.putImageData(transparentImageData, 0, 0);
    }
    //const imageData = ctx.getImageData(0, 0, width, height);
    //const transparentImageData = addAlpha(imageData);
    //ctx.putImageData(transparentImageData, 0, 0);
  }
}
