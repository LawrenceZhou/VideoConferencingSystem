export const BACKGROUND_FILTER_VIDEO_CONSTRAINTS: MediaStreamConstraints['video'] = {
  width: { min: 640, max: 640, ideal: 640 },
  height: { min: 360, max: 360, ideal: 360 },
  frameRate: 24,
};

export const DEFAULT_VIDEO_CONSTRAINTS: MediaStreamConstraints['video'] = {
  width: { min: 640, max: 640, ideal: 640 },
  height: { min: 360, max: 360, ideal: 360 },
  frameRate: 24,
};

// These are used to store the selected media devices in localStorage
export const SELECTED_AUDIO_INPUT_KEY = 'TwilioVideoApp-selectedAudioInput';
export const SELECTED_AUDIO_OUTPUT_KEY = 'TwilioVideoApp-selectedAudioOutput';
export const SELECTED_VIDEO_INPUT_KEY = 'TwilioVideoApp-selectedVideoInput';

// This is used to store the current background settings in localStorage
export const SELECTED_BACKGROUND_SETTINGS_KEY = 'TwilioVideoApp-selectedBackgroundSettings';

export const GALLERY_VIEW_ASPECT_RATIO = 9 / 16; // 16:9
export const GALLERY_VIEW_MARGIN = 0;
