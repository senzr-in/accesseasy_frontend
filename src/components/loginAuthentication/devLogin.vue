<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-950 font-sans">
    <div class="w-full max-w-sm p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl text-center">
      <div class="mx-auto mb-5 h-14 w-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="w-7 h-7 text-amber-400"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" /><circle
            cx="12"
            cy="12"
            r="3"
          />
        </svg>
      </div>
      <h1 class="text-xl font-black text-white mb-1 tracking-tight">
        Dev Quick Login
      </h1>
      <p class="text-xs text-slate-400 mb-7 font-medium">
        Select a role to bypass login for UI testing
      </p>

      <div class="space-y-3">
        <button
          class="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-violet-600/10 hover:bg-violet-600/20 border border-violet-600/30 hover:border-violet-500/60 transition-all duration-200 group"
          @click="loginAs('esslAdmin')"
        >
          <div class="h-9 w-9 shrink-0 rounded-xl bg-violet-600/20 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-4 h-4 text-violet-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            ><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
          </div>
          <div class="text-left">
            <div class="text-sm font-bold text-white">
              Super Admin
            </div>
            <div class="text-[10px] text-violet-400 font-semibold uppercase tracking-widest">
              esslAdmin · All Tenants
            </div>
          </div>
        </button>

        <button
          class="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-600/10 hover:bg-blue-600/20 border border-blue-600/30 hover:border-blue-500/60 transition-all duration-200 group"
          @click="loginAs('Admin')"
        >
          <div class="h-9 w-9 shrink-0 rounded-xl bg-blue-600/20 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-4 h-4 text-blue-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            ><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle
              cx="12"
              cy="7"
              r="4"
            /></svg>
          </div>
          <div class="text-left">
            <div class="text-sm font-bold text-white">
              Tenant Admin
            </div>
            <div class="text-[10px] text-blue-400 font-semibold uppercase tracking-widest">
              Admin · Single Tenant
            </div>
          </div>
        </button>

        <button
          class="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-600/30 hover:border-emerald-500/60 transition-all duration-200 group"
          @click="loginAs('Employee')"
        >
          <div class="h-9 w-9 shrink-0 rounded-xl bg-emerald-600/20 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-4 h-4 text-emerald-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            ><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle
              cx="9"
              cy="7"
              r="4"
            /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
          </div>
          <div class="text-left">
            <div class="text-sm font-bold text-white">
              Employee
            </div>
            <div class="text-[10px] text-emerald-400 font-semibold uppercase tracking-widest">
              Employee · Self-service
            </div>
          </div>
        </button>
      </div>

      <p class="mt-6 text-[10px] text-slate-600 font-semibold uppercase tracking-widest">
        ⚠ Development only · Remove before production
      </p>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import Cookies from "js-cookie";

const router = useRouter();

const MOCK_USERS = {
  esslAdmin: {
    id: "dev-essl-001",
    first_name: "Dev",
    last_name: "SuperAdmin",
    email: "superadmin@accesseasy.dev",
    phone: null,
    role: { name: "esslAdmin" },
    tenant: null,
    userPin: "1234",
  },
  Admin: {
    id: "dev-admin-001",
    first_name: "Dev",
    last_name: "Admin",
    email: "admin@accesseasy.dev",
    phone: "+919876543210",
    role: { name: "Admin" },
    tenant: { tenantId: "dev-tenant-001", tenantName: "Dev Company Pvt Ltd" },
    userPin: "1234",
  },
  Employee: {
    id: "dev-emp-001",
    first_name: "Dev",
    last_name: "Employee",
    email: "employee@accesseasy.dev",
    phone: "+919876543211",
    role: { name: "Employee" },
    tenant: { tenantId: "dev-tenant-001", tenantName: "Dev Company Pvt Ltd" },
    userPin: "1234",
  },
};

function loginAs(role) {
  const user = MOCK_USERS[role];

  // Store mock token and user data
  const mockToken = `dev-token-${role.toLowerCase()}-${Date.now()}`;
  Cookies.set("userToken", mockToken, { expires: 1 });
  localStorage.setItem("userToken", mockToken);
  localStorage.setItem("userData", JSON.stringify(user));
  localStorage.setItem("pinVerifiedInSession", "true");

  if (user.email) localStorage.setItem("email", user.email);
  if (user.phone) localStorage.setItem("userPhone", user.phone);
  if (user.tenant) localStorage.setItem("tenantData", JSON.stringify(user.tenant));

  // Route based on role
  if (role === "esslAdmin") {
    router.push("/dealer-dashboard");
  } else {
    router.push("/dashboard");
  }
}
</script>
