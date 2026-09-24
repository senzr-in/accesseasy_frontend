<template>
  <div class="patrol-post-page">
    <!-- Header -->
    <header class="blog-header">
      <div class="nav-container">
        <router-link to="/blog" class="back-link">
          ← Back to Blog
        </router-link>
        <router-link to="/" class="brand-link">
          <img src="/images/logoPatrol.png" alt="AccessEasy Patrol" class="brand-logo" onerror="this.style.display='none'" />
          <span class="brand-title">AccessEasy <span class="highlight">Patrol</span></span>
        </router-link>
        <router-link to="/login" class="nav-btn-primary">Sign In</router-link>
      </div>
    </header>

    <!-- Main Content -->
    <main class="post-main">
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading article...</p>
      </div>

      <div v-else-if="!post" class="not-found-box">
        <div class="empty-icon">🔍</div>
        <h2>Article Not Found</h2>
        <p>The requested patrol operational guide could not be located.</p>
        <router-link to="/blog" class="btn-return">View All Articles</router-link>
      </div>

      <article v-else class="article-content">
        <!-- Article Header -->
        <header class="article-header">
          <div class="article-category-badge">{{ post.category }}</div>
          <h1 class="article-title">{{ post.title }}</h1>
          <div class="article-meta">
            <span class="meta-author">By {{ post.author }}</span>
            <span class="meta-sep">•</span>
            <span class="meta-date">{{ post.date }}</span>
            <span class="meta-sep">•</span>
            <span class="meta-read">{{ post.read_time }}</span>
          </div>
        </header>

        <!-- Featured Media -->
        <div v-if="post.image" class="featured-media">
          <img :src="post.image" :alt="post.title" class="featured-img" />
        </div>

        <!-- Article Body HTML -->
        <div class="article-body" v-html="post.content"></div>

        <!-- Call to Action Banner -->
        <div class="article-cta-box">
          <h3>Elevate Your Site Security Operations</h3>
          <p>
            Experience automated guard tracking, digital checkpoint verification, and real-time incident escalation with AccessEasy Patrol.
          </p>
          <div class="cta-actions">
            <router-link to="/" class="btn-cta-primary">Explore Command Center</router-link>
            <router-link to="/login" class="btn-cta-secondary">Sign In</router-link>
          </div>
        </div>
      </article>
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
import { useRoute } from 'vue-router';
import { fetchPostBySlug } from '@/services/blogService';

const route = useRoute();
const post = ref(null);
const loading = ref(true);

onMounted(async () => {
  const slug = route.params.slug;
  if (slug) {
    post.value = await fetchPostBySlug(slug);
  }
  loading.value = false;
});
</script>

<style scoped>
.patrol-post-page {
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
  max-width: 1000px;
  margin: 0 auto;
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.back-link {
  color: #94a3b8;
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 600;
  transition: color 0.2s ease;
}
.back-link:hover {
  color: #3b82f6;
}

.brand-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  color: #ffffff;
}

.brand-logo {
  height: 28px;
  width: auto;
}

.brand-title {
  font-size: 1.05rem;
  font-weight: 800;
}
.brand-title .highlight {
  color: #3b82f6;
}

.nav-btn-primary {
  background: #2563eb;
  color: #ffffff;
  padding: 0.45rem 1rem;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 700;
  text-decoration: none;
}

.post-main {
  max-width: 820px;
  width: 100%;
  margin: 0 auto;
  padding: 3rem 1.5rem 5rem;
  flex: 1;
}

.article-header {
  margin-bottom: 2rem;
  text-align: left;
}

.article-category-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 6px;
  background: rgba(37, 99, 235, 0.15);
  border: 1px solid rgba(37, 99, 235, 0.3);
  color: #60a5fa;
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  margin-bottom: 1rem;
}

.article-title {
  font-size: clamp(2rem, 3.5vw, 2.5rem);
  font-weight: 900;
  line-height: 1.25;
  color: #ffffff;
  margin-bottom: 1rem;
}

.article-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
  color: #64748b;
}

.featured-media {
  margin-bottom: 2.5rem;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.featured-img {
  width: 100%;
  height: 380px;
  object-fit: cover;
  display: block;
}

.article-body {
  font-size: 1.1rem;
  line-height: 1.75;
  color: #cbd5e1;
}

.article-body :deep(h2), .article-body :deep(h3) {
  font-size: 1.4rem;
  font-weight: 800;
  color: #ffffff;
  margin: 2rem 0 1rem;
}

.article-body :deep(p) {
  margin-bottom: 1.25rem;
}

.article-body :deep(ul), .article-body :deep(ol) {
  margin: 1rem 0 1.5rem 1.5rem;
}

.article-body :deep(li) {
  margin-bottom: 0.5rem;
}

.article-cta-box {
  margin-top: 4rem;
  padding: 2.5rem;
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.12) 0%, rgba(15, 23, 42, 0.8) 100%);
  border: 1px solid rgba(59, 130, 246, 0.3);
  text-align: center;
}

.article-cta-box h3 {
  font-size: 1.5rem;
  font-weight: 800;
  color: #ffffff;
  margin-bottom: 0.75rem;
}

.article-cta-box p {
  color: #94a3b8;
  max-width: 580px;
  margin: 0 auto 1.5rem;
  font-size: 0.95rem;
  line-height: 1.6;
}

.cta-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.btn-cta-primary {
  background: #2563eb;
  color: #ffffff;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-weight: 700;
  text-decoration: none;
  font-size: 0.9rem;
}
.btn-cta-secondary {
  background: rgba(255, 255, 255, 0.08);
  color: #ffffff;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-weight: 700;
  text-decoration: none;
  font-size: 0.9rem;
}

.loading-state, .not-found-box {
  text-align: center;
  padding: 6rem 1rem;
}

.btn-return {
  display: inline-block;
  margin-top: 1.5rem;
  background: #2563eb;
  color: #fff;
  padding: 0.6rem 1.25rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 700;
}

.blog-footer {
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  padding: 2rem 1.5rem;
  background: #050914;
}

.footer-container {
  max-width: 1000px;
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
</style>
