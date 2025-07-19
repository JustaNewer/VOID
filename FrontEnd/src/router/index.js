import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'

// Route components
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Dashboard from '../views/Dashboard.vue'

const routes = [
    {
        path: '/',
        redirect: '/login'
    },
    {
        path: '/login',
        name: 'Login',
        component: Login,
        meta: { requiresGuest: true }
    },
    {
        path: '/register',
        name: 'Register',
        component: Register,
        meta: { requiresGuest: true }
    },
    {
        path: '/dashboard',
        name: 'Dashboard',
        component: Dashboard,
        meta: { requiresAuth: true }
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

// Navigation guards
router.beforeEach((to, from, next) => {
    const authStore = useAuthStore()

    // Try to restore session on first navigation
    if (!authStore.isAuthenticated) {
        authStore.restoreSession()
    }

    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
        // Redirect to login if authentication required but user not logged in
        next('/login')
    } else if (to.meta.requiresGuest && authStore.isAuthenticated) {
        // Redirect to dashboard if guest route but user is logged in
        next('/dashboard')
    } else {
        next()
    }
})

export default router 