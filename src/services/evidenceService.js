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

  getDefaultEvidenceTimeline(patrolId) {
    return [];
  }

  /**
   * Fetch complete evidence timeline of checkpoint scans for a patrol
   */
  async fetchEvidenceTimeline(patrolId) {
    try {
      const tenantId = authService.getTenantId();
      if (!tenantId) return [];

      try {
        const res = await authService.protectedApi.get(
          `/items/patrol_logs?filter[tenant][_eq]=${tenantId}&filter[patrol_id][_eq]=${patrolId}&sort=timestamp`
        );
        if (res.data?.data) {
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

      return [];
    } catch (error) {
      console.error("Error fetching evidence timeline:", error);
      return [];
    }
  }
}

export const evidenceService = new EvidenceService();
