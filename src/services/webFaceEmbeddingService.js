import * as tf from '@tensorflow/tfjs';
import * as tflite from '@tensorflow/tfjs-tflite';
import * as faceDetection from '@tensorflow-models/face-detection';

// Configure local WASM path for TFLite runner
try {
  tflite.setWasmPath('/tfjs-tflite-wasm/');
} catch (e) {
  console.warn('Warning setting TFLite WASM path:', e);
}

class WebFaceEmbeddingService {
  constructor() {
    this.model = null;
    this.detector = null;
    this.isInitializing = false;
    this.initPromise = null;
  }

  /**
   * Initializes both the Face Detector and MobileFaceNet TFLite models in the browser
   */
  async init() {
    if (this.model && this.detector) return;
    if (this.isInitializing) return this.initPromise;

    this.isInitializing = true;
    this.initPromise = (async () => {
      try {
        console.log('[WebFaceEmbeddingService] Initializing TensorFlow.js and MobileFaceNet...');
        await tf.ready();

        // 1. Initialize Face Detector (MediaPipe BlazeFace)
        if (!this.detector) {
          const detectorModel = faceDetection.SupportedModels.MediaPipeFaceDetector;
          const detectorConfig = {
            runtime: 'tfjs',
            maxFaces: 5,
            modelType: 'short'
          };
          this.detector = await faceDetection.createDetector(detectorModel, detectorConfig);
          console.log('[WebFaceEmbeddingService] âœ… Face detector loaded');
        }

        // 2. Load MobileFaceNet TFLite Model
        if (!this.model) {
          this.model = await tflite.loadTFLiteModel('/models/mobilefacenet.tflite');
          console.log('[WebFaceEmbeddingService] âœ… MobileFaceNet TFLite model loaded');
        }
      } catch (err) {
        console.error('[WebFaceEmbeddingService] â Œ Failed to initialize models:', err);
        throw err;
      } finally {
        this.isInitializing = false;
      }
    })();

    return this.initPromise;
  }

  /**
   * Converts a File or Blob into a Base64 data URL string
   * @param {File|Blob} file
   * @returns {Promise<string>}
   */
  fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  }

  /**
   * Converts a base64 or Image URL to an HTMLImageElement
   * @param {string} src
   * @returns {Promise<HTMLImageElement>}
   */
  loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = (err) => reject(new Error('Failed to load image element'));
      img.src = src;
    });
  }

  /**
   * Detects faces in the image and crops the best face to 112x112
   * @param {HTMLImageElement} imgElement
   */
  async detectAndCropFace(imgElement) {
    await this.init();

    const faces = await this.detector.estimateFaces(imgElement, { flipHorizontal: false });

    if (!faces || faces.length === 0) {
      throw new Error('No face detected in the uploaded photo. Please upload a clear frontal portrait.');
    }

    // Pick the largest/most confident face
    const primaryFace = faces.reduce((prev, current) => {
      const prevArea = (prev.box.width || 0) * (prev.box.height || 0);
      const currArea = (current.box.width || 0) * (current.box.height || 0);
      return currArea > prevArea ? current : prev;
    }, faces[0]);

    const box = primaryFace.box;
    const imgWidth = imgElement.naturalWidth || imgElement.width;
    const imgHeight = imgElement.naturalHeight || imgElement.height;

    // Add 15% margin around the face bounding box for standard MobileFaceNet alignment
    const marginX = box.width * 0.15;
    const marginY = box.height * 0.15;

    const cropX = Math.max(0, box.xMin - marginX);
    const cropY = Math.max(0, box.yMin - marginY);
    const cropW = Math.min(imgWidth - cropX, box.width + marginX * 2);
    const cropH = Math.min(imgHeight - cropY, box.height + marginY * 2);

    // Create 112x112 Canvas
    const canvas = document.createElement('canvas');
    canvas.width = 112;
    canvas.height = 112;
    const ctx = canvas.getContext('2d');

    // Draw cropped face onto 112x112 canvas
    ctx.drawImage(imgElement, cropX, cropY, cropW, cropH, 0, 0, 112, 112);

    return {
      canvas,
      croppedDataUrl: canvas.toDataURL('image/jpeg', 0.95),
      box: {
        x: cropX,
        y: cropY,
        width: cropW,
        height: cropH
      },
      totalFaces: faces.length
    };
  }

  /**
   * Generates a 192-dimensional MobileFaceNet embedding from a 112x112 canvas.
   * Matches E:\APP\accesseasy_patrol_app\lib\biometric\ai.dart: _preProcess & normalization.
   * @param {HTMLCanvasElement} canvas112
   * @returns {number[]} 192-dimensional L2-normalized float array
   */
  generateEmbedding(canvas112) {
    if (!this.model) {
      throw new Error('MobileFaceNet model is not initialized yet.');
    }

    return tf.tidy(() => {
      // 1. Get raw pixels [112, 112, 3]
      const tensorFromPixels = tf.browser.fromPixels(canvas112);

      // 2. Preprocess: Normalize [0..255] -> [-1.0, 1.0] matching Flutter (pixel/255.0 - 0.5) * 2.0
      const floatTensor = tensorFromPixels.toFloat();
      const normalized = floatTensor.div(tf.scalar(255.0)).sub(tf.scalar(0.5)).mul(tf.scalar(2.0));

      // 3. Add batch dimension: [1, 112, 112, 3]
      const inputTensor = normalized.expandDims(0);

      // 4. Run MobileFaceNet TFLite prediction
      const outputTensor = this.model.predict(inputTensor);

      // 5. Extract raw 192-dimensional float values
      const rawVector = Array.from(outputTensor.dataSync());

      if (rawVector.length !== 192) {
        console.warn(`[WebFaceEmbeddingService] Unexpected embedding dimension: ${rawVector.length} (expected 192)`);
      }

      // 6. L2 Normalization: v / sqrt(sum(v_i^2))
      let norm = 0;
      for (let i = 0; i < rawVector.length; i++) {
        norm += rawVector[i] * rawVector[i];
      }
      norm = Math.sqrt(norm);

      if (norm === 0) return rawVector;

      const normalizedEmbedding = rawVector.map(v => Number((v / norm).toFixed(7)));

      return normalizedEmbedding;
    });
  }

  /**
   * Full pipeline: Takes an image File, extracts Base64 string, detects face, and generates 192-d embedding.
   * @param {File} file
   */
  async processImageFile(file) {
    const base64Image = await this.fileToBase64(file);
    const imgElement = await this.loadImage(base64Image);

    // Detect and crop to 112x112
    const { canvas, croppedDataUrl, box, totalFaces } = await this.detectAndCropFace(imgElement);

    // Extract 192-d MobileFaceNet embedding
    const embedding = this.generateEmbedding(canvas);

    return {
      success: true,
      embedding,
      base64Image, // Raw image Base64 for Directus rawImage field
      croppedDataUrl, // 112x112 preview
      totalFacesDetected: totalFaces,
      faceBox: box,
      originalDimensions: {
        width: imgElement.naturalWidth || imgElement.width,
        height: imgElement.naturalHeight || imgElement.height
      }
    };
  }
}

export const webFaceEmbeddingService = new WebFaceEmbeddingService();
export default webFaceEmbeddingService;
