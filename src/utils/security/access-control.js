/**
 * Access Control Utilities
 * Ported from Next.js implementation for client-side Vue usage.
 */
import CryptoJS from 'crypto-js';

/**
 * Generates an AES-256 Encrypted QR token with timestamp.
 * 
 * @param {string|number} employeeId - The employee ID
 * @param {string|number} accessLevelNumber - The numerical ID of the access level
 * @returns {string} Encrypted Base64 token string
 */
export function generateEncryptedQrToken(employeeId, accessLevelNumber) {
    try {
        const payload = JSON.stringify({
            e: employeeId,
            a: accessLevelNumber,
            t: Date.now() // Precise Timestamp
        });
        
        // In a real production environment, this secret matches the hardware/backend decryption secret.
        const secretKey = import.meta.env.VITE_QR_SECRET_KEY || 'default-secure-aes-key-for-qr-256';
        
        // Encrypt with AES-256
        const encrypted = CryptoJS.AES.encrypt(payload, secretKey).toString();
        
        return encrypted;
    } catch (error) {
        console.error("Error generating AES-256 QR token:", error);
        // Fallback to basic token if encryption fails
        return generateQrToken(true, accessLevelNumber);
    }
}

/**
 * Generates an 8-character Alphanumeric QR token encoding access level and validity.
 * Format: 40 bits [32-bit Random Entropy | 8-bit Access Byte] converted to Base36.
 * 
 * @param {boolean} cardAccess - Whether access is enabled
 * @param {string|number} accessLevelNumber - The numerical ID of the access level
 * @returns {string} 8-character token
 */
export function generateQrToken(cardAccess, accessLevelNumber) {
    try {
        // 1. Generate 32-bit random entropy
        let entropy;
        if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
            const randomBuffer = new Uint32Array(1);
            window.crypto.getRandomValues(randomBuffer);
            entropy = BigInt(randomBuffer[0]);
        } else {
            // Fallback for non-secure contexts
            entropy = BigInt(Math.floor(Math.random() * 4294967296));
        }

        // 2. Control Byte: [Bit 7: AccessEnabled, Bits 0-6: LevelNum]
        const accessLevelInt = typeof accessLevelNumber === 'string' ? parseInt(accessLevelNumber, 10) : accessLevelNumber;
        const levelNum = (accessLevelInt || 0) & 0x7f;
        const accessByte = (cardAccess ? 0x80 : 0x00) | levelNum;

        // 3. Combine: [Entropy (32 bits)] [AccessByte (8 bits)]
        const combined = (entropy << 8n) | BigInt(accessByte);

        // 4. Convert 40-bit value to Base36 (alphanumeric)
        let token = combined.toString(36).toUpperCase();

        // Pad to exactly 8 characters
        return token.padStart(8, '0');
    } catch (error) {
        console.error("Error generating QR token:", error);
        return Math.random().toString(36).substring(2, 10).toUpperCase();
    }
}

/**
 * Generates Access Level Bitmap for devices
 */
export function generateAccessLevelBitmap(data) {
    try {
        const maxWorkHours = Math.min(data.maxWorkHours || 0, 15);
        const accessTypeBit = data.accessType ? 1 : 0;
        const holidaysBit = data.holidays ? 1 : 0;
        const workingHoursBit = data.workingHours ? 1 : 0;
        const _24hrsBit = data.twentyFourHours ? 1 : 0;

        const maxWorkHoursBinary = maxWorkHours.toString(2).padStart(4, "0");
        const validHours = data.Valid_hours || "24";

        const bitmap = `${maxWorkHoursBinary}.${_24hrsBit}${workingHoursBit}${holidaysBit}${accessTypeBit},${validHours}`;

        return bitmap;
    } catch (error) {
        console.error("Error generating access level bitmap:", error);
        return null;
    }
}
