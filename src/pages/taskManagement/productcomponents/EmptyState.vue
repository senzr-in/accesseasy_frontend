<template>
    <div class="empty-state">
      <div class="icon-container">
        <i :class="iconClass"></i>
      </div>
      <h3 class="title">{{ title }}</h3>
      <p class="description">{{ description }}</p>
      <button 
        v-if="buttonText" 
        class="action-button"
        @click="$emit('button-click')"
      >
        <i class="fas fa-plus"></i>
        <span>{{ buttonText }}</span>
      </button>
    </div>
  </template>
  
  <script>
  export default {
    name: 'EmptyState',
    props: {
      icon: {
        type: String,
        default: 'inventory_2_outlined'
      },
      title: {
        type: String,
        required: true
      },
      description: {
        type: String,
        required: true
      },
      buttonText: {
        type: String,
        default: null
      }
    },
    computed: {
      iconClass() {
        // Map Flutter material icons to Font Awesome
        const iconMap = {
          'inventory_2_outlined': 'fas fa-boxes',
          'category_outlined': 'fas fa-tags',
          'search': 'fas fa-search',
          'error_outline': 'fas fa-exclamation-circle'
        };
        
        return iconMap[this.icon] || 'fas fa-box';
      }
    }
  }
  </script>
  
  <style scoped>
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 24px;
    text-align: center;
    height: 100%;
  }
  
  .icon-container {
    width: 64px;
    height: 64px;
    background-color: rgba(0, 137, 123, 0.1);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
  }
  
  .icon-container i {
    font-size: 32px;
    color: var(--primary-color);
  }
  
  .title {
    font-size: 18px;
    font-weight: bold;
    color: var(--text-primary);
    margin-bottom: 8px;
  }
  
  .description {
    font-size: 14px;
    color: var(--text-secondary);
    margin-bottom: 24px;
    max-width: 300px;
  }
  
  .action-button {
    display: flex;
    align-items: center;
    background-color: var(--primary-color);
    color: white;
    border: none;
    border-radius: 24px;
    padding: 12px 24px;
    font-size: 14px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .action-button:hover {
    background-color: var(--primary-dark);
  }
  
  .action-button i {
    margin-right: 8px;
    font-size: 18px;
  }
  </style>
  