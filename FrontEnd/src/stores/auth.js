import { defineStore } from 'pinia'
import CryptoJS from 'crypto-js'
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null
    }),

    getters: {
        getUserAddress: (state) => state.user?.userAddress || null,
        getPublicKey: (state) => state.user?.publicKey || null,
        isLoggedIn: (state) => state.isAuthenticated && state.user !== null
    },

    actions: {
        // Generate new account
        async generateAccount() {
            this.loading = true
            this.error = null

            try {
                const response = await axios.post(`${API_BASE_URL}/auth/generate-account`)

                if (response.data.success) {
                    return response.data.data
                } else {
                    throw new Error(response.data.message || 'Failed to generate account')
                }
            } catch (error) {
                this.error = error.response?.data?.message || error.message || 'Network error'
                throw error
            } finally {
                this.loading = false
            }
        },

        // Import account from mnemonic
        async importFromMnemonic(mnemonic) {
            this.loading = true
            this.error = null

            try {
                const response = await axios.post(`${API_BASE_URL}/auth/import-mnemonic`, {
                    mnemonic: mnemonic.trim()
                })

                if (response.data.success) {
                    return response.data.data
                } else {
                    throw new Error(response.data.message || 'Failed to import mnemonic')
                }
            } catch (error) {
                this.error = error.response?.data?.message || error.message || 'Network error'
                throw error
            } finally {
                this.loading = false
            }
        },

        // Import account from private key
        async importFromPrivateKey(privateKey) {
            this.loading = true
            this.error = null

            try {
                const response = await axios.post(`${API_BASE_URL}/auth/import-private-key`, {
                    privateKey: privateKey.trim()
                })

                if (response.data.success) {
                    return response.data.data
                } else {
                    throw new Error(response.data.message || 'Failed to import private key')
                }
            } catch (error) {
                this.error = error.response?.data?.message || error.message || 'Network error'
                throw error
            } finally {
                this.loading = false
            }
        },

        // Login with account data
        async login(accountData, password, rememberMe = false) {
            try {
                // Encrypt private key with password
                const encryptedPrivateKey = CryptoJS.AES.encrypt(
                    accountData.privateKey,
                    password
                ).toString()

                // Store user data
                this.user = {
                    userAddress: accountData.userAddress,
                    publicKey: accountData.publicKey,
                    mnemonic: accountData.mnemonic,
                    encryptedPrivateKey
                }

                this.isAuthenticated = true

                // Store in localStorage if remember me is checked
                if (rememberMe) {
                    const userData = {
                        userAddress: accountData.userAddress,
                        publicKey: accountData.publicKey,
                        encryptedPrivateKey,
                        // Note: mnemonic is not stored for security
                    }
                    localStorage.setItem('voidUser', JSON.stringify(userData))
                    localStorage.setItem('voidRememberMe', 'true')
                }

                // Store in sessionStorage for current session
                sessionStorage.setItem('voidCurrentUser', JSON.stringify(this.user))

                return true
            } catch (error) {
                this.error = 'Failed to login: ' + error.message
                throw error
            }
        },

        // Quick login with stored credentials
        async quickLogin(password) {
            try {
                const storedUser = localStorage.getItem('voidUser')
                if (!storedUser) {
                    throw new Error('No stored credentials found')
                }

                const userData = JSON.parse(storedUser)

                // Try to decrypt private key to verify password
                try {
                    const decryptedPrivateKey = CryptoJS.AES.decrypt(
                        userData.encryptedPrivateKey,
                        password
                    ).toString(CryptoJS.enc.Utf8)

                    if (!decryptedPrivateKey) {
                        throw new Error('Invalid password')
                    }

                    this.user = {
                        ...userData,
                        privateKey: decryptedPrivateKey
                    }
                    this.isAuthenticated = true

                    // Update session storage
                    sessionStorage.setItem('voidCurrentUser', JSON.stringify(this.user))

                    return true
                } catch (error) {
                    throw new Error('Invalid password')
                }
            } catch (error) {
                this.error = error.message
                throw error
            }
        },

        // Restore session from storage
        restoreSession() {
            try {
                // Try session storage first
                const sessionUser = sessionStorage.getItem('voidCurrentUser')
                if (sessionUser) {
                    this.user = JSON.parse(sessionUser)
                    this.isAuthenticated = true
                    return true
                }

                return false
            } catch (error) {
                console.error('Failed to restore session:', error)
                return false
            }
        },

        // Logout
        logout() {
            this.user = null
            this.isAuthenticated = false
            this.error = null

            // Clear session storage
            sessionStorage.removeItem('voidCurrentUser')

            // Clear remember me if user explicitly logs out
            localStorage.removeItem('voidUser')
            localStorage.removeItem('voidRememberMe')
        },

        // Check if remember me is enabled
        hasRememberedCredentials() {
            return localStorage.getItem('voidRememberMe') === 'true' &&
                localStorage.getItem('voidUser') !== null
        },

        // Clear error
        clearError() {
            this.error = null
        },

        // Get decrypted private key
        getPrivateKey(password) {
            if (!this.user?.encryptedPrivateKey) {
                throw new Error('No private key found')
            }

            try {
                const decryptedPrivateKey = CryptoJS.AES.decrypt(
                    this.user.encryptedPrivateKey,
                    password
                ).toString(CryptoJS.enc.Utf8)

                if (!decryptedPrivateKey) {
                    throw new Error('Invalid password')
                }

                return decryptedPrivateKey
            } catch (error) {
                throw new Error('Failed to decrypt private key')
            }
        }
    }
}) 