import { LocalVideoTrack, RemoteVideoTrack, Room } from 'twilio-video';
import { useCallback, useEffect, createContext, useState } from 'react';
import { useAppState } from '../../../state';
import {
  BACKGROUND_FILTER_VIDEO_CONSTRAINTS,
  DEFAULT_VIDEO_CONSTRAINTS,
  SELECTED_BACKGROUND_SETTINGS_KEY,
} from '../../../constants';
import {
  //  GaussianBlurBackgroundProcessor,
  ImageFit,
  isSupported,
  //  VirtualBackgroundProcessor,
  //} from './virtualbackground/twilio-video-processors.js';
} from '@twilio/video-processors';
import { eVirtualBackgroundProcessor } from '../../../customized/processors/background/eVirtualBackgroundProcessor';
import { HolisticProcessor } from '../../../customized/processors/holistic/HolisticProcessor';
//import {FaceLandmarkProcessor} from '../../../customized/processors/faceLandmark/FaceLandmarkProcessor';
import Abstract from '../../../images/Abstract.jpg';
import AbstractThumb from '../../../images/thumb/Abstract.jpg';
import BohoHome from '../../../images/BohoHome.jpg';
import BohoHomeThumb from '../../../images/thumb/BohoHome.jpg';
import Bookshelf from '../../../images/Bookshelf.jpg';
import BookshelfThumb from '../../../images/thumb/Bookshelf.jpg';
import CoffeeShop from '../../../images/CoffeeShop.jpg';
import CoffeeShopThumb from '../../../images/thumb/CoffeeShop.jpg';
import Contemporary from '../../../images/Contemporary.jpg';
import ContemporaryThumb from '../../../images/thumb/Contemporary.jpg';
import CozyHome from '../../../images/CozyHome.jpg';
import CozyHomeThumb from '../../../images/thumb/CozyHome.jpg';
import Desert from '../../../images/Desert.jpg';
import DesertThumb from '../../../images/thumb/Desert.jpg';
import Fishing from '../../../images/Fishing.jpg';
import FishingThumb from '../../../images/thumb/Fishing.jpg';
import Flower from '../../../images/t.png';
import FlowerThumb from '../../../images/thumb/Flower.jpg';
import Kitchen from '../../../images/Kitchen.jpg';
import KitchenThumb from '../../../images/thumb/Kitchen.jpg';
import ModernHome from '../../../images/ModernHome.jpg';
import ModernHomeThumb from '../../../images/thumb/ModernHome.jpg';
import Nature from '../../../images/Nature.jpg';
import NatureThumb from '../../../images/thumb/Nature.jpg';
import Ocean from '../../../images/Ocean.jpg';
import OceanThumb from '../../../images/thumb/Ocean.jpg';
import Patio from '../../../images/Patio.jpg';
import PatioThumb from '../../../images/thumb/Patio.jpg';
import Plant from '../../../images/Plant.jpg';
import PlantThumb from '../../../images/thumb/Plant.jpg';
import SanFrancisco from '../../../images/SanFrancisco.jpg';
import SanFranciscoThumb from '../../../images/thumb/SanFrancisco.jpg';
import { Thumbnail } from '../../BackgroundSelectionDialog/BackgroundThumbnail/BackgroundThumbnail';
import { useLocalStorageState } from '../../../hooks/useLocalStorageState/useLocalStorageState';
import useVideoContext from '../../../hooks/useVideoContext/useVideoContext';
//import useAppState from '../../../state';

export interface BackgroundSettings {
  type: string;
  index?: number;
}

const imageNames: string[] = [
  'Abstract',
  'Boho Home',
  'Bookshelf',
  'Coffee Shop',
  'Contemporary',
  'Cozy Home',
  'Desert',
  'Fishing',
  'Flower',
  'Kitchen',
  'Modern Home',
  'Nature',
  'Ocean',
  'Patio',
  'Plant',
  'San Francisco',
];

const images = [
  AbstractThumb,
  BohoHomeThumb,
  BookshelfThumb,
  CoffeeShopThumb,
  ContemporaryThumb,
  CozyHomeThumb,
  DesertThumb,
  FishingThumb,
  FlowerThumb,
  KitchenThumb,
  ModernHomeThumb,
  NatureThumb,
  OceanThumb,
  PatioThumb,
  PlantThumb,
  SanFranciscoThumb,
];

const rawImagePaths = [
  Abstract,
  BohoHome,
  Bookshelf,
  CoffeeShop,
  Contemporary,
  CozyHome,
  Desert,
  Fishing,
  Flower,
  Kitchen,
  ModernHome,
  Nature,
  Ocean,
  Patio,
  Plant,
  SanFrancisco,
];

const isDesktopChrome = /Chrome/.test(navigator.userAgent);
let imageElements = new Map();

const getImage = (index: number): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    if (imageElements.has(index)) {
      return resolve(imageElements.get(index));
    }
    const img = new Image();
    img.onload = () => {
      imageElements.set(index, img);
      resolve(img);
    };
    img.onerror = reject;
    img.src = rawImagePaths[index];
    //img.src ='../../../images/t.png';
  });
};

export const backgroundConfig = {
  imageNames,
  images,
};
const bg = new Image();
bg.src = '../../../images/t.png';
const virtualBackgroundAssets = '/virtualbackground';
//let blurProcessor:  GaussianBlurBackgroundProcessor;
//let blurProcessor:  InstanceType<typeof GaussianBlurBackgroundProcessor>;
//let virtualBackgroundProcessor:  InstanceType<typeof VirtualBackgroundProcessor>;
let _eVirtualBackgroundProcessor: InstanceType<typeof eVirtualBackgroundProcessor>;
//let faceLandmarkProcessor:  InstanceType<typeof FaceLandmarkProcessor>;
let holisticProcessor: InstanceType<typeof HolisticProcessor>;

export default function useBackgroundSettings(
  processorType: string,
  videoTrack: LocalVideoTrack | undefined,
  room?: Room | null
) {
  const { experimentNameG, conditionNameG, roleNameG } = useAppState();

  const [backgroundSettings, setBackgroundSettings] = useState<BackgroundSettings>({ type: 'none', index: 0 });

  useEffect(() => {
    if (experimentNameG === 'Nonverbal Cues Experiment' && conditionNameG === '1') {
      setBackgroundSettings({ type: processorType, index: 0 });
    } else {
      setBackgroundSettings({ type: 'none', index: 0 });
    }
  }, [experimentNameG, conditionNameG, roleNameG]);

  const setCaptureConstraints = useCallback(async () => {
    const { mediaStreamTrack, processor } = videoTrack ?? {};
    const { type } = backgroundSettings;
    if (type === 'none' && processor) {
      return mediaStreamTrack?.applyConstraints(DEFAULT_VIDEO_CONSTRAINTS as MediaTrackConstraints);
    } else if (type !== 'none' && !processor) {
      return mediaStreamTrack?.applyConstraints(BACKGROUND_FILTER_VIDEO_CONSTRAINTS as MediaTrackConstraints);
    }
  }, [backgroundSettings, videoTrack]);

  const removeProcessor = useCallback(() => {
    if (videoTrack && videoTrack.processor) {
      videoTrack.removeProcessor(videoTrack.processor);
    }
  }, [videoTrack]);

  const addProcessor = useCallback(
    //(processor: InstanceType<typeof FaceLandmarkProcessor> | InstanceType<typeof eVirtualBackgroundProcessor> | InstanceType<typeof GaussianBlurBackgroundProcessor> |  InstanceType<typeof VirtualBackgroundProcessor>) => {
    (processor: InstanceType<typeof eVirtualBackgroundProcessor> | typeof holisticProcessor) => {
      if (!videoTrack || videoTrack.processor === processor) {
        return;
      }
      removeProcessor();
      videoTrack.addProcessor(processor, {
        inputFrameBufferType: 'video',
        outputFrameBufferContextType: processorType === 'transparent' || processorType === 'landmark' ? '2d' : 'webgl2',
      });
    },
    [videoTrack, processorType, removeProcessor]
  );

  useEffect(() => {
    if (!isSupported) {
      return;
    }
    // make sure localParticipant has joined room before applying video processors
    // this ensures that the video processors are not applied on the LocalVideoPreview
    const handleProcessorChange = async () => {
      /*if (!blurProcessor) {
        blurProcessor = new GaussianBlurBackgroundProcessor({
          assetsPath: virtualBackgroundAssets,
          // Disable debounce only on desktop Chrome as other browsers either
          // do not support WebAssembly SIMD or they degrade performance.
          debounce: !isDesktopChrome,
        });
        await blurProcessor.loadModel();
      }*/
      if (!_eVirtualBackgroundProcessor) {
        _eVirtualBackgroundProcessor = new eVirtualBackgroundProcessor({
          assetsPath: virtualBackgroundAssets,
          backgroundImage: await getImage(0),
          //backgroundImage: new Image(500, 500),
          // Disable debounce only on desktop Chrome as other browsers either
          // do not support WebAssembly SIMD or they degrade performance.
          debounce: !isDesktopChrome,
          fitType: ImageFit.Fill,
        });
        await _eVirtualBackgroundProcessor.loadModel();
      }
      if (!holisticProcessor) {
        holisticProcessor = new HolisticProcessor();
        //faceLandmarkProcessor = new eVirtualBackgroundProcessor({
        // assetsPath: virtualBackgroundAssets,
        //  backgroundImage: await getImage(0),
        //backgroundImage: new Image(500, 500),
        // Disable debounce only on desktop Chrome as other browsers either
        // do not support WebAssembly SIMD or they degrade performance.
        //  debounce: !isDesktopChrome,
        //  fitType: ImageFit.Fill,
        //});
        await holisticProcessor.loadModel();
      }
      /*if (!virtualBackgroundProcessor) {
        virtualBackgroundProcessor = new VirtualBackgroundProcessor({
          assetsPath: virtualBackgroundAssets,
          backgroundImage: await getImage(8),
          // Disable debounce only on desktop Chrome as other browsers either
          // do not support WebAssembly SIMD or they degrade performance.
          debounce: !isDesktopChrome,
          fitType: ImageFit.Cover,

        });
        await virtualBackgroundProcessor.loadModel();
      }
      if (!faceLandmarkProcessor) {
        faceLandmarkProcessor = new FaceLandmarkProcessor();
        //faceLandmarkProcessor = new eVirtualBackgroundProcessor({
        // assetsPath: virtualBackgroundAssets,
        //  backgroundImage: await getImage(0),
          //backgroundImage: new Image(500, 500),
          // Disable debounce only on desktop Chrome as other browsers either
          // do not support WebAssembly SIMD or they degrade performance.
        //  debounce: !isDesktopChrome,
        //  fitType: ImageFit.Fill,
        //});
        await faceLandmarkProcessor.loadModel();
      }
      if (!room?.localParticipant) {
        return;
      }*/

      // Switch to 640x480 dimensions on desktop Chrome or browsers that
      // do not support WebAssembly SIMD to achieve optimum performance.
      //const processor = blurProcessor || _eVirtualBackgroundProcessor || virtualBackgroundProcessor || faceLandmarkProcessor;
      const processor = _eVirtualBackgroundProcessor;
      // @ts-ignore
      if (!processor._isSimdEnabled || isDesktopChrome) {
        await setCaptureConstraints();
      }

      if (backgroundSettings.type === 'blur') {
        //addProcessor(blurProcessor);
        //addProcessor(_eVirtualBackgroundProcessor);
      } else if (backgroundSettings.type === 'transparent') {
        addProcessor(holisticProcessor);
        //addProcessor(_eVirtualBackgroundProcessor);
      } else if (backgroundSettings.type === 'landmark') {
        //addProcessor(_eVirtualBackgroundProcessor);
        //addProcessor(faceLandmarkProcessor);
      } else if (backgroundSettings.type === 'image' && typeof backgroundSettings.index === 'number') {
        //virtualBackgroundProcessor.backgroundImage = await getImage(backgroundSettings.index);
        //addProcessor(virtualBackgroundProcessor);
      } else {
        removeProcessor();
      }
    };
    handleProcessorChange();
  }, [backgroundSettings, videoTrack, room, addProcessor, removeProcessor, setCaptureConstraints]);

  return [backgroundSettings, setBackgroundSettings] as const;
}
