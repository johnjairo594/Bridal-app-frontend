<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
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
import SidebarNavigation from '../../components/SidebarNavigation.vue'
import DashboardStatCard from '../../components/dashboard/DashboardStatCard.vue'
import Header from '../../components/Header.vue'
import { useAuthStore } from '../../stores/auth.store'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const quickCards = [
	{
		title: 'Work orders del día',
		value: '18',
		description: 'Acceso directo al listado del día',
		route: '/work-orders',
		icon: BriefcaseBusiness,
		tone: 'accent',
	},
	{
		title: 'Cotizaciones pendientes',
		value: '7',
		description: 'Revisar y dar seguimiento',
		route: '/quotes',
		icon: FileText,
		tone: 'warm',
	},
	{
		title: 'Citas próximas',
		value: '12',
		description: 'Agenda del equipo hoy',
		route: '/appointments',
		icon: CalendarDays,
		tone: 'accent',
	},
	{
		title: 'Alertas de inventario',
		value: '4',
		description: 'Productos con stock bajo',
		route: '/inventory',
		icon: CircleDashed,
		tone: 'danger',
	},
]

const navigateTo = (targetRoute) => {
	if (!targetRoute) {
		return
	}

	router.push(targetRoute)
}
</script>

<template>
	<section class="dashboard-hero">
		<div>
			<span class="dashboard-hero__eyebrow">Inicio</span>
			<h1>Bienvenido al panel</h1>
			<p>
				Este espacio queda preparado para que conectes métricas reales, accesos rápidos y los
				endpoints de tu operación.
			</p>
		</div>
	</section>

	<section class="dashboard-grid" aria-label="Accesos rápidos">
		<DashboardStatCard
			v-for="card in quickCards"
			:key="card.title"
			:title="card.title"
			:value="card.value"
			:description="card.description"
			:route="card.route"
			:icon="card.icon"
			:tone="card.tone"
			@open="navigateTo"
		/>
	</section>
</template>

<style scoped>
.dashboard-hero {
	border: 1px solid var(--color-border);
	background:
		radial-gradient(circle at top right, rgba(137, 185, 238, 0.18), transparent 34%),
		linear-gradient(180deg, rgba(255, 255, 255, 0.8), rgba(242, 242, 242, 0.86));
	border-radius: 20px;
	padding: 28px;
	display: flex;
	align-items: flex-end;
	justify-content: space-between;
	gap: 20px;
	box-shadow: var(--color-shadow);
}

.dashboard-hero__eyebrow {
	display: inline-flex;
	align-items: center;
	padding: 8px 12px;
	border-radius: 999px;
	background: rgba(111, 123, 191, 0.12);
	color: var(--color-azul-neutro);
	font-size: 0.8rem;
	font-weight: 700;
	letter-spacing: 0.08em;
	text-transform: uppercase;
}

.dashboard-hero h1 {
	margin: 14px 0 10px;
	font-family: var(--font-heading);
	font-size: clamp(1.8rem, 4vw, 3rem);
	line-height: 1.08;
}

.dashboard-hero p {
	max-width: 58ch;
	margin: 0;
	color: var(--color-ink-soft);
}

.dashboard-grid {
	display: grid;
	grid-template-columns: repeat(4, minmax(0, 1fr));
	gap: 18px;
}

@media (max-width: 1200px) {
	.dashboard-grid {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}
}

@media (max-width: 760px) {
	.dashboard-hero {
		padding: 18px;
	}

	.dashboard-hero {
		flex-direction: column;
		align-items: stretch;
	}

	.dashboard-grid {
		grid-template-columns: 1fr;
	}
}
</style>
