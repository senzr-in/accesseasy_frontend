<template>
    <div class="search-bar" :class="{ 'focused': isFocused }">
      <i class="search-icon fas fa-search"></i>
      <input
        type="text"
        :placeholder="placeholder"
        v-model="searchValue"
        @focus="isFocused = true"
        @blur="isFocused = false"
        class="search-input"
      />
      <button 
        v-if="searchValue" 
        class="clear-button"
        @click="clearSearch"
      >
        <i class="fas fa-times"></i>
      </button>
    </div>
  </template>
  
  <script>
  export default {
    name: 'SearchBar',
    props: {
      placeholder: {
        type: String,
        default: 'Search...'
      },
      value: {
        type: String,
        default: ''
      }
    },
    data() {
      return {
        searchValue: this.value,
        isFocused: false
      }
    },
    watch: {
      value(newValue) {
        this.searchValue = newValue;
      },
      searchValue(newValue) {
        this.$emit('input', newValue);
        this.$emit('search', newValue);
      }
    },
    methods: {
      clearSearch() {
        this.searchValue = '';
      }
    }
  }
  </script>
  
  <style scoped>
  .search-bar {
    height: 44px;
    background-color: white;
    border-radius: 22px;
    display: flex;
    align-items: center;
    padding: 0 16px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: all 0.2s;
  }
  
  .search-bar.focused {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }
  
  .search-icon {
    color: var(--text-secondary);
    font-size: 16px;
    margin-right: 8px;
  }
  
  .search-input {
    flex-grow: 1;
    border: none;
    outline: none;
    font-size: 14px;
    color: var(--text-primary);
    background: transparent;
  }
  
  .search-input::placeholder {
    color: var(--text-secondary);
  }
  
  .clear-button {
    background: none;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    padding: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  </style>
  