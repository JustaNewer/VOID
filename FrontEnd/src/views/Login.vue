<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h1 class="app-title">Void</h1>
        <p class="app-subtitle">Distributed Encrypted Chat Network</p>
      </div>

      <!-- Quick Login Section (if credentials are remembered) -->
      <div v-if="hasStoredCredentials" class="quick-login-section">
        <h2>Quick Login</h2>
        <form @submit.prevent="handleQuickLogin" class="login-form">
          <div class="form-group">
            <label for="quickPassword">Password</label>
            <input
              id="quickPassword"
              v-model="quickPassword"
              type="password"
              class="form-input"
              placeholder="Enter your password"
              :disabled="loading"
              required
            />
          </div>
          
          <button
            type="submit"
            class="btn btn-primary"
            :disabled="loading || !quickPassword"
          >
            <span v-if="loading" class="loading-spinner"></span>
            {{ loading ? 'Logging in...' : 'Login' }}
          </button>
        </form>

        <div class="divider">
          <span>or</span>
        </div>
      </div>

      <!-- Import Credentials Section -->
      <div class="import-section">
        <h2>{{ hasStoredCredentials ? 'Import Different Account' : 'Import Account' }}</h2>
        
        <!-- Import Method Tabs -->
        <div class="tab-buttons">
          <button
            @click="activeTab = 'mnemonic'"
            :class="['tab-btn', { active: activeTab === 'mnemonic' }]"
          >
            Mnemonic Phrase
          </button>
          <button
            @click="activeTab = 'privateKey'"
            :class="['tab-btn', { active: activeTab === 'privateKey' }]"
          >
            Private Key
          </button>
          <button
            @click="activeTab = 'wif'"
            :class="['tab-btn', { active: activeTab === 'wif' }]"
          >
            WIF Format
          </button>
        </div>

        <!-- Mnemonic Import Form -->
        <form v-if="activeTab === 'mnemonic'" @submit.prevent="handleMnemonicLogin" class="login-form">
          <div class="form-group">
            <label for="mnemonic">Mnemonic Phrase</label>
            <textarea
              id="mnemonic"
              v-model="mnemonic"
              class="form-textarea"
              placeholder="Enter your 12 or 24 word mnemonic phrase separated by spaces"
              :disabled="loading"
              rows="3"
              required
            ></textarea>
            <small class="form-hint">Enter words separated by spaces (e.g., word1 word2 word3...)</small>
          </div>

          <div class="form-group">
            <label for="mnemonicPassword">Set Login Password</label>
            <input
              id="mnemonicPassword"
              v-model="password"
              type="password"
              class="form-input"
              placeholder="Create a password to encrypt your private key"
              :disabled="loading"
              required
            />
          </div>

          <div class="form-group">
            <label class="checkbox-label">
              <input
                v-model="rememberMe"
                type="checkbox"
                class="form-checkbox"
                :disabled="loading"
              />
              <span class="checkbox-text">Remember me on this device</span>
            </label>
          </div>

          <button
            type="submit"
            class="btn btn-primary"
            :disabled="loading || !mnemonic || !password"
          >
            <span v-if="loading" class="loading-spinner"></span>
            {{ loading ? 'Importing...' : 'Import & Login' }}
          </button>
        </form>

        <!-- Private Key Import Form -->
        <form v-if="activeTab === 'privateKey'" @submit.prevent="handlePrivateKeyLogin" class="login-form">
          <div class="form-group">
            <label for="privateKey">Private Key</label>
            <input
              id="privateKey"
              v-model="privateKey"
              type="password"
              class="form-input"
              placeholder="Enter your 64-character hexadecimal private key"
              :disabled="loading"
              required
            />
            <small class="form-hint">64 hexadecimal characters (with or without 0x prefix)</small>
          </div>

          <div class="form-group">
            <label for="privateKeyPassword">Set Login Password</label>
            <input
              id="privateKeyPassword"
              v-model="password"
              type="password"
              class="form-input"
              placeholder="Create a password to encrypt your private key"
              :disabled="loading"
              required
            />
          </div>

          <div class="form-group">
            <label class="checkbox-label">
              <input
                v-model="rememberMe"
                type="checkbox"
                class="form-checkbox"
                :disabled="loading"
              />
              <span class="checkbox-text">Remember me on this device</span>
            </label>
          </div>

          <button
            type="submit"
            class="btn btn-primary"
            :disabled="loading || !privateKey || !password"
          >
            <span v-if="loading" class="loading-spinner"></span>
            {{ loading ? 'Importing...' : 'Import & Login' }}
          </button>
        </form>

        <!-- WIF Import Form -->
        <form v-if="activeTab === 'wif'" @submit.prevent="handleWifLogin" class="login-form">
          <div class="form-group">
            <label for="wifKey">WIF Private Key</label>
            <input
              id="wifKey"
              v-model="wifKey"
              type="password"
              class="form-input"
              placeholder="Enter your WIF (Wallet Import Format) private key"
              :disabled="loading"
              required
            />
            <small class="form-hint">Base58 encoded private key compatible with Bitcoin wallets</small>
          </div>

          <div class="form-group">
            <label for="wifPassword">Set Login Password</label>
            <input
              id="wifPassword"
              v-model="password"
              type="password"
              class="form-input"
              placeholder="Create a password to encrypt your private key"
              :disabled="loading"
              required
            />
          </div>

          <div class="form-group">
            <label class="checkbox-label">
              <input
                v-model="rememberMe"
                type="checkbox"
                class="form-checkbox"
                :disabled="loading"
              />
              <span class="checkbox-text">Remember me on this device</span>
            </label>
          </div>

          <button
            type="submit"
            class="btn btn-primary"
            :disabled="loading || !wifKey || !password"
          >
            <span v-if="loading" class="loading-spinner"></span>
            {{ loading ? 'Importing...' : 'Import & Login' }}
          </button>
        </form>
      </div>

      <!-- Error Display -->
      <div v-if="error" class="error-message">
        {{ error }}
      </div>

      <!-- Register Link -->
      <div class="register-link">
        <p>Don't have an account? <router-link to="/register" class="link">Create new account</router-link></p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'

const router = useRouter()
const authStore = useAuthStore()

// Reactive data
const activeTab = ref('mnemonic')
const mnemonic = ref('')
const privateKey = ref('')
const wifKey = ref('')
const password = ref('')
const quickPassword = ref('')
const rememberMe = ref(false)
const loading = ref(false)

// Computed properties
const error = computed(() => authStore.error)
const hasStoredCredentials = computed(() => authStore.hasRememberedCredentials())

// Methods
const handleMnemonicLogin = async () => {
  if (!mnemonic.value || !password.value) return

  loading.value = true
  try {
    const accountData = await authStore.importFromMnemonic(mnemonic.value)
    await authStore.login(accountData, password.value, rememberMe.value)
    router.push('/dashboard')
  } catch (error) {
    console.error('Mnemonic login failed:', error)
  } finally {
    loading.value = false
  }
}

const handlePrivateKeyLogin = async () => {
  if (!privateKey.value || !password.value) return

  loading.value = true
  try {
    const accountData = await authStore.importFromPrivateKey(privateKey.value)
    await authStore.login(accountData, password.value, rememberMe.value)
    router.push('/dashboard')
  } catch (error) {
    console.error('Private key login failed:', error)
  } finally {
    loading.value = false
  }
}

const handleWifLogin = async () => {
  if (!wifKey.value || !password.value) return

  loading.value = true
  try {
    const accountData = await authStore.importFromPrivateKey(wifKey.value)
    await authStore.login(accountData, password.value, rememberMe.value)
    router.push('/dashboard')
  } catch (error) {
    console.error('WIF login failed:', error)
  } finally {
    loading.value = false
  }
}

const handleQuickLogin = async () => {
  if (!quickPassword.value) return

  loading.value = true
  try {
    await authStore.quickLogin(quickPassword.value)
    router.push('/dashboard')
  } catch (error) {
    console.error('Quick login failed:', error)
  } finally {
    loading.value = false
  }
}

// Lifecycle
onMounted(() => {
  authStore.clearError()
})
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: var(--bg-gradient);
}

.login-card {
  background: var(--surface);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: var(--shadow-lg);
  max-width: 480px;
  width: 100%;
  border: 1px solid var(--border);
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.app-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--primary);
  margin: 0 0 0.5rem 0;
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.app-subtitle {
  color: var(--text-secondary);
  margin: 0;
  font-size: 0.95rem;
}

.quick-login-section {
  margin-bottom: 1.5rem;
}

.quick-login-section h2,
.import-section h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 1rem 0;
}

.tab-buttons {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.tab-btn {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border);
  background: var(--surface-secondary);
  color: var(--text-secondary);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
  font-weight: 500;
}

.tab-btn:hover {
  background: var(--surface-hover);
  color: var(--text-primary);
}

.tab-btn.active {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
  color: var(--text-primary);
  font-size: 0.9rem;
}

.form-input,
.form-textarea {
  padding: 0.75rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface-secondary);
  color: var(--text-primary);
  font-size: 0.95rem;
  transition: all 0.2s ease;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-alpha);
}

.form-input:disabled,
.form-textarea:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
}

.form-hint {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.form-checkbox {
  width: 1rem;
  height: 1rem;
  accent-color: var(--primary);
}

.checkbox-text {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-primary {
  background: var(--primary);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--primary-hover);
  transform: translateY(-1px);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.loading-spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.divider {
  text-align: center;
  margin: 1.5rem 0;
  position: relative;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: var(--border);
}

.divider span {
  background: var(--surface);
  color: var(--text-secondary);
  padding: 0 1rem;
  font-size: 0.9rem;
}

.error-message {
  background: var(--error-bg);
  color: var(--error);
  padding: 0.75rem;
  border-radius: 8px;
  font-size: 0.9rem;
  margin-top: 1rem;
  border: 1px solid var(--error-border);
}

.register-link {
  text-align: center;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border);
}

.register-link p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.link {
  color: var(--primary);
  text-decoration: none;
  font-weight: 500;
}

.link:hover {
  text-decoration: underline;
}

@media (max-width: 640px) {
  .login-card {
    padding: 1.5rem;
    margin: 0.5rem;
  }
  
  .app-title {
    font-size: 2rem;
  }
  
  .tab-buttons {
    flex-direction: column;
  }
}
</style> 