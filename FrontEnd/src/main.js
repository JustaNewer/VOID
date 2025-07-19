import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './style.css'

// Import theme store to initialize theme
import { useThemeStore } from './stores/theme.js'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Initialize theme after Pinia is set up
const themeStore = useThemeStore()
themeStore.initTheme()

app.mount('#app')
