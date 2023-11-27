'use strict';

var __extends =
  (this && this.__extends) ||
  (function() {
    var extendStatics = function(d, b) {
      extendStatics =
        Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array &&
          function(d, b) {
            d.__proto__ = b;
          }) ||
        function(d, b) {
          for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
        };
      return extendStatics(d, b);
    };
    return function(d, b) {
      extendStatics(d, b);
      function __() {
        this.constructor = d;
      }
      d.prototype = b === null ? Object.create(b) : ((__.prototype = b.prototype), new __());
    };
  })();
Object.defineProperty(exports, '__esModule', { value: true });
exports.eVirtualBackgroundProcessor = void 0;
var BackgroundProcessor_1 = require('./BackgroundProcessor');
var types_1 = require('../../types');

/**
 * The eVirtualBackgroundProcessor, when added to a VideoTrack,
 * replaces the background in each video frame with a given image,
 * and leaves the foreground (person(s)) untouched. Each instance of
 * eVirtualBackgroundProcessor should be added to only one VideoTrack
 * at a time to prevent overlapping of image data from multiple VideoTracks.
 *
 * @example
 *
 * ```ts
 * import { createLocalVideoTrack } from 'twilio-video';
 * import { Pipeline, eVirtualBackgroundProcessor } from '@twilio/video-processors';
 *
 * let virtualBackground;
 * const img = new Image();
 *
 * img.onload = () => {
 *   virtualBackground = new eVirtualBackgroundProcessor({
 *     assetsPath: 'https://my-server-path/assets',
 *     backgroundImage: img,
 *     pipeline: Pipeline.WebGL2,
 *
 *     // Desktop Safari and iOS browsers do not support SIMD.
 *     // Set debounce to true to achieve an acceptable performance.
 *     debounce: isSafari(),
 *   });
 *
 *   virtualBackground.loadModel().then(() => {
 *     createLocalVideoTrack({
 *       // Increasing the capture resolution decreases the output FPS
 *       // especially on browsers that do not support SIMD
 *       // such as desktop Safari and iOS browsers
 *       width: 640,
 *       height: 480,
 *       // Any frame rate above 24 fps on desktop browsers increase CPU
 *       // usage without noticeable increase in quality.
 *       frameRate: 24
 *     }).then(track => {
 *       track.addProcessor(virtualBackground, {
 *         inputFrameBufferType: 'video',
 *         outputFrameBufferContextType: 'webgl2',
 *       });
 *     });
 *   });
 * };
 * img.src = '/background.jpg';
 * ```
 */
var eVirtualBackgroundProcessor = /** @class */ (function(_super) {
  __extends(eVirtualBackgroundProcessor, _super);
  /**
   * Construct a eVirtualBackgroundProcessor. Default values will be used for
   * any missing optional properties in [[eVirtualBackgroundProcessorOptions]],
   * and invalid properties will be ignored.
   */
  function eVirtualBackgroundProcessor(options) {
    var _this = _super.call(this, options) || this;
    // tslint:disable-next-line no-unused-variable
    _this._name = 'eVirtualBackgroundProcessor';
    _this.backgroundImage = options.backgroundImage;
    _this.fitType = options.fitType;

    return _this;
  }
  Object.defineProperty(eVirtualBackgroundProcessor.prototype, 'backgroundImage', {
    /**
     * The HTMLImageElement representing the current background image.
     */
    get: function() {
      return this._backgroundImage;
    },
    /**
     * Set an HTMLImageElement as the new background image.
     * An error will be raised if the image hasn't been fully loaded yet. Additionally, the image must follow
     * [security guidelines](https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_enabled_image)
     * when loading the image from a different origin. Failing to do so will result to an empty output frame.
     */
    set: function(image) {
      var _a;
      if (!image || !image.complete || !image.naturalHeight) {
        //    throw new Error('Invalid image. Make sure that the image is an HTMLImageElement and has been successfully loaded');
      }
      this._backgroundImage = image;
      // Triggers recreation of the pipeline in the next processFrame call
      (_a = this._webgl2Pipeline) === null || _a === void 0 ? void 0 : _a.cleanUp();
      this._webgl2Pipeline = null;
    },
    enumerable: false,
    configurable: true,
  });
  Object.defineProperty(eVirtualBackgroundProcessor.prototype, 'fitType', {
    /**
     * The current [[ImageFit]] for positioning of the background image in the viewport.
     */
    get: function() {
      return this._fitType;
    },
    /**
     * Set a new [[ImageFit]] to be used for positioning the background image in the viewport.
     */
    set: function(fitType) {
      var validTypes = Object.keys(types_1.ImageFit);
      if (!validTypes.includes(fitType)) {
        console.warn("Valid fitType not found. Using '" + types_1.ImageFit.Fill + "' as default.");
        fitType = types_1.ImageFit.Fill;
      }
      this._fitType = fitType;
    },
    enumerable: false,
    configurable: true,
  });
  eVirtualBackgroundProcessor.prototype._getWebGL2PipelineType = function() {
    return types_1.WebGL2PipelineType.Blur;
  };
  eVirtualBackgroundProcessor.prototype._setBackground = function() {
    if (!this._outputContext || !this._outputCanvas) {
      // console.log("vvv");

      return;
    }
    //console.log("sss");

    var img = this._backgroundImage;
    var imageWidth = img.naturalWidth;
    var imageHeight = img.naturalHeight;
    var canvasWidth = this._outputCanvas.width;
    var canvasHeight = this._outputCanvas.height;
    var ctx = this._outputContext;
    //ctx.globalAlpha=1.0;

    ctx.save();
    //ctx.globalAlpha=0.01;
    //ctx.fillStyle = "white";

    //ctx.globalCompositeOperation = 'source-in';
    ctx.fillStyle = '#00FF00';
    //ctx.fillStyle = '#FFFF00';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    ctx.restore();
    //ctx.globalAlpha=1.0;

    /*
        if (this._fitType === types_1.ImageFit.Fill) {
            ctx.drawImage(img, 0, 0, imageWidth, imageHeight, 0, 0, canvasWidth, canvasHeight);
        }
        else if (this._fitType === types_1.ImageFit.None) {
        ctx.drawImage(img, 0, 0, imageWidth, imageHeight);
        }
        else if (this._fitType === types_1.ImageFit.Contain) {
            var _a = this._getFitPosition(imageWidth, imageHeight, canvasWidth, canvasHeight, types_1.ImageFit.Contain), x = _a.x, y = _a.y, w = _a.w, h = _a.h;
            ctx.drawImage(img, 0, 0, imageWidth, imageHeight, x, y, w, h);
        }
        else if (this._fitType === types_1.ImageFit.Cover) {
            console.log("qqq");
            var _b = this._getFitPosition(imageWidth, imageHeight, canvasWidth, canvasHeight, types_1.ImageFit.Cover), x = _b.x, y = _b.y, w = _b.w, h = _b.h;
            ctx.drawImage(img, 0, 0, imageWidth, imageHeight, x, y, w, h);
        }
        //ctx.globalAlpha=1.0;
       */
  };
  eVirtualBackgroundProcessor.prototype._getFitPosition = async function(
    contentWidth,
    contentHeight,
    viewportWidth,
    viewportHeight,
    type
  ) {
    // Calculate new content width to fit viewport width

    var factor = viewportWidth / contentWidth;
    var newContentWidth = viewportWidth;
    var newContentHeight = factor * contentHeight;
    // Scale down the resulting height and width more
    // to fit viewport height if the content still exceeds it
    if (
      (type === types_1.ImageFit.Contain && newContentHeight > viewportHeight) ||
      (type === types_1.ImageFit.Cover && viewportHeight > newContentHeight)
    ) {
      factor = viewportHeight / newContentHeight;
      newContentWidth = factor * newContentWidth;
      newContentHeight = viewportHeight;
    }
    // Calculate the destination top left corner to center the content
    var x = (viewportWidth - newContentWidth) / 2;
    var y = (viewportHeight - newContentHeight) / 2;
    return {
      x: x,
      y: y,
      w: newContentWidth,
      h: newContentHeight,
    };
  };
  return eVirtualBackgroundProcessor;
})(BackgroundProcessor_1.BackgroundProcessor);
exports.eVirtualBackgroundProcessor = eVirtualBackgroundProcessor;
//# sourceMappingURL=eVirtualBackgroundProcessor.js.map
