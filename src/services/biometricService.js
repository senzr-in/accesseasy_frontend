import { authService } from "@/services/authService";

class BiometricService {
  /**
   * Fetch all registered Face ID profiles for the current tenant
   */
  async getTenantFaceProfiles() {
    try {
      const tenantId = authService.getTenantId();
      if (!tenantId) return [];

      const query = `/items/faceId?filter[tenant][_eq]=${tenantId}&fields=id,assignedTo.*,assignedTo.assignedUser.*,referencePhoto.*,rawImage,status,date_created,date_updated&limit=250`;
      const res = await authService.protectedApi.get(query);
      return res.data?.data || [];
    } catch (error) {
      console.warn("Could not fetch tenant face profiles:", error);
      return [];
    }
  }

  /**
   * Fetch employees list for enrollment selection
   */
  async getEmployeesForEnrollment() {
    try {
      const tenantId = authService.getTenantId();
      if (!tenantId) return [];

      const query = `/items/personalModule?filter[_and][0][assignedUser][tenant][tenantId][_eq]=${tenantId}&fields=id,employeeId,personName,assignedUser.id,assignedUser.first_name,assignedUser.last_name,assignedUser.email,assignedUser.avatar&limit=500&sort=assignedUser.first_name`;
      const res = await authService.protectedApi.get(query);
      return res.data?.data || [];
    } catch (error) {
      console.warn("Could not fetch employees for enrollment:", error);
      // Fallback without deep nesting
      try {
        const tenantId = authService.getTenantId();
        const res = await authService.protectedApi.get(`/items/personalModule?filter[tenant][_eq]=${tenantId}&fields=id,employeeId,personName,assignedUser.*&limit=500`);
        return res.data?.data || [];
      } catch (err2) {
        console.error("Fallback employee fetch failed:", err2);
        return [];
      }
    }
  }

  /**
   * Check if a specific guard/employee has an active face enrollment
   * @param {string|number} guardId (assignedUser ID or personalModule ID)
   */
  async getGuardFaceStatus(guardId) {
    if (!guardId) return { isEnrolled: false, record: null };

    try {
      const tenantId = authService.getTenantId();
      const query = `/items/faceId?filter[_and][0][tenant][_eq]=${tenantId}&filter[_and][1][_or][0][assignedTo][_eq]=${guardId}&filter[_and][1][_or][1][assignedTo][assignedUser][_eq]=${guardId}&fields=id,status,referencePhoto,rawImage,date_created,date_updated,deviceEnrolled&limit=1`;
      const res = await authService.protectedApi.get(query);
      const records = res.data?.data || [];

      if (records.length > 0) {
        const rec = records[0];
        return {
          isEnrolled: rec.status !== 'revoked',
          status: rec.status || 'active',
          record: rec,
          photoId: rec.referencePhoto?.id || rec.referencePhoto,
          rawImage: rec.rawImage,
          enrolledDate: rec.date_created || rec.date_updated,
          device: rec.deviceEnrolled || 'Mobile Patrol Device'
        };
      }
    } catch (error) {
      console.warn(`Could not check face status for guard ${guardId}:`, error);
    }

    return { isEnrolled: false, status: 'not_enrolled', record: null };
  }

  /**
   * Uploads reference photo to Directus /files
   * @param {File} file
   * @returns {Promise<string|null>} Directus File ID
   */
  async uploadReferencePhoto(file) {
    if (!file) return null;
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await authService.protectedApi.post('/files', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return res.data?.data?.id || null;
    } catch (error) {
      console.warn('Could not upload reference photo to /files:', error);
      return null;
    }
  }

  /**
   * Enrolls or updates face biometric profile in Directus /items/faceId
   * @param {Object} params
   * @param {number|string} params.personalModuleId
   * @param {File} [params.file]
   * @param {string} params.base64Image - Raw image in Base64 format
   * @param {number[]} params.embeddingVector - 192-dimensional MobileFaceNet vector
   */
  async enrollFaceWithPhoto({ personalModuleId, file, base64Image, embeddingVector }) {
    if (!personalModuleId) throw new Error('PersonalModule ID is required');
    if (!embeddingVector || embeddingVector.length === 0) throw new Error('Face embedding vector is required');

    const tenantId = authService.getTenantId();

    // 1. Upload photo to Directus /files if file is provided
    let photoFileId = null;
    if (file) {
      photoFileId = await this.uploadReferencePhoto(file);
    }

    // 2. Check if a faceId record already exists for this employee
    let existingRecordId = null;
    try {
      const checkRes = await authService.protectedApi.get(`/items/faceId?filter[assignedTo][_eq]=${personalModuleId}&limit=1`);
      const existing = checkRes.data?.data || [];
      if (existing.length > 0) {
        existingRecordId = existing[0].id;
      }
    } catch (e) {
      console.warn('Could not check existing face record:', e);
    }

    // 3. Prepare payload matching Flutter app and schema
    const payload = {
      assignedTo: personalModuleId,
      faceEmbedding: [embeddingVector],
      facialData: [embeddingVector],
      rawImage: base64Image, // Store raw Base64 image
      status: 'active',
      deviceEnrolled: 'Web Portal',
      algorithmVersion: 'MobileFaceNet_192',
      qualityScore: 0.98,
      date_updated: new Date().toISOString()
    };

    if (tenantId) payload.tenant = tenantId;
    if (photoFileId) payload.referencePhoto = photoFileId;

    // 4. Save to Directus
    let savedRecord = null;
    if (existingRecordId) {
      const res = await authService.protectedApi.patch(`/items/faceId/${existingRecordId}`, payload);
      savedRecord = res.data?.data;
    } else {
      payload.date_created = new Date().toISOString();
      const res = await authService.protectedApi.post('/items/faceId', payload);
      savedRecord = res.data?.data;
    }

    // 5. Try updating personalModule link if applicable
    if (savedRecord?.id) {
      try {
        await authService.protectedApi.patch(`/items/personalModule/${personalModuleId}`, {
          assignedFaceEmbed: savedRecord.id
        });
      } catch (pmErr) {
        // Soft fail if relationship field doesn't exist
        console.log('Note: personalModule.assignedFaceEmbed update skipped:', pmErr?.message);
      }
    }

    return {
      success: true,
      data: savedRecord,
      photoFileId
    };
  }

  /**
   * Revoke or invalidate a guard's face biometric data
   * @param {string|number} faceId
   */
  async revokeFaceId(faceId) {
    try {
      const res = await authService.protectedApi.patch(`/items/faceId/${faceId}`, {
        status: 'revoked',
        date_updated: new Date().toISOString()
      });
      return { success: true, data: res.data?.data };
    } catch (error) {
      console.error(`Failed to revoke Face ID ${faceId}:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Mark a face record as pending re-enrollment
   * @param {string|number} faceId
   */
  async requestReEnrollment(faceId) {
    try {
      const res = await authService.protectedApi.patch(`/items/faceId/${faceId}`, {
        status: 'pending_update',
        date_updated: new Date().toISOString()
      });
      return { success: true, data: res.data?.data };
    } catch (error) {
      console.error(`Failed to request re-enrollment for Face ID ${faceId}:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete biometric profile completely
   * @param {string|number} faceId
   */
  async deleteFaceProfile(faceId) {
    try {
      await authService.protectedApi.delete(`/items/faceId/${faceId}`);
      return { success: true };
    } catch (error) {
      console.error(`Failed to delete Face ID ${faceId}:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Resolve reference photo asset URL from Directus or return Base64 string directly
   * @param {string} fileIdOrBase64
   */
  getFacePhotoUrl(fileIdOrBase64) {
    if (!fileIdOrBase64) return null;
    if (typeof fileIdOrBase64 === 'string') {
      if (
        fileIdOrBase64.startsWith('data:image/') ||
        fileIdOrBase64.startsWith('http://') ||
        fileIdOrBase64.startsWith('https://') ||
        fileIdOrBase64.startsWith('blob:')
      ) {
        return fileIdOrBase64;
      }
    }
    const apiUrl = import.meta.env.VITE_API_URL || '';
    const token = authService.getToken();
    return `${apiUrl}/assets/${fileIdOrBase64}${token ? `?access_token=${token}` : ''}`;
  }
}

export const biometricService = new BiometricService();
export default biometricService;
