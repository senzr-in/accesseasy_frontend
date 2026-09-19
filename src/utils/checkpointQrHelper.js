import QRCodeStyling from 'qr-code-styling';
import QRCodeLib from 'qrcode';

export const DEFAULT_PATROL_LOGO = '/images/logoPatrol.png';

/**
 * Generate standard signature and formatted QR payload string for a checkpoint
 * @param {string} checkpointId
 * @param {string} tenantId
 * @returns {string} e.g. "ACPT::CP-001::YWJj..."
 */
export function generateCheckpointQrData(checkpointId, tenantId) {
  if (!checkpointId) return '';
  const rawString = `${checkpointId}-${tenantId || 'global'}-AccessEasy2026`;
  const signature = btoa(unescape(encodeURIComponent(rawString))).replace(/=/g, '');
  return `ACPT::${checkpointId}::${signature}`;
}

/**
 * Create a configured QRCodeStyling instance with AccessEasy Patrol logo and Level H redundancy
 * @param {string} qrData - Raw QR payload string
 * @param {Object} [options]
 * @returns {QRCodeStyling}
 */
export function createCheckpointQrStyling(qrData, options = {}) {
  const size = options.size || 400;
  const logo = options.logo !== undefined ? options.logo : DEFAULT_PATROL_LOGO;

  return new QRCodeStyling({
    width: size,
    height: size,
    type: 'canvas',
    data: qrData,
    image: logo || undefined,
    qrOptions: {
      typeNumber: 0,
      mode: 'Byte',
      errorCorrectionLevel: 'H' // High (~30%) recovery to ensure scannability with central logo
    },
    imageOptions: {
      crossOrigin: 'anonymous',
      hideBackgroundDots: true,
      imageSize: options.imageSize || 0.28,
      margin: options.imageMargin || 4
    },
    dotsOptions: {
      color: options.dotColor || '#0F172A',
      type: options.dotType || 'rounded'
    },
    cornersSquareOptions: {
      color: options.cornerColor || '#4338CA', // Indigo-700 accent
      type: 'extra-rounded'
    },
    cornersDotOptions: {
      color: options.cornerDotColor || '#4F46E5', // Indigo-600
      type: 'dot'
    },
    backgroundOptions: {
      color: '#FFFFFF'
    },
    margin: options.margin !== undefined ? options.margin : 10
  });
}

/**
 * Generate a Base64 Data URL for a checkpoint QR code with the AccessEasy Patrol logo embedded.
 * Uses QRCodeStyling with an HTML5 canvas overlay fallback.
 * @param {string} checkpointId
 * @param {string} tenantId
 * @param {Object} [options]
 * @returns {Promise<string>} Base64 Data URL
 */
export async function getCheckpointQrDataUrl(checkpointId, tenantId, options = {}) {
  const qrData = generateCheckpointQrData(checkpointId, tenantId);
  const size = options.size || 400;
  const logo = options.logo !== undefined ? options.logo : DEFAULT_PATROL_LOGO;

  try {
    const qrStyling = createCheckpointQrStyling(qrData, { size, logo, ...options });
    const rawBlob = await qrStyling.getRawData('png');
    if (rawBlob) {
      return await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(rawBlob);
      });
    }
  } catch (err) {
    console.warn('[checkpointQrHelper] QRCodeStyling dataUrl generation failed, falling back to canvas overlay:', err);
  }

  // Fallback: Canvas overlay method with QRCodeLib (Level H)
  return drawCanvasQrWithLogo(qrData, size, logo);
}

/**
 * Fallback canvas rendering with centered logo
 */
function drawCanvasQrWithLogo(qrData, size = 400, logoUrl = DEFAULT_PATROL_LOGO) {
  return new Promise(async (resolve, reject) => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');

      // Generate base QR with high error correction
      await QRCodeLib.toCanvas(canvas, qrData, {
        width: size,
        margin: 2,
        errorCorrectionLevel: 'H',
        color: { dark: '#0F172A', light: '#FFFFFF' }
      });

      if (!logoUrl) {
        return resolve(canvas.toDataURL('image/png'));
      }

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const logoSize = Math.round(size * 0.26);
        const center = (size - logoSize) / 2;
        const padding = 6;

        // Draw white protective circular background
        ctx.save();
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, (logoSize / 2) + padding, 0, 2 * Math.PI);
        ctx.fill();

        // Draw subtle border around logo badge
        ctx.strokeStyle = '#E2E8F0';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw circular clipped logo
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, logoSize / 2, 0, 2 * Math.PI);
        ctx.clip();
        ctx.drawImage(img, center, center, logoSize, logoSize);
        ctx.restore();

        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = () => {
        resolve(canvas.toDataURL('image/png'));
      };
      img.src = logoUrl;
    } catch (e) {
      reject(e);
    }
  });
}

/**
 * Trigger immediate browser download of checkpoint QR code PNG
 * @param {Object} cp - Checkpoint object { checkpoint_id, name }
 * @param {string} tenantId
 * @param {Object} [options]
 */
export async function downloadCheckpointQrPng(cp, tenantId, options = {}) {
  const fileName = `${(cp.name || cp.checkpoint_id || 'checkpoint').replace(/[^a-zA-Z0-9_-]/g, '_')}-QR.png`;
  try {
    const dataUrl = await getCheckpointQrDataUrl(cp.checkpoint_id, tenantId, { size: 600, ...options });
    const link = document.createElement('a');
    link.download = fileName;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (err) {
    console.error('[checkpointQrHelper] Download QR failed:', err);
  }
}
