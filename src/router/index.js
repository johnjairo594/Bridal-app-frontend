import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/auth/LoginView.vue'
import DashboardView from '../views/dashboard/DashboardView.vue'
import WorkOrdersView from '../views/work-orders/WorkOrdersView.vue'
import MainLayout from '../layouts/Mainlayout.vue'
import { useAuthStore } from '../stores/auth.store'

const routes = [
    {
        path: '/iniciar-sesion',
        component: LoginView
    },
    {
        path: '/',
        component: MainLayout,
        meta: {
            requiresAuth: true
        },
        children: [
            {
                path: 'inicio',
                component: DashboardView,
            },
            {
                path: 'ordenes-trabajo',
                component: WorkOrdersView,
            }
        ]
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

router.beforeEach((to) => {
    const authStore = useAuthStore()

    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
        return '/iniciar-sesion'
    }

    if (to.path === '/iniciar-sesion' && authStore.isAuthenticated) {
        return '/inicio'
    }

    return true
})

export default router