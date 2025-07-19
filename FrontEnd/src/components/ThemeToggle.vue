<template>
  <button
    @click="toggleTheme"
    class="theme-toggle"
    :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
  >
    <span class="theme-icon">{{ isDark ? '☀️' : '🌙' }}</span>
  </button>
</template>

<script setup>
import { computed } from 'vue'
import { useThemeStore } from '../stores/theme.js'

const themeStore = useThemeStore()

const isDark = computed(() => themeStore.isDark)

const toggleTheme = () => {
  themeStore.toggleTheme()
}
</script>

<style scoped>
.theme-toggle {
  background: var(--surface-secondary);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
}

.theme-toggle:hover {
  background: var(--surface-hover);
  border-color: var(--primary);
  transform: translateY(-1px);
}

.theme-icon {
  font-size: 1.2rem;
  transition: transform 0.2s ease;
}

.theme-toggle:hover .theme-icon {
  transform: scale(1.1);
}
</style> 