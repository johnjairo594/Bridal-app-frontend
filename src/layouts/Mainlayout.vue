<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.store'
import SidebarNavigation from '../components/SidebarNavigation.vue'
import Header from '../components/Header.vue'
import {
	Menu,
	MoreVertical,
	LogOut,
	PanelLeftClose,
	LayoutDashboard,
	BriefcaseBusiness,
	FileText,
	Users,
	CalendarDays,
	BadgeDollarSign,
	CircleDashed,
	Package,
} from '@lucide/vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const sidebarCollapsed = ref(false)

const navigationItems = [
	{ label: 'Inicio', to: '/inicio', icon: LayoutDashboard },
	{ label: 'Work Orders', to: '/ordenes-trabajo', icon: BriefcaseBusiness },
	{ label: 'Cotizaciones', to: '/quotes', icon: FileText },
	{ label: 'Clientes', to: '/customers', icon: Users },
	{ label: 'Citas', to: '/appointments', icon: CalendarDays },
	{ label: 'Facturación', to: '/billing', icon: BadgeDollarSign },
	{ label: 'Inventario', to: '/inventory', icon: Package },
]

const activeSection = computed(() => {
	const activeItem = navigationItems.find((item) => item.to === route.path)

	return activeItem?.label ?? 'Inicio'
})

const toggleSidebar = () => {
	sidebarCollapsed.value = !sidebarCollapsed.value
}

const navigateTo = (targetRoute) => {
	if (!targetRoute) {
		return
	}
	router.push(targetRoute)
}

</script>

<template>
	<main
		class="main-page" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
		<aside class="main-sidebar" :class="{ 'is-collapsed': sidebarCollapsed }">
			<SidebarNavigation
				:items="navigationItems"
				:collapsed="sidebarCollapsed"
				:active-path="route.path"
				@navigate="navigateTo"
			/>
		</aside>

		<section class="main-shell">
            <main class="main-content">
                <Header
                    :collapsed="sidebarCollapsed"
                    @toggle-sidebar="sidebarCollapsed = !sidebarCollapsed"
                />
				<router-view />
			</main>
		</section>
	</main>
</template>

<style scoped>
.main-sidebar {
	height: calc(100svh - 24px);
	border-radius: 20px;
	border: 1px solid var(--color-border);
	background: rgba(242, 242, 242, 0.9);
	backdrop-filter: blur(16px);
	box-shadow: var(--color-shadow);
	padding: 18px;
	display: grid;
	gap: 18px;
	overflow: hidden;
	transition: width 220ms ease, padding 220ms ease;
}

.main-sidebar.is-collapsed {
	width: 72px;
	padding-inline: 10px;
}

.main-page.sidebar-collapsed {
	grid-template-columns: 72px minmax(0, 1fr);
}
.main-page {
min-height: 100svh;
display: grid;
grid-template-columns: 292px minmax(0, 1fr);
gap: 12px;
padding: 12px;

transition: grid-template-columns 220ms ease;

}
.main-shell {
    min-width: 0;
}

.main-content {
    min-width: 0;
    display: grid;
    gap: 18px;
}

@media (max-width: 1200px) {
	.main-page {
		grid-template-columns: 1fr;
	}

    .dashboard-sidebar {
		position: relative;
		top: 0;
		height: auto;
	}
}
@media (max-width: 760px) {
	.main-page {
		padding: 12px;
	}
}
</style>