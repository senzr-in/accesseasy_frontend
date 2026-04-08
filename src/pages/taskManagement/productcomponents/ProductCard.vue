<template>
    <div 
      class="product-card" 
      :class="{ 'hover': isHovering }"
      @mouseenter="isHovering = true"
      @mouseleave="isHovering = false"
      @click="$emit('click', product)"
    >
      <div class="product-image">
        <img 
          v-if="product.imageUrl" 
          :src="`${product.imageUrl}?access_token=bennGJlPG_qUNKhCSE9WFUo6G_RnQAts`" 
          :alt="product.productName"
          @error="handleImageError"
        />
        <div v-else class="product-image-placeholder">
          {{ product.productName.charAt(0).toUpperCase() }}
        </div>
      </div>
      <div class="product-details">
        <h3 class="product-name">{{ product.productName }}</h3>
        <p v-if="product.productId" class="product-model">Model: {{ product.productId }}</p>
        <p v-if="product.deviceType" class="product-type">Type: {{ product.deviceType }}</p>
        <div class="product-status">
          <span 
            class="status-badge" 
            :class="{ 'draft': product.status === 'draft', 'active': product.status !== 'draft' }"
          >
            {{ product.status.toUpperCase() }}
          </span>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'ProductCard',
    props: {
      product: {
        type: Object,
        required: true
      }
    },
    data() {
      return {
        isHovering: false,
        imageError: false,
        token:"bennGJlPG_qUNKhCSE9WFUo6G_RnQAts" || ""
      }
    },
    methods: {
      handleImageError() {
        this.imageError = true;
      }
    }
  }
  </script>
  
  <style scoped>
  .product-card {
    background-color: var(--surface);
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
    cursor: pointer;
    height: 100%;
    display: flex;
    flex-direction: column;
  }
  
  .product-card.hover {
    transform: scale(1.03);
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
  }
  
  .product-image {
    height: 100px;
    background-color: var(--background);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    border-radius: 12px 12px 0 0;
  }
  
  .product-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .product-image-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32px;
    font-weight: bold;
    color: var(--primary-color);
  }
  
  .product-details {
    padding: 12px;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
  }
  
  .product-name {
    font-size: 14px;
    font-weight: bold;
    margin-bottom: 4px;
    color: var(--text-primary);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .product-model, .product-type {
    font-size: 12px;
    color: var(--text-secondary);
    margin-bottom: 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .product-status {
    margin-top: auto;
    padding-top: 8px;
  }
  
  .status-badge {
    display: inline-block;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 10px;
    font-weight: bold;
  }
  
  .status-badge.draft {
    background-color: var(--warning-light);
    color: var(--warning-color);
  }
  
  .status-badge.active {
    background-color: var(--success-light);
    color: var(--success-color);
  }
  </style>
  