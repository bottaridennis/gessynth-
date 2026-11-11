import { Landmark } from './gesture-classifier';

export interface HandDetectionFrame {
  leftHandLandmarks: Landmark[] | null;
  rightHandLandmarks: Landmark[] | null;
  rawResults: unknown;
}

/** Must stay in sync with the installed @mediapipe/tasks-vision version. */
const MEDIAPIPE_VERSION = '1.2.0';
const LOCAL_WASM_PATH = 'mediapipe/wasm';
const MODEL_PATH =
  'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';
const CDN_WASM_PATH = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MEDIAPIPE_VERSION}/wasm`;

export class HandTrackerService {
  private handLandmarker: unknown = null;
  private isLoaded = false;
  private isCameraActive = false;
  private videoStream: MediaStream | null = null;
  private loadingPromise: Promise<boolean> | null = null;
  private lastVideoTime = -1;
  private lastCachedFrame: HandDetectionFrame = {
    leftHandLandmarks: null,
    rightHandLandmarks: null,
    rawResults: null,
  };

  async loadMediaPipe(): Promise<boolean> {
    if (this.isLoaded && this.handLandmarker) return true;
    if (this.loadingPromise) return this.loadingPromise;

    this.loadingPromise = (async () => {
      try {
        if (typeof window === 'undefined') return false;

        const tasksVision = await import('@mediapipe/tasks-vision');
        if (!tasksVision?.FilesetResolver || !tasksVision?.HandLandmarker) {
          throw new Error('TasksVision exports not available');
        }

        const { FilesetResolver, HandLandmarker } = tasksVision;

        const createLandmarker = async (wasmBase: string) => {
          const vision = await FilesetResolver.forVisionTasks(wasmBase);
          try {
            return await HandLandmarker.createFromOptions(vision, {
              baseOptions: { modelAssetPath: MODEL_PATH, delegate: 'GPU' },
              runningMode: 'VIDEO',
              numHands: 2,
            });
          } catch (gpuErr) {
            console.warn('GPU delegate failed, using CPU delegate:', gpuErr);
            return await HandLandmarker.createFromOptions(vision, {
              baseOptions: { modelAssetPath: MODEL_PATH, delegate: 'CPU' },
              runningMode: 'VIDEO',
              numHands: 2,
            });
          }
        };

        // The WASM runtime MUST match the JS bundle version. It is copied from
        // node_modules into the build output (see angular.json "assets"), so it is
        // served from the same origin and works under any GitHub Pages sub-path.
        // A version-matched CDN copy is used as a fallback.
        const localWasm = new URL(LOCAL_WASM_PATH, document.baseURI).href;
        try {
          this.handLandmarker = await createLandmarker(localWasm);
        } catch (localErr) {
          console.warn('Local MediaPipe WASM not available, using CDN:', localErr);
          this.handLandmarker = await createLandmarker(CDN_WASM_PATH);
        }

        this.isLoaded = true;
        console.log('MediaPipe HandLandmarker initialized successfully!');
        return true;
      } catch (err) {
        console.warn('MediaPipe initialization failed:', err);
        // Allow a later retry (e.g. after a network hiccup)
        this.loadingPromise = null;
        return false;
      }
    })();

    return this.loadingPromise;
  }

  async startCamera(videoElement: HTMLVideoElement): Promise<boolean> {
    if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      return false;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
        },
        audio: false,
      });

      this.videoStream = stream;
      videoElement.srcObject = stream;

      await new Promise<void>((resolve) => {
        if (videoElement.readyState >= 1) {
          videoElement.play().catch(() => undefined).finally(resolve);
          return;
        }
        videoElement.onloadedmetadata = async () => {
          try {
            await videoElement.play();
          } catch {
            // auto-play catch
          }
          resolve();
        };
      });

      this.isCameraActive = true;
      return true;
    } catch (err) {
      console.warn('Camera access denied or unavailable:', err);
      this.isCameraActive = false;
      return false;
    }
  }

  stopCamera(videoElement?: HTMLVideoElement): void {
    if (this.videoStream) {
      this.videoStream.getTracks().forEach((track) => track.stop());
      this.videoStream = null;
    }
    if (videoElement) {
      videoElement.srcObject = null;
    }
    this.isCameraActive = false;
    this.lastVideoTime = -1;
  }

  isReady(): boolean {
    return this.isLoaded && this.isCameraActive && this.handLandmarker !== null;
  }

  detect(videoElement: HTMLVideoElement, timestamp: number): HandDetectionFrame {
    if (!this.isReady() || videoElement.readyState < 2) {
      return { leftHandLandmarks: null, rightHandLandmarks: null, rawResults: null };
    }

    // MediaPipe requires video.currentTime to have changed
    if (videoElement.currentTime === this.lastVideoTime) {
      return this.lastCachedFrame;
    }
    this.lastVideoTime = videoElement.currentTime;

    try {
      const landmarker = this.handLandmarker as {
        detectForVideo: (
          video: HTMLVideoElement,
          time: number
        ) => {
          landmarks: Landmark[][];
          handedness: { categoryName: string; score: number }[][];
        };
      };

      const results = landmarker.detectForVideo(videoElement, timestamp);
      let leftHand: Landmark[] | null = null;
      let rightHand: Landmark[] | null = null;

      if (results && results.landmarks && results.landmarks.length > 0) {
        results.landmarks.forEach((handLandmarks, idx) => {
          const category = results.handedness[idx]?.[0]?.categoryName;
          if (category === 'Left') {
            leftHand = handLandmarks;
          } else if (category === 'Right') {
            rightHand = handLandmarks;
          }
        });
      }

      this.lastCachedFrame = {
        leftHandLandmarks: leftHand,
        rightHandLandmarks: rightHand,
        rawResults: results,
      };

      return this.lastCachedFrame;
    } catch {
      return this.lastCachedFrame;
    }
  }
}
