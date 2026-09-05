/**
 * alertNotificationService.js
 * Dedicated service for SOS alarms, browser desktop notifications, and audio alerts.
 * Follows single responsibility principle: decoupling notification & audio from store state.
 */

class AlertNotificationService {
  constructor() {
    this._audioCtx = null;
    this._permissionRequested = false;
  }

  /**
   * Request browser Notification permission
   */
  async requestPermission() {
    if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
    if (Notification.permission === 'granted') return 'granted';
    
    try {
      const permission = await Notification.requestPermission();
      this._permissionRequested = true;
      return permission;
    } catch (e) {
      console.warn('[AlertNotificationService] Failed to request notification permission:', e);
      return 'denied';
    }
  }

  /**
   * Trigger SOS Notification & Sound
   * @param {Object} alertData 
   */
  async notify(alertData = {}) {
    // 1. Play alert sound
    this.playAlertTone();

    // 2. Display desktop/browser notification
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        this._showNotification(alertData);
      } else if (Notification.permission !== 'denied' && !this._permissionRequested) {
        const perm = await this.requestPermission();
        if (perm === 'granted') {
          this._showNotification(alertData);
        }
      }
    }
  }

  _showNotification(alertData) {
    try {
      const guardName = alertData.guard_name || alertData.reported_by || 'Security Guard';
      const site = alertData.site_id || alertData.siteName || alertData.location || 'Current Site';
      const title = `🚨 SOS EMERGENCY: ${guardName}`;
      const body = alertData.message || `Immediate emergency alarm triggered at ${site}.`;

      const notification = new Notification(title, {
        body,
        icon: '/favicon.ico',
        tag: `sos-${alertData.id || Date.now()}`,
        requireInteraction: true,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    } catch (e) {
      console.warn('[AlertNotificationService] Error creating Notification:', e);
    }
  }

  /**
   * Play high-urgency SOS alert audio using Web Audio API synthesized tone + audio fallback
   */
  playAlertTone() {
    try {
      // 1. Try audio file if present
      const audio = new Audio('/sounds/sos-alarm.mp3');
      audio.play().catch(() => {
        // 2. Synthesize alarm with Web Audio API if file fails or autoplay restricts
        this._playSynthesizedSiren();
      });
    } catch (_) {
      this._playSynthesizedSiren();
    }
  }

  _playSynthesizedSiren() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;

      if (!this._audioCtx || this._audioCtx.state === 'closed') {
        this._audioCtx = new AudioContext();
      }
      if (this._audioCtx.state === 'suspended') {
        this._audioCtx.resume();
      }

      const ctx = this._audioCtx;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      const now = ctx.currentTime;
      // High-low alternating siren tone
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.3);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.6);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.9);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 1.2);
    } catch (e) {
      console.warn('[AlertNotificationService] Web Audio synthesis unavailable:', e);
    }
  }
}

export const alertNotificationService = new AlertNotificationService();
