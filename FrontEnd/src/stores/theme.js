import { defineStore } from 'pinia'

export const useThemeStore = defineStore('theme', {
    state: () => ({
        isDark: false
    }),

    getters: {
        currentTheme: (state) => state.isDark ? 'dark' : 'light',
        themeClass: (state) => state.isDark ? 'theme-dark' : 'theme-light'
    },

    actions: {
        toggleTheme() {
            this.isDark = !this.isDark
            this.applyTheme()
            this.saveTheme()
        },

        setTheme(isDark) {
            this.isDark = isDark
            this.applyTheme()
            this.saveTheme()
        },

        applyTheme() {
            document.documentElement.classList.remove('theme-light', 'theme-dark')
            document.documentElement.classList.add(this.themeClass)

            // Update meta theme-color for mobile browsers
            const metaThemeColor = document.querySelector('meta[name="theme-color"]')
            if (metaThemeColor) {
                metaThemeColor.setAttribute('content', this.isDark ? '#1a1a1a' : '#ffffff')
            }
        },

        saveTheme() {
            localStorage.setItem('voidTheme', this.isDark ? 'dark' : 'light')
        },

        loadTheme() {
            const savedTheme = localStorage.getItem('voidTheme')
            if (savedTheme) {
                this.isDark = savedTheme === 'dark'
            } else {
                // Use system preference as default
                this.isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
            }
            this.applyTheme()
        },

        initTheme() {
            this.loadTheme()

            // Listen for system theme changes
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                if (!localStorage.getItem('voidTheme')) {
                    this.isDark = e.matches
                    this.applyTheme()
                }
            })
        }
    }
}) 