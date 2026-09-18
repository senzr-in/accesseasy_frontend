<template>
  <div class="callback-container">
    <!-- Loading State -->
    <div class="loading-state">
      <div class="spinner" />
      <h3>{{ statusMessage }}</h3>
      <p>Please wait while we complete the authentication...</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { authService } from "@/services/authService";
import { appConfigService } from "@/services/appConfigService";

const router = useRouter();
const route = useRoute();
const statusMessage = ref("Processing authentication...");

onMounted(async () => {
  // Detection for Integration flow inside AuthCallback
  const isPopup = !!window.opener;
  const isAuthenticated = authService.isAuthenticated();
  const code = route.query.code;

  if (isPopup && isAuthenticated && code) {
    console.log("[AuthCallback] Detected integration flow in popup. Exchanging code...");
    try {
      const tenantId = authService.getTenantId() || sessionStorage.getItem("tenant_id");
      const token = authService.getToken();
      
      const response = await fetch(`${import.meta.env.VITE_KN_API_URL}/google-accesseasy`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action: 'exchange_code',
          code: code,
          tenant_id: tenantId
        })
      });

      const data = await response.json();
      if (data.success) {
        statusMessage.value = "Account connected! Closing...";
        window.opener.postMessage({ type: 'INTEGRATION_SUCCESS', success: true }, '*');
        setTimeout(() => window.close(), 1000);
        return;
      }
    } catch (e) {
      console.error("[AuthCallback] Integration exchange failed:", e);
    }
  }

  // If already authenticated and no code in URL, just redirect home
  if (isAuthenticated && !route.query.code) {
    clearSessionAndRedirect();
    return;
  }

  const state = route.query.state;

  if (!code) {
    statusMessage.value = "Error: No authorization code";
    setTimeout(() => router.push("/login?error=no_code"), 2000);
    return;
  }

  const connectorType = sessionStorage.getItem("connector_type");
  const storedTenantId = sessionStorage.getItem("tenant_id");

  if (!storedTenantId && connectorType !== "google") {
    statusMessage.value = "Error: Session expired";
    setTimeout(() => router.push("/login?error=no_tenant"), 2000);
    return;
  }

  // Create an AbortController for fetch timeout (45s for Knative cold starts)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 45000);

  try {
    statusMessage.value = `Completing ${connectorType || "Google"} authentication...`;

    const payload = {
      tenantId: storedTenantId === "new" ? "" : (storedTenantId || ""),
      code: code,
      type: connectorType || "google",
      action: "token",
    };

    const apiUrl = `${import.meta.env.VITE_KN_API_URL}/google-accesseasy`;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    const data = await response.json();
    console.log("[AuthCallback] Exchange response:", data);

    if (response.ok && data.success) {
      const isNewUser = !!(data.signup && data.signup.is_new !== false);
      const currentUserData = data.user || data.userData || data.signup?.userData;
      
      // Extract user data
      const tenantId = data.tenant_id || data.signup?.tenant_id || "";
      const userEmail = currentUserData?.email || data.email || "";
      const tenantName = data.tenant_name || "";

      if (userEmail) {
        authService.setEmail(userEmail);
      }

      if (!isNewUser) {
        statusMessage.value = "Account found! Logging you in...";
      } else {
        statusMessage.value = "Account created! Finalizing login...";
        if (tenantId) {
          authService.knApi.post("/initial-settings", {
            tenantId,
            tenantName: tenantName || currentUserData?.first_name || "Google User",
            fullName: currentUserData?.first_name ? `${currentUserData?.first_name} ${currentUserData?.last_name || ''}`.trim() : "Google User",
            email: userEmail,
            recipientEmail: userEmail,
            adminNotifyEmail: appConfigService.getAdminNotifyEmail(),
            notifyEmail: appConfigService.getAdminNotifyEmail(),
            adminEmail: appConfigService.getAdminNotifyEmail(),
            userApp: "patrol",
            source: "Google SSO Web"
          }).catch(err => {
            console.warn("[AuthCallback] initial-settings notification error (non-fatal):", err.message);
          });
        }
      }

      // 1. ALWAYS call Knative auth-service google-login first with userEmail to get the true Directus JWT and Directus refresh token
      if (userEmail) {
        try {
          const loginResult = await authService.googleLogin(userEmail);
          console.log("[AuthCallback] Knative googleLogin response:", loginResult);

          if (loginResult && loginResult.success && loginResult.token) {
            const loginRefresh = loginResult.refresh_token || loginResult.refreshToken || null;
            authService.setToken(loginResult.token, loginRefresh);
            
            const resolvedUser = loginResult.userData || currentUserData;
            if (resolvedUser) {
              authService.setUserData(resolvedUser);
            }
            
            const resolvedTenantId = loginResult.tenantId || loginResult.tenant_id || tenantId;
            const resolvedTenantName = loginResult.tenantName || loginResult.tenant_name || tenantName;
            if (resolvedTenantId) {
              authService.setTenantData({ tenantId: resolvedTenantId, tenantName: resolvedTenantName });
            }
            
            authSuccessful = true;
          }
        } catch (loginErr) {
          console.error("[AuthCallback] Knative google-login error:", loginErr);
        }
      }

      // 2. Only if googleLogin was not successful, check if data.token is a Directus token (NOT a Google ya29.* token)
      if (!authSuccessful) {
        const candidateToken = data.token;
        if (candidateToken && !candidateToken.startsWith("ya29.")) {
          const candidateRefresh = (data.refresh_token && !data.refresh_token.startsWith("1//")) ? data.refresh_token : null;
          authService.setToken(candidateToken, candidateRefresh);
          if (currentUserData) authService.setUserData(currentUserData);
          if (tenantId) authService.setTenantData({ tenantId, tenantName });
          authSuccessful = true;
        }
      }

      if (authSuccessful || authService.isAuthenticated()) {
        localStorage.setItem("fromEmailOtp", "true");
        authService.setPinVerified(true);

        const finalUser = authService.getUserData() || currentUserData;
        if (finalUser?.id) {
          authService.onSuccessfulLogin(finalUser.id);
        }

        statusMessage.value = "Login successful! Redirecting...";
        clearSessionAndRedirect();
        return;
      }

      router.push("/login?error=auth_failed");
    } else {
      statusMessage.value = data.message || "Authentication failed";
      
      // Recovery: if we're actually logged in, just go home
      if (authService.isAuthenticated()) {
        setTimeout(() => clearSessionAndRedirect(), 1000);
        return;
      }

      setTimeout(() => {
        const redirectPath = connectorType === "google" ? "/login" : "/connectors/connector";
        router.push(`${redirectPath}?error=${encodeURIComponent(data.message || "Authentication failed")}`);
      }, 2000);
    }
  } catch (error) {
    clearTimeout(timeoutId);
    console.error("Auth Callback Exception:", error);
    
    // Recovery: if we're actually logged in, just go home
    if (authService.isAuthenticated()) {
      statusMessage.value = "Authentication taking longer than expected. Redirecting to dashboard...";
      setTimeout(() => clearSessionAndRedirect(), 1500);
      return;
    }

    statusMessage.value = error.name === 'AbortError' ? "Request timed out" : "Network error";
    setTimeout(() => router.push("/login?error=auth_timeout"), 2000);
  }
});

const clearSessionAndRedirect = () => {
  const returnUrl = sessionStorage.getItem("auth_return_url");
  sessionStorage.removeItem("connector_type");
  sessionStorage.removeItem("tenant_id");
  sessionStorage.removeItem("auth_return_url");
  
  if (returnUrl && returnUrl !== "/" && returnUrl !== "/login") {
    router.replace(returnUrl);
  } else {
    router.replace("/dashboard");
  }
};
</script>

<style scoped>
/* LOADING STYLES */
.callback-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(135deg, #020617 0%, #0f172a 100%);
  color: #f8fafc;
}

.loading-state {
  text-align: center;
  background: rgba(30, 41, 59, 0.7);
  padding: 3rem 2.5rem;
  border-radius: 16px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
  min-width: 320px;
  border: 1px solid rgba(255,255,255,0.1);
  backdrop-filter: blur(12px);
}

.spinner {
  border: 4px solid rgba(243, 243, 243, 0.1);
  border-top: 4px solid #2563eb;
  border-radius: 50%;
  width: 56px;
  height: 56px;
  animation: spin 1s linear infinite;
  margin: 0 auto 1.5rem;
}

h3 {
  margin-bottom: 8px;
  font-weight: 700;
}

p {
  color: #94a3b8;
  font-size: 0.875rem;
}

@keyframes spin { 
  0% { transform: rotate(0deg); } 
  100% { transform: rotate(360deg); } 
}
</style>
