<template>
  <div class="video-player-wrapper">
    <video
      ref="videoRef"
      class="video-element"
      controls
      :poster="posterUrl"
      :autoplay="autoplay"
    >
      <source :src="videoUrl" type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';

const props = defineProps({
  videoUrl: {
    type: String,
    required: true,
  },
  posterUrl: {
    type: String,
    default: '',
  },
  autoplay: {
    type: Boolean,
    default: false,
  },
});

const videoRef = ref(null);

onMounted(() => {
  if (props.autoplay && videoRef.value) {
    videoRef.value.play().catch(err => console.error('Autoplay failed:', err));
  }
});

onBeforeUnmount(() => {
  if (videoRef.value) {
    videoRef.value.pause();
  }
});
</script>

<style scoped>
.video-player-wrapper {
  width: 100%;
  height: 100%;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.video-element {
  max-width: 100%;
  max-height: 100%;
  width: 100%;
  height: auto;
}
</style>
