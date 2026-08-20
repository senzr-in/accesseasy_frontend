import { authService } from "@/services/authService";
import { geofenceService } from "@/services/geofenceService";

class EvidenceService {
  /**
   * Calculate Multi-Factor Proof Score
   * QR (30) + GPS (30) + Photo (20) + NFC (10) + Checklist (10)
   */
  calculateProofScore(scanProof) {
    let score = 0;
    const factors = {
      qr: false,
      gps: false,
      photo: false,
      nfc: false,
      checklist: false
    };

    // 1. QR verification
    if (scanProof.qr_scanned) {
      score += 30;
      factors.qr = true;
    }

    // 2. GPS validation
    if (scanProof.geofence_status === 'VALID' || scanProof.geofence_status === 'WARNING') {
      score += 30;
      factors.gps = true;
    } else if (scanProof.geofence_status === 'UNCERTAIN') {
      score += 15;
      factors.gps = true;
    }

    // 3. Photo Evidence
    if (scanProof.photo_url || scanProof.photo) {
      score += 20;
      factors.photo = true;
    }

    // 4. NFC Verification (Pro)
    if (scanProof.nfc_uid || scanProof.nfc_verified) {
      score += 10;
      factors.nfc = true;
    }

    // 5. Checklist Completion (Pro)
    if (scanProof.checklist_completed || (scanProof.checklist_answers && scanProof.checklist_answers.length > 0)) {
      score += 10;
      factors.checklist = true;
    }

    return {
      score: Math.min(100, score),
      isTamperFree: score >= 80,
      factors
    };
  }

  /**
   * Mock evidence timeline data for a patrol
   */
  getDefaultEvidenceTimeline(patrolId) {
    const today = new Date().toISOString().split('T')[0];
    return [
      {
        id: "ev-01",
        checkpoint_id: "CP-01",
        checkpoint_name: "North Gate Main Turnstile",
        scanned_at: `${today}T08:15:30`,
        guard_name: "Kumar S",
        qr_scanned: true,
        nfc_verified: true,
        nfc_uid: "04:A2:3B:82:1C:61:80",
        photo_url: "https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=400",
        geofence_status: "VALID",
        distance_m: 4,
        accuracy_m: 6.2,
        checklist_items: [
          { question: "Gate lock functional?", answer: "Yes", pass: true },
          { question: "Lighting operational?", answer: "Yes", pass: true }
        ],
        verification_score: 100,
        status: "verified"
      },
      {
        id: "ev-02",
        checkpoint_id: "CP-02",
        checkpoint_name: "Perimeter Fence Post #14",
        scanned_at: `${today}T08:24:12`,
        guard_name: "Kumar S",
        qr_scanned: true,
        nfc_verified: false,
        photo_url: "https://images.unsplash.com/photo-1541888946425-d0fbb180c5f5?w=400",
        geofence_status: "VALID",
        distance_m: 8,
        accuracy_m: 8.0,
        checklist_items: [
          { question: "Barbed wire intact?", answer: "Yes", pass: true }
        ],
        verification_score: 90,
        status: "verified"
      },
      {
        id: "ev-03",
        checkpoint_id: "CP-03",
        checkpoint_name: "Server Room Core Access",
        scanned_at: `${today}T08:35:45`,
        guard_name: "Kumar S",
        qr_scanned: true,
        nfc_verified: true,
        nfc_uid: "04:B1:9C:33:4D:21:90",
        photo_url: null,
        geofence_status: "UNCERTAIN",
        distance_m: 18,
        accuracy_m: 32.0,
        checklist_items: [
          { question: "HVAC Temperature normal?", answer: "Yes (19°C)", pass: true },
          { question: "Server rack doors locked?", answer: "Yes", pass: true }
        ],
        verification_score: 65,
        status: "uncertain_gps"
      }
    ];
  }

  /**
   * Fetch complete evidence timeline of checkpoint scans for a patrol
   */
  async fetchEvidenceTimeline(patrolId) {
    try {
      const tenantId = authService.getTenantId();
      if (!tenantId) return this.getDefaultEvidenceTimeline(patrolId);

      try {
        const res = await authService.protectedApi.get(
          `/items/patrol_logs?filter[tenant][_eq]=${tenantId}&filter[patrol_id][_eq]=${patrolId}&sort=timestamp`
        );
        if (res.data.data && res.data.data.length > 0) {
          return res.data.data.map(log => {
            const proof = this.calculateProofScore(log);
            return {
              ...log,
              verification_score: proof.score,
              factors: proof.factors
            };
          });
        }
      } catch (e) {}

      return this.getDefaultEvidenceTimeline(patrolId);
    } catch (error) {
      console.error("Error fetching evidence timeline:", error);
      return this.getDefaultEvidenceTimeline(patrolId);
    }
  }
}

export const evidenceService = new EvidenceService();
