"use client";

import { ref, onMounted } from "vue";
import { authService } from "@/services/authService";
import { currentUserTenant } from "@/utils/currentUserTenant";

export function useAuth() {
  const userRole = ref("");
  const tenantId = ref("");
  const userId = ref("");
  const token = ref("");
  const loading = ref(false);

  const initializeAuth = async () => {
    loading.value = true;
    try {
      // Get token from authService
      token.value = authService.getToken();

      if (!token.value) {
        throw new Error("No authentication token found");
      }

      // Initialize currentUserTenant if not already done
      await currentUserTenant.initialize();

      // Get user data
      tenantId.value = await currentUserTenant.getTenantIdAsync();
      userId.value = await currentUserTenant.getUserIdAsync();
      userRole.value = await currentUserTenant.getRoleAsync();
    } catch (error) {
      console.error("Error initializing auth:", error);
      // If auth fails, redirect to login
      if (error.message.includes("not authenticated") || !token.value) {
        authService.logout();
      }
    } finally {
      loading.value = false;
    }
  };

  // Initialize on mount
  onMounted(() => {
    initializeAuth();
  });

  return {
    token: token.value || authService.getToken(),
    tenantId: tenantId.value,
    userId: userId.value,
    userRole,
    loading,
    initializeAuth,
  };
}
