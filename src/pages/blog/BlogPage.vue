<template>
  <div class="patrol-blog-page">
    <!-- Header / Navbar Banner -->
    <header class="blog-header">
      <div class="nav-container">
        <router-link to="/" class="brand-link">
          <img src="/images/logoPatrol.png" alt="AccessEasy Patrol" class="brand-logo" onerror="this.style.display='none'" />
          <span class="brand-title">AccessEasy <span class="highlight">Patrol</span></span>
        </router-link>
        <div class="nav-actions">
          <router-link to="/" class="nav-btn-ghost">Command Center</router-link>
          <router-link to="/login" class="nav-btn-primary">Sign In</router-link>
        </div>
      </div>
    </header>

    <!-- Hero Section -->
    <section class="blog-hero">
      <div class="hero-badge">
        <span class="badge-dot"></span>
        PATROL INTELLIGENCE & SECURITY TECH
      </div>
      <h1 class="hero-title">Patrol Operations & Guard Tech Insights</h1>
      <p class="hero-subtitle">
        Expert operational playbooks on multi-site security patrol management, real-time guard GPS verification, QR/NFC checkpoints, and instant incident response.
      </p>
    </section>

    <!-- Content Area -->
    <main class="blog-main">
      <!-- Loading State -->
      <div v-if="loading" class="loading-grid">
        <div v-for="i in 6" :key="i" class="skeleton-card">
          <div class="skeleton-img"></div>
          <div class="skeleton-body">
            <div class="skeleton-line short"></div>
            <div class="skeleton-line"></div>
            <div class="skeleton-line medium"></div>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-box">
        <span class="error-icon">⚠️</span>
        <p>{{ error }}</p>
        <button @click="loadPosts" class="retry-btn">Retry</button>
      </div>

      <!-- Empty State -->
      <div v-else-if="posts.length === 0" class="empty-box">
        <div class="empty-icon">🛡️</div>
        <h2>No Patrol Articles Published Yet</h2>
        <p>Fresh operational updates and security technology articles will appear here automatically.</p>
      </div>

      <!-- Posts Grid -->
      <div v-else class="posts-grid">
        <article 
          v-for="post in posts" 
          :key="post.slug || post.id" 
          class="post-card"
          @click="openPost(post.slug)"
        >
          <div class="post-media">
            <img :src="post.image" :alt="post.title" class="post-img" loading="lazy" />
            <span class="post-category">{{ post.category }}</span>
          </div>
          <div class="post-body">
            <div class="post-meta">
              <span class="meta-date">{{ post.date }}</span>
              <span class="meta-sep">•</span>
              <span class="meta-time">{{ post.read_time }}</span>
            </div>
            <h2 class="post-title">{{ post.title }}</h2>
            <p class="post-excerpt">{{ post.excerpt }}</p>
            <div class="post-footer">
              <span class="author-name">By {{ post.author }}</span>
              <span class="read-more">Read Article →</span>
            </div>
          </div>
        </article>
      </div>
    </main>

    <!-- Footer -->
    <footer class="blog-footer">
      <div class="footer-container">
        <p>© 2026 AccessEasy Patrol. Autonomous Security & Guard Management Platform.</p>
        <div class="footer-links">
          <router-link to="/">Home</router-link>
          <router-link to="/blog">Blog</router-link>
          <router-link to="/login">Login</router-link>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { fetchAllPatrolPosts } from '@/services/blogService';

const router = useRouter();
const posts = ref([]);
const loading = ref(true);
const error = ref(null);

async function loadPosts() {
  loading.value = true;
  error.value = null;
  try {
    const data = await fetchAllPatrolPosts();
    posts.value = data;
  } catch (err) {
    error.value = 'Unable to load patrol blog posts at this moment.';
  } finally {
    loading.value = false;
  }
}

function openPost(slug) {
  if (slug) {
    router.push(`/blog/${slug}`);
  }
}

onMounted(() => {
  loadPosts();
});
</script>

<style scoped>
.patrol-blog-page {
  min-height: 100vh;
  background-color: #070d1e;
  color: #f1f5f9;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  display: flex;
  flex-direction: column;
}

.blog-header {
  position: sticky;
  top: 0;
  z-index: 50;
  backdrop-filter: blur(16px);
  background: rgba(7, 13, 30, 0.85);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.brand-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  color: #ffffff;
}

.brand-logo {
  height: 32px;
  width: auto;
}

.brand-title {
  font-size: 1.15rem;
  font-weight: 800;
  letter-spacing: -0.01em;
}

.brand-title .highlight {
  color: #3b82f6;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.nav-btn-ghost {
  color: #94a3b8;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 600;
  transition: color 0.2s ease;
}
.nav-btn-ghost:hover {
  color: #ffffff;
}

.nav-btn-primary {
  background: #2563eb;
  color: #ffffff;
  padding: 0.5rem 1.1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 700;
  text-decoration: none;
  transition: all 0.2s ease;
}
.nav-btn-primary:hover {
  background: #1d4ed8;
  box-shadow: 0 4px 14px rgba(37, 99, 235, 0.4);
}

.blog-hero {
  max-width: 860px;
  margin: 4rem auto 2.5rem;
  padding: 0 1.5rem;
  text-align: center;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0.35rem 0.9rem;
  border-radius: 20px;
  background: rgba(37, 99, 235, 0.12);
  border: 1px solid rgba(37, 99, 235, 0.3);
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  color: #60a5fa;
  margin-bottom: 1.25rem;
}

.badge-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #3b82f6;
  box-shadow: 0 0 8px #3b82f6;
}

.hero-title {
  font-size: clamp(2rem, 4vw, 2.75rem);
  font-weight: 900;
  line-height: 1.2;
  letter-spacing: -0.02em;
  color: #ffffff;
  margin-bottom: 1rem;
}

.hero-subtitle {
  font-size: 1.05rem;
  line-height: 1.6;
  color: #94a3b8;
}

.blog-main {
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 0 1.5rem 5rem;
  flex: 1;
}

.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 2rem;
}

.post-card {
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.post-card:hover {
  transform: translateY(-4px);
  border-color: rgba(59, 130, 246, 0.4);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.4), 0 0 20px rgba(37, 99, 235, 0.15);
}

.post-media {
  position: relative;
  height: 200px;
  background: #0f172a;
}

.post-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.post-category {
  position: absolute;
  top: 12px;
  left: 12px;
  background: rgba(7, 13, 30, 0.85);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #93c5fd;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 6px;
  text-transform: uppercase;
}

.post-body {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.post-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8rem;
  color: #64748b;
  margin-bottom: 0.75rem;
}

.post-title {
  font-size: 1.25rem;
  font-weight: 800;
  line-height: 1.35;
  color: #f8fafc;
  margin-bottom: 0.75rem;
}

.post-excerpt {
  font-size: 0.9rem;
  line-height: 1.55;
  color: #94a3b8;
  margin-bottom: 1.5rem;
  flex: 1;
}

.post-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  padding-top: 1rem;
  font-size: 0.825rem;
}

.author-name {
  color: #64748b;
  font-weight: 600;
}

.read-more {
  color: #3b82f6;
  font-weight: 700;
}

.empty-box, .error-box {
  text-align: center;
  padding: 5rem 1rem;
  color: #94a3b8;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.loading-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 2rem;
}

.skeleton-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  overflow: hidden;
  height: 380px;
  animation: pulse 1.5s infinite ease-in-out;
}

.skeleton-img {
  height: 200px;
  background: rgba(255, 255, 255, 0.05);
}

.skeleton-body {
  padding: 1.5rem;
}

.skeleton-line {
  height: 14px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
  margin-bottom: 10px;
}
.skeleton-line.short { width: 35%; }
.skeleton-line.medium { width: 65%; }

@keyframes pulse {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 0.3; }
}

.blog-footer {
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  padding: 2rem 1.5rem;
  background: #050914;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  font-size: 0.85rem;
  color: #64748b;
}

.footer-links {
  display: flex;
  gap: 1.5rem;
}
.footer-links a {
  color: #94a3b8;
  text-decoration: none;
}
.footer-links a:hover {
  color: #ffffff;
}

@media (max-width: 640px) {
  .posts-grid {
    grid-template-columns: 1fr;
  }
}
</style>
