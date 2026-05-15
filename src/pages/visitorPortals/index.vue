<template>
  <div class="p-8 h-full overflow-y-auto">
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-black text-slate-900 dark:text-white mb-2">My Visitor Portals</h1>
        <p class="text-sm font-semibold text-slate-500">Manage and monitor all your visitor check-in portals.</p>
      </div>
      <button
        v-if="pages.length === 0"
        @click="createNewPage"
        class="flex items-center gap-2 h-12 px-6 rounded-xl bg-blue-600 text-white text-sm font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all disabled:opacity-50"
        :disabled="!permissions.visitorPortals.create"
      >
        <Plus class="w-5 h-5" />
        Create New Portal
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-12">
      <Loader2 class="w-8 h-8 animate-spin text-blue-500" />
    </div>

    <!-- Empty State -->
    <div v-else-if="pages.length === 0" class="flex flex-col items-center justify-center py-16 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
      <FilePlus class="w-16 h-16 text-slate-300 dark:text-slate-700 mb-4" />
      <h3 class="text-lg font-bold text-slate-700 dark:text-slate-300">No portals found</h3>
      <p class="text-sm font-medium text-slate-500 mb-6">Start by creating your first visitor landing page.</p>
      <button
        @click="createNewPage"
        class="px-6 py-2 rounded-full border border-blue-500 text-blue-600 dark:text-blue-400 font-semibold hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors disabled:opacity-50"
        :disabled="!permissions.visitorPortals.create"
      >
        Get Started Now
      </button>
    </div>

    <!-- Grid -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <div
        v-for="page in pages"
        :key="page.id"
        class="flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
      >
        <div class="h-40 bg-slate-100 dark:bg-slate-800 relative">
          <img v-if="page.Assetjson?.images?.banner" :src="getAssetUrl(page.Assetjson.images.banner)" class="w-full h-full object-cover" />
          <div v-else class="w-full h-full flex items-center justify-center">
            <Image class="w-12 h-12 text-slate-300 dark:text-slate-600" />
          </div>
        </div>
        <div class="p-5 flex-1 flex flex-col">
          <h3 class="font-black text-lg text-slate-900 dark:text-white truncate">{{ page.Title }}</h3>
          <p class="text-xs font-semibold text-slate-500 mb-4">Created {{ formatDate(page.date_created) }}</p>
          <div class="flex items-center gap-1.5 mt-auto flex-wrap">
            <Link class="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <a :href="getVisitUrl(page.id)" target="_blank" class="text-xs font-bold text-blue-600 dark:text-blue-400 truncate hover:underline flex-1 min-w-0">
              {{ getVisitUrl(page.id).replace(/^https?:\/\//, '') }}
            </a>
            <button @click.stop="copyToClipboard(getVisitUrl(page.id))" class="text-slate-400 hover:text-blue-500 p-1 rounded transition-colors" title="Copy URL">
              <Copy class="w-3.5 h-3.5" />
            </button>
            <button @click.stop="shareWhatsApp(getVisitUrl(page.id))" class="text-slate-400 hover:text-emerald-500 p-1 rounded transition-colors" title="Share via WhatsApp">
              <MessageCircle class="w-3.5 h-3.5" />
            </button>
            <button @click.stop="shareEmail(getVisitUrl(page.id), page.Title)" class="text-slate-400 hover:text-blue-500 p-1 rounded transition-colors" title="Share via Email">
              <Mail class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        <div class="p-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
          <button
            @click="editPage(page.id)"
            class="flex-1 py-1.5 px-3 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors disabled:opacity-50"
            :disabled="!permissions.visitorPortals.update"
          >
            Edit Portal
          </button>
          <button
            @click="confirmDelete(page)"
            class="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors disabled:opacity-50"
            title="Delete Portal"
            :disabled="!permissions.visitorPortals.delete"
          >
            <Trash2 class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Modal -->
    <div v-if="deleteDialog" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" @click="deleteDialog = false"></div>
      <div class="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-sm shadow-xl">
        <h3 class="text-lg font-black text-slate-900 dark:text-white mb-2">Delete Portal?</h3>
        <p class="text-sm font-medium text-slate-500 mb-6">Are you sure you want to delete <strong class="text-slate-700 dark:text-slate-300">{{ selectedPage?.Title }}</strong>? This action cannot be undone.</p>
        <div class="flex justify-end gap-3">
          <button @click="deleteDialog = false" class="px-4 py-2 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">Cancel</button>
          <button @click="deletePage" :disabled="deleting" class="px-4 py-2 rounded-xl text-sm font-bold text-white bg-rose-500 hover:bg-rose-600 disabled:opacity-50 flex items-center gap-2">
            <Loader2 v-if="deleting" class="w-4 h-4 animate-spin" />
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, inject, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import { authService } from '@/services/authService';
import { Plus, Loader2, FilePlus, Image, Link, Copy, Trash2, MessageCircle, Mail } from 'lucide-vue-next';

// Role checking instead of useTabPermissions
const userRole = computed(() => authService.getUserRole());
const isAdmin = computed(() => userRole.value === 'Admin' || userRole.value === 'esslAdmin');

const permissions = reactive({
  visitorPortals: {
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin
  }
});

const router = useRouter();

// Provide basic fallback in case inject fails
const defaultMessageHandler = {
  showSuccess: (msg) => console.log('Success: ' + msg),
  showError: (msg) => console.log('Error: ' + msg),
  showWarning: (msg) => console.log('Warning: ' + msg)
};
const messageHandler = inject('messageHandler', defaultMessageHandler);

const pages = ref([]);
const loading = ref(true);
const deleting = ref(false);
const deleteDialog = ref(false);
const selectedPage = ref(null);

const fetchPages = async () => {
    loading.value = true;
    try {
        const tenantId = authService.getTenantId();
        const response = await authService.protectedApi.get('/items/BrandedPages', {
            params: {
                'filter[tenant][_eq]': tenantId,
                'filter[status][_neq]': 'archived',
                'sort': '-date_created',
                'fields': 'id,Title,status,date_created,Assetjson'
            }
        });
        pages.value = response.data.data;
    } catch (err) {
        console.error('Error fetching portals:', err);
    } finally {
        loading.value = false;
    }
};

const createNewPage = () => {
    if (!permissions.visitorPortals.create) {
        messageHandler.showError("Blocked Access: No permission to create portals.");
        return;
    }
    if (pages.value && pages.value.length > 0) {
        messageHandler.showWarning("You can only have one active visitor portal.");
        return;
    }
    router.push('/dashboard/visitor-portals/builder');
};

const editPage = (id) => {
    if (!permissions.visitorPortals.update) {
        messageHandler.showError("Blocked Access: No permission to edit portals.");
        return;
    }
    router.push(`/dashboard/visitor-portals/builder/${id}`);
};

const confirmDelete = (page) => {
    if (!permissions.visitorPortals.delete) {
        messageHandler.showError("Blocked Access: No permission to delete portals.");
        return;
    }
    selectedPage.value = page;
    deleteDialog.value = true;
};

const deletePage = async () => {
    if (!permissions.visitorPortals.delete) return;
    if (!selectedPage.value) return;
    deleting.value = true;
    try {
        await authService.protectedApi.patch(`/items/BrandedPages/${selectedPage.value.id}`, {
            status: 'archived'
        });
        messageHandler.showSuccess('Portal deleted successfully');
        fetchPages();
        deleteDialog.value = false;
    } catch (err) {
        console.error('Error deleting portal:', err);
        messageHandler.showError('Failed to delete portal');
    } finally {
        deleting.value = false;
    }
};

const getAssetUrl = (fileId) => {
    if (!fileId) return null;
    return `${import.meta.env.VITE_API_URL}/assets/${fileId}?access_token=${import.meta.env.VITE_API_TOKEN}`;
};

const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const BASE_URL = import.meta.env.VITE_UI_URL || 'http://localhost:3000';
const getVisitUrl = (id) => `${BASE_URL}/visit/${id}`;

const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    messageHandler.showSuccess('URL copied to clipboard!');
};

const shareWhatsApp = (url) => {
    const text = encodeURIComponent(`Check out our visitor portal: ${url}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
};

const shareEmail = (url, title) => {
    const subject = encodeURIComponent(`Visitor Portal: ${title}`);
    const body = encodeURIComponent(`Hello,\n\nVisit our visitor portal here: ${url}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
};

onMounted(fetchPages);
</script>
