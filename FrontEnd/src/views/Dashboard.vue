<template>
  <div class="dashboard-container">
    <div class="dashboard-content">
      <!-- Welcome Section -->
      <div class="welcome-section">
        <h1 class="welcome-title">Welcome to Void</h1>
        <p class="welcome-subtitle">Your secure, decentralized chat network</p>
      </div>

      <!-- Account Information -->
      <div class="account-section">
        <h2 class="section-title">Account Information</h2>
        
        <div class="info-cards">
          <!-- User Address Card -->
          <div class="info-card">
            <div class="card-header">
              <h3 class="card-title">
                <span class="card-icon">🔑</span>
                User Address
              </h3>
            </div>
            <div class="card-content">
              <div class="address-display">
                <code class="address-text">{{ userAddress }}</code>
                <button @click="copyToClipboard(userAddress)" class="copy-btn" title="Copy address">
                  📋
                </button>
              </div>
              <p class="card-description">Your unique identifier on the Void network</p>
            </div>
          </div>

          <!-- Public Key Card -->
          <div class="info-card">
            <div class="card-header">
              <h3 class="card-title">
                <span class="card-icon">🔐</span>
                Public Key
              </h3>
            </div>
            <div class="card-content">
              <div class="key-display">
                <code class="key-text">{{ displayPublicKey ? publicKey : '•'.repeat(64) }}</code>
                <button @click="togglePublicKeyVisibility" class="toggle-btn" title="Toggle visibility">
                  {{ displayPublicKey ? '👁️' : '👁️‍🗨️' }}
                </button>
                <button @click="copyToClipboard(publicKey)" class="copy-btn" title="Copy public key">
                  📋
                </button>
              </div>
              <p class="card-description">Your public key for encryption and verification</p>
            </div>
          </div>

          <!-- Private Key Card -->
          <div class="info-card">
            <div class="card-header">
              <h3 class="card-title">
                <span class="card-icon">🔒</span>
                Private Key Access
              </h3>
            </div>
            <div class="card-content">
              <div v-if="!showPrivateKey" class="private-key-prompt">
                <input
                  v-model="passwordInput"
                  type="password"
                  placeholder="Enter your password to view private key"
                  class="password-input"
                  @keyup.enter="revealPrivateKey"
                />
                <button @click="revealPrivateKey" class="reveal-btn" :disabled="!passwordInput">
                  Reveal Private Key
                </button>
              </div>
              <div v-else class="key-display">
                <code class="key-text">{{ displayPrivateKey ? decryptedPrivateKey : '•'.repeat(64) }}</code>
                <button @click="togglePrivateKeyVisibility" class="toggle-btn" title="Toggle visibility">
                  {{ displayPrivateKey ? '👁️' : '👁️‍🗨️' }}
                </button>
                <button @click="copyToClipboard(decryptedPrivateKey)" class="copy-btn" title="Copy private key">
                  📋
                </button>
                <button @click="hidePrivateKey" class="hide-btn" title="Hide private key">
                  ❌
                </button>
              </div>
              <p class="card-description">
                {{ showPrivateKey ? 'Your private key - keep this secure!' : 'Enter password to access your private key' }}
              </p>
            </div>
          </div>

          <!-- Mnemonic Phrase Card -->
          <div v-if="mnemonic" class="info-card">
            <div class="card-header">
              <h3 class="card-title">
                <span class="card-icon">📝</span>
                Mnemonic Phrase
              </h3>
            </div>
            <div class="card-content">
              <div class="mnemonic-display">
                <div class="mnemonic-words">
                  <span v-for="(word, index) in mnemonicWords" :key="index" class="mnemonic-word">
                    <span class="word-number">{{ index + 1 }}.</span>
                    {{ word }}
                  </span>
                </div>
                <button @click="copyToClipboard(mnemonic)" class="copy-btn" title="Copy mnemonic">
                  📋
                </button>
              </div>
              <p class="card-description">Your recovery phrase - store this safely</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="actions-section">
        <h2 class="section-title">Quick Actions</h2>
        <div class="action-buttons">
          <button @click="exportCredentials" class="action-btn">
            💾 Export Account
          </button>
          <button @click="showQRCode" class="action-btn">
            📱 Show QR Code
          </button>
          <button @click="refreshAccount" class="action-btn">
            🔄 Refresh
          </button>
        </div>
      </div>

      <!-- Error Display -->
      <div v-if="error" class="error-message">
        {{ error }}
      </div>

      <!-- Copy Notification -->
      <div v-if="copyNotification" class="copy-notification">
        Copied to clipboard!
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth.js'

const authStore = useAuthStore()

// Reactive data
const displayPublicKey = ref(false)
const displayPrivateKey = ref(false)
const showPrivateKey = ref(false)
const passwordInput = ref('')
const decryptedPrivateKey = ref('')
const copyNotification = ref(false)
const error = ref(null)

// Computed properties
const userAddress = computed(() => authStore.getUserAddress)
const publicKey = computed(() => authStore.getPublicKey)
const mnemonic = computed(() => authStore.user?.mnemonic)
const mnemonicWords = computed(() => {
  return mnemonic.value ? mnemonic.value.split(' ') : []
})

// Methods
const togglePublicKeyVisibility = () => {
  displayPublicKey.value = !displayPublicKey.value
}

const togglePrivateKeyVisibility = () => {
  displayPrivateKey.value = !displayPrivateKey.value
}

const revealPrivateKey = async () => {
  if (!passwordInput.value) return

  try {
    decryptedPrivateKey.value = authStore.getPrivateKey(passwordInput.value)
    showPrivateKey.value = true
    error.value = null
    passwordInput.value = ''
  } catch (err) {
    error.value = 'Invalid password'
    setTimeout(() => {
      error.value = null
    }, 3000)
  }
}

const hidePrivateKey = () => {
  showPrivateKey.value = false
  displayPrivateKey.value = false
  decryptedPrivateKey.value = ''
}

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    copyNotification.value = true
    setTimeout(() => {
      copyNotification.value = false
    }, 2000)
  } catch (error) {
    console.error('Failed to copy to clipboard:', error)
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
    copyNotification.value = true
    setTimeout(() => {
      copyNotification.value = false
    }, 2000)
  }
}

const exportCredentials = () => {
  const content = `Void Account Credentials
Generated on: ${new Date().toLocaleString()}

User Address:
${userAddress.value}

Public Key:
${publicKey.value}

${mnemonic.value ? `Mnemonic Phrase:
${mnemonic.value}

` : ''}---
Void - Distributed Encrypted Chat Network
`

  const blob = new Blob([content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `void-account-${userAddress.value.substring(0, 8)}.txt`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

const showQRCode = () => {
  // TODO: Implement QR code display for user address
  alert('QR Code feature coming soon!')
}

const refreshAccount = () => {
  // TODO: Implement account refresh functionality
  copyNotification.value = true
  setTimeout(() => {
    copyNotification.value = false
  }, 1000)
}

// Lifecycle
onMounted(() => {
  if (!authStore.isLoggedIn) {
    // This should not happen due to route guards, but just in case
    router.push('/login')
  }
})
</script>

<style scoped>
.dashboard-container {
  min-height: calc(100vh - 80px);
  padding: 2rem;
  background: var(--bg-gradient);
}

.dashboard-content {
  max-width: 1200px;
  margin: 0 auto;
}

.welcome-section {
  text-align: center;
  margin-bottom: 3rem;
}

.welcome-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.welcome-subtitle {
  font-size: 1.1rem;
  color: var(--text-secondary);
  margin: 0;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 1.5rem 0;
}

.account-section {
  margin-bottom: 3rem;
}

.info-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
}

.info-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: var(--shadow-md);
  transition: all 0.2s ease;
}

.info-card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}

.card-header {
  margin-bottom: 1rem;
}

.card-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.card-icon {
  font-size: 1.2rem;
}

.card-content {
  color: var(--text-secondary);
}

.address-display,
.key-display {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--surface-secondary);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 0.5rem;
}

.address-text,
.key-text {
  flex: 1;
  font-family: 'Courier New', monospace;
  font-size: 0.85rem;
  color: var(--text-primary);
  word-break: break-all;
  line-height: 1.4;
}

.mnemonic-display {
  background: var(--surface-secondary);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 0.5rem;
}

.mnemonic-words {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.mnemonic-word {
  background: var(--surface);
  padding: 0.5rem;
  border-radius: 6px;
  border: 1px solid var(--border);
  font-family: 'Courier New', monospace;
  font-size: 0.85rem;
  color: var(--text-primary);
}

.word-number {
  color: var(--text-secondary);
  font-size: 0.75rem;
  margin-right: 0.25rem;
}

.private-key-prompt {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.password-input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--surface-secondary);
  color: var(--text-primary);
  font-size: 0.9rem;
}

.password-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-alpha);
}

.copy-btn,
.toggle-btn,
.reveal-btn,
.hide-btn {
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.5rem;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.2s ease;
  min-width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.copy-btn:hover,
.toggle-btn:hover,
.reveal-btn:hover,
.hide-btn:hover {
  background: var(--primary-hover);
  transform: translateY(-1px);
}

.reveal-btn {
  padding: 0.5rem 1rem;
  min-width: auto;
}

.reveal-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.hide-btn {
  background: var(--error);
}

.hide-btn:hover {
  background: var(--error-hover);
}

.card-description {
  font-size: 0.85rem;
  margin: 0;
  line-height: 1.4;
}

.actions-section {
  margin-bottom: 2rem;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.action-btn {
  background: var(--surface);
  color: var(--text-primary);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.action-btn:hover {
  background: var(--surface-hover);
  border-color: var(--primary);
  transform: translateY(-1px);
}

.error-message {
  background: var(--error-bg);
  color: var(--error);
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  border: 1px solid var(--error-border);
  text-align: center;
  margin-top: 1rem;
}

.copy-notification {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  background: var(--success);
  color: white;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  box-shadow: var(--shadow-lg);
  animation: slideIn 0.3s ease;
  z-index: 1000;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .dashboard-container {
    padding: 1rem;
  }
  
  .welcome-title {
    font-size: 2rem;
  }
  
  .info-cards {
    grid-template-columns: 1fr;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .private-key-prompt {
    flex-direction: column;
    align-items: stretch;
  }
  
  .mnemonic-words {
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  }
}
</style> 