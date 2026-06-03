<script setup>
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
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.store'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const userName = computed(() => {
	const user = authStore.user ?? {}

	return (
		user?.person?.full_name ||
		user?.full_name ||
		user?.name ||
		user?.username ||
		'Usuario autenticado'
	)
})

const props = defineProps({
    collapsed: {
        type: Boolean,
        default: false,
    },
});

const optionsOpen = ref(false)

const logout = () => {
	authStore.logout()
	optionsOpen.value = false
	router.push('/iniciar-sesion')
}

const emit = defineEmits(['toggle-sidebar'])

const toggleSidebar = () => {
	emit('toggle-sidebar')
}

const toggleOptions = () => {
	optionsOpen.value = !optionsOpen.value
}

const navigateTo = (targetRoute) => {
	if (!targetRoute) {
		return
	}

	optionsOpen.value = false
	router.push(targetRoute)
}
</script>

<template>
    <header class="topbar">
        <div class="topbar-left">
            <button class="topbar-toggle" type="button" @click="toggleSidebar">
                <Menu />
            </button>

            <div class="topbar-brand">
                <span class="topbar-brand__title">TECNICENTRO BRIDAL 🔧</span>
            </div>
        </div>

        <div class="topbar-right">
            <div class="topbar-context">
				<strong class="topbar-context__value">{{ userName }}</strong>
            </div>

            <div class="options-menu-wrapper">
                <button
                    class="options-button"
                    type="button"
                    :aria-expanded="optionsOpen"
                    aria-label="Opciones de usuario"
                    @click="toggleOptions"
                >
                    <MoreVertical />
                </button>

                <div v-if="optionsOpen" class="options-menu" role="menu">
                    <button class="options-menu__item is-danger" type="button" @click="logout">
                        <LogOut />
                        <span>Cerrar sesión</span>
                    </button>
                </div>
            </div>
        </div>
    </header>
</template>

<style scoped>
.topbar {
	border: 1px solid var(--color-border);
	background: rgba(242, 242, 242, 0.88);
	backdrop-filter: blur(16px);
	border-radius: 20px;
	padding: 10px 12px;
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 18px;
	box-shadow: var(--color-shadow);
}

.topbar-toggle {
	appearance: none;
	border: 1px solid var(--color-border);
	background: rgba(255, 255, 255, 0.84);
	color: var(--color-ink);
	border-radius: 16px;
	width: 48px;
	height: 48px;
	display: inline-grid;
	place-items: center;
	transition:
		transform 160ms ease,
		border-color 160ms ease,
		box-shadow 160ms ease;
}

.topbar-toggle:hover {
	transform: translateY(-1px);
	border-color: rgba(111, 123, 191, 0.34);
	box-shadow: 0 8px 18px rgba(30, 36, 54, 0.08);
}

.topbar-toggle :deep(svg) {
	width: 20px;
	height: 20px;
}

.topbar-left,
.topbar-right {
	display: flex;
	align-items: center;
	gap: 14px;
}

.topbar-brand {
	display: inline-flex;
	align-items: center;
	gap: 12px;
	min-width: 0;
}

.topbar-brand__title {
	font-family: var(--font-heading);
	color: var(--color-ink);
	font-weight: 800;
	font-size: 1.25rem;
	letter-spacing: 0.04em;
}

.topbar-context {
	display: grid;
	gap: 2px;
	text-align: right;
}

.topbar-context__value {
	color: var(--color-ink);
	font-size: 0.95rem;
}

.options-menu-wrapper {
	position: relative;
}

.options-button {
	appearance: none;
	border: 1px solid var(--color-border);
	background: rgba(255, 255, 255, 0.84);
	color: var(--color-ink);
	border-radius: 16px;
	width: 48px;
	height: 48px;
	display: inline-grid;
	place-items: center;
	transition:
		transform 160ms ease,
		border-color 160ms ease,
		box-shadow 160ms ease;
}
.options-button:hover {
	transform: translateY(-1px);
	border-color: rgba(111, 123, 191, 0.34);
	box-shadow: 0 8px 18px rgba(30, 36, 54, 0.08);
}
.options-button :deep(svg) {
	width: 20px;
	height: 20px;
}
.options-menu {
	position: absolute;
	top: calc(100% + 10px);
	right: 0;
	min-width: 220px;
	border: 1px solid var(--color-border);
	border-radius: 20px;
	background: rgba(255, 255, 255, 0.96);
	box-shadow: 0 24px 42px rgba(30, 36, 54, 0.14);
	padding: 10px;
	z-index: 20;
}
.options-menu__item {
	width: 100%;
	border: 0;
	border-radius: 14px;
	background: transparent;
	color: var(--color-ink);
	padding: 12px 14px;
	display: inline-flex;
	align-items: center;
	gap: 10px;
	text-align: left;
}
.options-menu__item:hover {
	background: rgba(111, 123, 191, 0.08);
}
.options-menu__item.is-danger {
	color: var(--color-rojo);
}

@media (max-width: 760px) {
	.topbar {
		padding: 18px;
	}

	.topbar {
		flex-direction: column;
		align-items: stretch;
	}

	.topbar-left,
	.topbar-right {
		justify-content: space-between;
	}
}
</style>