import { createRouter, createWebHistory } from 'vue-router';

// Only load our new specific page
import VisitorPortalView from '../pages/VisitorPortalView.vue';

const routes = [
  {
    path: '/visit/:id',
    name: 'VisitorPortalView',
    component: VisitorPortalView
  },
  {
    // Fallback/redirect
    path: '/:catchAll(.*)',
    redirect: '/visit/preview-pending'
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
