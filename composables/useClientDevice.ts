import type {
  DeviceType,
  DeviceOrientation,
  DeviceOrientationDetail,
} from '~/types';

// tailwind breakpoints
const BREAKPOINTS = {
  'xs': 480,
  'sm': 640,
  'md': 768,
  'lg': 1024,
  'xl': 1280,
  '2xl': 1536,
};

const PORTRAIT_BREAKPOINTS = {
  tablet: BREAKPOINTS.xl,
  phone: BREAKPOINTS.sm,
};

const LANDSCAPE_BREAKPOINTS = {
  tablet: BREAKPOINTS['2xl'],
  phone: BREAKPOINTS.lg,
};

export default () => {
  const device = useState<{
    form: DeviceType | undefined
    simpleOrientation: DeviceOrientation | undefined
    appearance: ComputedRef<boolean>
    clientWidth: number
    clientHeight: number
    orientation: {
      angle: number
      type: DeviceOrientationDetail | undefined
    }
    screen: {
      width: number
      height: number
      colorDepth: number
      devicePixelRatio: number
    }
    ua: {
      success: boolean
      mobile: boolean
      model: string
      platform: string
      platformVersion: string
    }
    media: {
      hasTouch: boolean
    }
  }>(
    'use-client-device',
    () => ({
      form: undefined,
      simpleOrientation: undefined,
      appearance: usePreferredDark(), // tracks system colour mode
      clientWidth: NaN,
      clientHeight: NaN,
      orientation: {
        angle: NaN,
        type: undefined,
      },
      screen: {
        width: NaN,
        height: NaN,
        colorDepth: NaN,
        devicePixelRatio: NaN,
      },
      ua: {
        success: false,
        mobile: false,
        model: '',
        platform: '',
        platformVersion: '',
      },
      media: {
        hasTouch: false,
      },
    }));

  if (import.meta.client) {
    let width = NaN;
    let height = NaN;
    let isPortrait = false;

    const updateOrientation = () => {
      device.value.orientation.angle = Math.floor(window.screen.orientation.angle ?? NaN);
      device.value.orientation.type = window.screen.orientation.type;

      width = window.innerWidth;
      height = window.innerHeight;
      isPortrait = height >= width;

      device.value.simpleOrientation = isPortrait ? 'portrait' : 'landscape';
    };

    const updateElement = () => {
      device.value.clientWidth = Math.floor(document.documentElement.clientWidth ?? NaN);
      device.value.clientHeight = Math.floor(document.documentElement.clientHeight ?? NaN);
    };

    const updateFormFactor = () => {
      const breakpoints = device.value.simpleOrientation === 'portrait' ? PORTRAIT_BREAKPOINTS : LANDSCAPE_BREAKPOINTS;

      if (width >= breakpoints.tablet)
        device.value.form = 'Desktop';
      else if (width >= breakpoints.phone)
        device.value.form = 'Tablet';
      else
        device.value.form = 'Phone';
    };

    const updateScreen = () => {
      device.value.screen.width = Math.floor(window.screen.width ?? NaN);
      device.value.screen.height = Math.floor(window.screen.height ?? NaN);
      device.value.screen.colorDepth = Math.floor(window.screen.colorDepth ?? NaN);
      device.value.screen.devicePixelRatio = Math.floor(window.devicePixelRatio ?? NaN);
    };

    const getUA = async () => {
      const hints = [
        'mobile',
        'model',
        'platform',
        'platformVersion',
      ];

      try {
        // @ts-expect-error :userAgentData is still enperimental (not yet compatible with some browser .i.e, Firefox)
        const data = await navigator.userAgentData.getHighEntropyValues(hints);

        device.value.ua.success = true;
        device.value.ua.mobile = data.mobile;
        device.value.ua.model = data.model;
        device.value.ua.platform = data.platform;
        device.value.ua.platformVersion = data.platformVersion;
      }
      catch {
        device.value.ua.success = false;
      }
    };

    const getMatchMediaItems = () => {
      device.value.media.hasTouch = matchMedia('(any-pointer: coarse)').matches;
    };

    updateOrientation();
    updateElement();

    updateFormFactor();
    updateScreen();
    getUA();
    getMatchMediaItems();

    // auto removed when component using is unmounted
    useEventListener(
      window,
      [
        'resize',
        'orientationchange',
        'visibilitychange',
      ],
      () => {
        if (window.document.visibilityState === 'visible') {
          updateOrientation();
          updateElement();

          if (import.meta.dev) // only in dev environment
            updateFormFactor();
        }
      },
    );
  }

  // get type inferrence at other end this way
  return device;
};
