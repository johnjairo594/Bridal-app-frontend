<script setup>
defineProps({
  items: {
    type: Array,
    default: () => [],
  },
  collapsed: {
    type: Boolean,
    default: false,
  },
  activePath: {
    type: String,
    default: '',
  },
})

defineEmits(['navigate'])
</script>

<template>
  <div class="sidebar-navigation" :class="{ 'is-collapsed': collapsed }">
    <button
      v-for="item in items"
      :key="item.label"
      type="button"
      class="sidebar-link"
      :class="{ 'is-active': activePath === item.to }"
      @click="$emit('navigate', item.to)"
    >
      <span class="sidebar-link-icon" aria-hidden="true">
        <component :is="item.icon" size="5"/>
      </span>
      <span class="sidebar-link-label">{{ item.label }}</span>
    </button>
  </div>
</template>

<style scoped>
/* .sidebar-navigation {
	display: grid;
	gap: 8px;
} */

.sidebar-header {
	display: grid;
	gap: 14px;
}

.sidebar-collapse-button {
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

.sidebar-collapse-button:hover {
	transform: translateY(-1px);
	border-color: rgba(111, 123, 191, 0.34);
	box-shadow: 0 8px 18px rgba(30, 36, 54, 0.08);
}

.sidebar-collapse-button :deep(svg) {
	width: 20px;
	height: 20px;
}

.sidebar-brand {
	border: 1px solid var(--color-border);
	border-radius: 20px;
	background: rgba(255, 255, 255, 0.78);
	padding: 18px;
	display: grid;
	gap: 8px;
}

.sidebar-brand.is-collapsed {
	justify-items: center;
}

.sidebar-brand__mark {
	font-weight: 800;
	letter-spacing: 0.16em;
	font-size: 0.8rem;
	text-transform: uppercase;
	color: var(--color-azul-neutro);
}

.sidebar-brand__text {
	color: var(--color-ink);
	font-weight: 700;
}

.sidebar-brand.is-collapsed .sidebar-brand__text {
	display: none;
}

.sidebar-link {
	appearance: none;
	border: 0;
	border-radius: 12px;
	padding: 8px 10px;
  	margin-bottom: 8px;
	display: flex;
	align-items: center;
	gap: 12px;
	background: transparent;
	color: var(--color-ink-soft);
	text-align: left;
	width: 100%;
	min-height: 40px;
	cursor: pointer;

	transition:
		background-color 160ms ease,
		color 160ms ease,
		transform 160ms ease;
}

.sidebar-link:hover {
	background: rgba(111, 123, 191, 0.08);
	color: var(--color-ink);
	transform: translateX(2px);
}

.sidebar-link.is-active {
	background: linear-gradient(
		135deg,
		rgba(111, 123, 191, 0.16),
		rgba(137, 185, 238, 0.18)
	);

	color: var(--color-ink);
}

.sidebar-link-icon {
	width: 24px;
	height: 24px;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
}

.sidebar-link-icon :deep(svg) {
	width: 20px;
	height: 20px;
}

.sidebar-link-label {
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	font-size: 16px;
}

/* COLLAPSED */

.is-collapsed .sidebar-link {
	justify-content: center;
	padding: 4px 0;
	gap: 0;
}

.is-collapsed .sidebar-link:hover {
	transform: none;
}

.is-collapsed .sidebar-link-label {
	display: none;
}

@media (max-width: 760px) {
	.sidebar-collapse-button {
		display: none;
	}
}
</style>