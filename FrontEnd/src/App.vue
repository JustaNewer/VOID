<template>
  <div id="app" :class="themeStore.themeClass">
    <!-- Navigation Header -->
    <header v-if="isAuthenticated" class="app-header">
      <div class="header-content">
        <div class="header-left">
          <h1 class="app-logo">Void</h1>
          <span class="user-address">{{ authStore.getUserAddress?.slice(0, 8) }}...{{ authStore.getUserAddress?.slice(-6) }}</span>
        </div>
        <div class="header-right">
          <ThemeToggle />
          <button @click="handleLogout" class="logout-btn">
            Logout
          </button>
        </div>
      </div>
    </header>

    <!-- Theme Toggle for auth pages -->
    <div v-else class="auth-theme-toggle">
      <ThemeToggle />
    </div>

    <!-- Main Content -->
    <main class="app-main">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from './stores/auth.js'
import { useThemeStore } from './stores/theme.js'
import ThemeToggle from './components/ThemeToggle.vue'

const router = useRouter()
const authStore = useAuthStore()
const themeStore = useThemeStore()

const isAuthenticated = computed(() => authStore.isLoggedIn)

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<style>
/* Global app styles */
#app {
  min-height: 100vh;
  transition: all 0.3s ease;
}

.app-header {
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.app-logo {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.user-address {
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  color: var(--text-secondary);
  background: var(--surface-secondary);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  border: 1px solid var(--border);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.logout-btn {
  background: var(--error);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.logout-btn:hover {
  background: var(--error-hover);
  transform: translateY(-1px);
}

.auth-theme-toggle {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 1000;
}

.app-main {
  flex: 1;
}

@media (max-width: 768px) {
  .header-content {
    padding: 0 1rem;
  }
  
  .header-left {
    gap: 0.5rem;
  }
  
  .app-logo {
    font-size: 1.25rem;
  }
  
  .user-address {
    font-size: 0.8rem;
  }
  
  .header-right {
    gap: 0.5rem;
  }
}
</style>
