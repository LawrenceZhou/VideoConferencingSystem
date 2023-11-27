import { BackgroundProcessor, BackgroundProcessorOptions } from './BackgroundProcessor';
import { WebGL2PipelineType } from '../../types';
//import * from '../../constants';

export interface TransparentBackgroundProcessorOptions extends BackgroundProcessorOptions {}

export class TransparentBackgroundProcessor extends BackgroundProcessor {
  //private readonly _name: string = "TransparentBackgroundProcessor";

  constructor(option: TransparentBackgroundProcessorOptions) {
    super(option);
  }
  _getWebGL2PipelineType() {
    return WebGL2PipelineType.Image;
  }

  _setBackground() {
    return;
  }
}
