'use strict';
import { Processor } from '../Processor';

const addAlpha = function(imageData) {
  const { data } = imageData;
  let gFloor = 105;
  let rbCeiling = 80;
  let count = 0;
  for (let r = 0, g = 1, b = 2, a = 3; a < data.length; r += 4, g += 4, b += 4, a += 4) {
    //console.log(data[r], data[g], data[b], data[a]);
    if (data[r] <= rbCeiling && data[b] <= rbCeiling && data[g] >= gFloor) {
      //if (data[g] >=100){
      data[a] = 0;
      count += 1;
    }
  }
  //console.log("how many pixels? ", count)
  return imageData;
};

export class rmGreenProcessor extends Processor {
  processFrame = function(inputFrame, outputFrame) {
    const ctx = outputFrame.getContext('2d', { alpha: true });
    ctx.drawImage(inputFrame, 0, 0);
    const width = inputFrame.videoWidth;
    const height = inputFrame.videoHeight;
    //ctx.drawImage(inputFrame, 0, 0, width, height);
    const imageData = ctx.getImageData(0, 0, width, height);
    const transparentImageData = addAlpha(imageData);
    ctx.putImageData(transparentImageData, 0, 0);
  };
}
