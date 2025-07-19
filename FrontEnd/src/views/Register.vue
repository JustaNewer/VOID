<template>
  <div class="register-container">
    <div class="register-card">
      <div class="register-header">
        <h1 class="app-title">Void</h1>
        <p class="app-subtitle">Create New Account</p>
      </div>

      <!-- Step 1: Generate Account -->
      <div v-if="step === 1" class="step-content">
        <div class="step-header">
          <h2>Generate New Account</h2>
          <p>We'll create a new secure account for you with a private key and mnemonic phrase.</p>
        </div>

        <button
          @click="generateNewAccount"
          class="btn btn-primary btn-large"
          :disabled="loading"
        >
          <span v-if="loading" class="loading-spinner"></span>
          {{ loading ? 'Generating...' : 'Generate New Account' }}
        </button>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>
      </div>

      <!-- Step 2: Display Generated Credentials -->
      <div v-if="step === 2" class="step-content">
        <div class="step-header">
          <h2>Account Created Successfully!</h2>
          <p class="warning-text">
            ⚠️ <strong>IMPORTANT:</strong> Save these credentials securely. You'll need them to access your account. 
            We cannot recover them if lost!
          </p>
        </div>

        <div class="credentials-section">
          <!-- User Address -->
          <div class="credential-group">
            <label>Your User Address</label>
            <div class="credential-display">
              <code class="credential-text">{{ accountData.userAddress }}</code>
              <button @click="copyToClipboard(accountData.userAddress)" class="copy-btn" title="Copy to clipboard">
                📋
              </button>
            </div>
            <small class="credential-hint">This is your public identifier on the network</small>
          </div>

          <!-- Mnemonic Phrase -->
          <div class="credential-group">
            <label>Mnemonic Phrase ({{ accountData.wordCount }} words)</label>
            <div class="credential-display mnemonic-display">
              <div class="mnemonic-words">
                <span v-for="(word, index) in mnemonicWords" :key="index" class="mnemonic-word">
                  <span class="word-number">{{ index + 1 }}.</span>
                  {{ word }}
                </span>
              </div>
              <button @click="copyToClipboard(accountData.mnemonic)" class="copy-btn" title="Copy to clipboard">
                📋
              </button>
            </div>
            <small class="credential-hint">Recommended: Use this to restore your account</small>
          </div>

          <!-- Private Key -->
          <div class="credential-group">
            <label>Private Key (Hex)</label>
            <div class="credential-display">
              <code class="credential-text private-key">{{ displayPrivateKey ? accountData.privateKey : '•'.repeat(64) }}</code>
              <button @click="togglePrivateKeyVisibility" class="toggle-btn" title="Toggle visibility">
                {{ displayPrivateKey ? '👁️' : '👁️‍🗨️' }}
              </button>
              <button @click="copyToClipboard(accountData.privateKey)" class="copy-btn" title="Copy to clipboard">
                📋
              </button>
            </div>
            <small class="credential-hint">Hexadecimal format private key</small>
          </div>

          <!-- WIF Private Key -->
          <div v-if="accountData.wif" class="credential-group">
            <label>Private Key (WIF)</label>
            <div class="credential-display">
              <code class="credential-text private-key">{{ displayWifKey ? accountData.wif : '•'.repeat(51) }}</code>
              <button @click="toggleWifKeyVisibility" class="toggle-btn" title="Toggle visibility">
                {{ displayWifKey ? '👁️' : '👁️‍🗨️' }}
              </button>
              <button @click="copyToClipboard(accountData.wif)" class="copy-btn" title="Copy to clipboard">
                📋
              </button>
            </div>
            <small class="credential-hint">WIF format - compatible with Bitcoin wallets</small>
          </div>
        </div>

        <!-- Print/Save Options -->
        <div class="save-options">
          <button @click="printCredentials" class="btn btn-secondary">
            🖨️ Print Credentials
          </button>
          <button @click="downloadCredentials" class="btn btn-secondary">
            💾 Download as Text File
          </button>
        </div>

        <!-- Confirmation -->
        <div class="confirmation-section">
          <label class="checkbox-label">
            <input
              v-model="savedConfirmation"
              type="checkbox"
              class="form-checkbox"
              required
            />
            <span class="checkbox-text">
              I have securely saved my private key and/or mnemonic phrase
            </span>
          </label>

          <button
            @click="proceedToLogin"
            class="btn btn-primary btn-large"
            :disabled="!savedConfirmation"
          >
            Continue to Set Password
          </button>
        </div>
      </div>

      <!-- Step 3: Set Login Password -->
      <div v-if="step === 3" class="step-content">
        <div class="step-header">
          <h2>Set Login Password</h2>
          <p>Create a password to encrypt and protect your private key on this device.</p>
        </div>

        <form @submit.prevent="completeRegistration" class="login-form">
          <div class="form-group">
            <label for="password">Login Password</label>
            <input
              id="password"
              v-model="password"
              type="password"
              class="form-input"
              placeholder="Create a strong password"
              :disabled="loading"
              required
              minlength="6"
            />
            <small class="form-hint">Minimum 6 characters</small>
          </div>

          <div class="form-group">
            <label for="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              v-model="confirmPassword"
              type="password"
              class="form-input"
              placeholder="Confirm your password"
              :disabled="loading"
              required
            />
          </div>

          <div v-if="passwordError" class="error-message">
            {{ passwordError }}
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
            class="btn btn-primary btn-large"
            :disabled="loading || !password || !confirmPassword || password !== confirmPassword"
          >
            <span v-if="loading" class="loading-spinner"></span>
            {{ loading ? 'Creating Account...' : 'Complete Registration' }}
          </button>
        </form>
      </div>

      <!-- Login Link -->
      <div class="login-link">
        <p>Already have an account? <router-link to="/login" class="link">Sign in here</router-link></p>
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
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'

const router = useRouter()
const authStore = useAuthStore()

// Reactive data
const step = ref(1)
const accountData = ref(null)
const displayPrivateKey = ref(false)
const displayWifKey = ref(false)
const savedConfirmation = ref(false)
const password = ref('')
const confirmPassword = ref('')
const rememberMe = ref(false)
const loading = ref(false)
const copyNotification = ref(false)

// Computed properties
const error = computed(() => authStore.error)
const mnemonicWords = computed(() => {
  return accountData.value ? accountData.value.mnemonic.split(' ') : []
})

const passwordError = computed(() => {
  if (!password.value || !confirmPassword.value) return null
  if (password.value !== confirmPassword.value) {
    return 'Passwords do not match'
  }
  if (password.value.length < 6) {
    return 'Password must be at least 6 characters'
  }
  return null
})

// Methods
const generateNewAccount = async () => {
  loading.value = true
  try {
    accountData.value = await authStore.generateAccount()
    step.value = 2
  } catch (error) {
    console.error('Failed to generate account:', error)
  } finally {
    loading.value = false
  }
}

const togglePrivateKeyVisibility = () => {
  displayPrivateKey.value = !displayPrivateKey.value
}

const toggleWifKeyVisibility = () => {
  displayWifKey.value = !displayWifKey.value
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

const printCredentials = () => {
  const printWindow = window.open('', '_blank')
  printWindow.document.write(`
    <html>
      <head>
        <title>Void Account Credentials</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 2rem; }
          .header { text-align: center; margin-bottom: 2rem; }
          .credential { margin-bottom: 1.5rem; }
          .label { font-weight: bold; margin-bottom: 0.5rem; }
          .value { background: #f5f5f5; padding: 1rem; border-radius: 4px; word-break: break-all; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 1rem; border-radius: 4px; margin-bottom: 2rem; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Void Account Credentials</h1>
          <p>Generated on: ${new Date().toLocaleString()}</p>
        </div>
        <div class="warning">
          <strong>⚠️ IMPORTANT:</strong> Keep these credentials secure and private. Anyone with access to your private key or mnemonic phrase can control your account.
        </div>
        <div class="credential">
          <div class="label">User Address:</div>
          <div class="value">${accountData.value.userAddress}</div>
        </div>
        <div class="credential">
          <div class="label">Mnemonic Phrase (${accountData.value.wordCount} words):</div>
          <div class="value">${accountData.value.mnemonic}</div>
        </div>
        <div class="credential">
          <div class="label">Private Key (Hex):</div>
          <div class="value">${accountData.value.privateKey}</div>
        </div>
        ${accountData.value.wif ? `<div class="credential">
          <div class="label">Private Key (WIF):</div>
          <div class="value">${accountData.value.wif}</div>
        </div>` : ''}
      </body>
    </html>
  `)
  printWindow.document.close()
  printWindow.print()
}

const downloadCredentials = () => {
  const content = `Void Account Credentials
Generated on: ${new Date().toLocaleString()}

⚠️ IMPORTANT: Keep these credentials secure and private. Anyone with access to your private key or mnemonic phrase can control your account.

User Address:
${accountData.value.userAddress}

Mnemonic Phrase (${accountData.value.wordCount} words):
${accountData.value.mnemonic}

Private Key (Hex):
${accountData.value.privateKey}

${accountData.value.wif ? `Private Key (WIF):
${accountData.value.wif}

` : ''}---
Void - Distributed Encrypted Chat Network
`

  const blob = new Blob([content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `void-account-${accountData.value.userAddress.substring(0, 8)}.txt`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

const proceedToLogin = () => {
  if (savedConfirmation.value) {
    step.value = 3
  }
}

const completeRegistration = async () => {
  if (passwordError.value) return

  loading.value = true
  try {
    await authStore.login(accountData.value, password.value, rememberMe.value)
    router.push('/dashboard')
  } catch (error) {
    console.error('Registration completion failed:', error)
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
.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: var(--bg-gradient);
}

.register-card {
  background: var(--surface);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: var(--shadow-lg);
  max-width: 600px;
  width: 100%;
  border: 1px solid var(--border);
}

.register-header {
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
  font-size: 1.1rem;
  font-weight: 500;
}

.step-content {
  margin-bottom: 2rem;
}

.step-header {
  text-align: center;
  margin-bottom: 2rem;
}

.step-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 1rem 0;
}

.step-header p {
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.5;
}

.warning-text {
  background: var(--warning-bg);
  color: var(--warning);
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid var(--warning-border);
  font-size: 0.9rem;
}

.credentials-section {
  margin: 2rem 0;
}

.credential-group {
  margin-bottom: 2rem;
}

.credential-group label {
  display: block;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
}

.credential-display {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--surface-secondary);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 1rem;
}

.credential-text {
  flex: 1;
  font-family: 'Courier New', monospace;
  font-size: 0.85rem;
  color: var(--text-primary);
  word-break: break-all;
  line-height: 1.4;
}

.private-key {
  letter-spacing: 0.5px;
}

.mnemonic-display {
  flex-direction: column;
  align-items: stretch;
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

.copy-btn,
.toggle-btn {
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
.toggle-btn:hover {
  background: var(--primary-hover);
  transform: translateY(-1px);
}

.credential-hint {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-top: 0.5rem;
  display: block;
}

.save-options {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin: 2rem 0;
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
  text-decoration: none;
}

.btn-primary {
  background: var(--primary);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--primary-hover);
  transform: translateY(-1px);
}

.btn-secondary {
  background: var(--surface-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--surface-hover);
  transform: translateY(-1px);
}

.btn-large {
  padding: 1rem 2rem;
  font-size: 1rem;
  width: 100%;
  justify-content: center;
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

.confirmation-section {
  background: var(--info-bg);
  border: 1px solid var(--info-border);
  border-radius: 8px;
  padding: 1.5rem;
  margin-top: 2rem;
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  cursor: pointer;
  margin-bottom: 1.5rem;
}

.form-checkbox {
  width: 1rem;
  height: 1rem;
  margin-top: 0.1rem;
  accent-color: var(--primary);
}

.checkbox-text {
  font-size: 0.9rem;
  color: var(--text-primary);
  line-height: 1.4;
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

.form-input {
  padding: 0.75rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface-secondary);
  color: var(--text-primary);
  font-size: 0.95rem;
  transition: all 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-alpha);
}

.form-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.form-hint {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.error-message {
  background: var(--error-bg);
  color: var(--error);
  padding: 0.75rem;
  border-radius: 8px;
  font-size: 0.9rem;
  border: 1px solid var(--error-border);
  text-align: center;
}

.login-link {
  text-align: center;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid var(--border);
}

.login-link p {
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

@media (max-width: 640px) {
  .register-card {
    padding: 1.5rem;
    margin: 0.5rem;
  }
  
  .app-title {
    font-size: 2rem;
  }
  
  .save-options {
    flex-direction: column;
  }
  
  .mnemonic-words {
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  }
}
</style> 