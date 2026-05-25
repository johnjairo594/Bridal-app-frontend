<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
  value: {
    type: [String, Number],
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  route: {
    type: String,
    default: '',
  },
  icon: {
    type: [Object, Function],
    default: null,
  },
  tone: {
    type: String,
    default: 'default',
  },
})

defineEmits(['open'])
</script>

<template>
  <button type="button" class="dashboard-stat-card" :class="`tone-${tone}`" @click="$emit('open', route)">
    <div class="dashboard-stat-card__icon" aria-hidden="true">
      <component :is="icon" v-if="icon" />
    </div>
    <div class="dashboard-stat-card__body">
      <span class="dashboard-stat-card__title">{{ title }}</span>
      <strong class="dashboard-stat-card__value">{{ value }}</strong>
      <span v-if="description" class="dashboard-stat-card__description">{{ description }}</span>
    </div>
  </button>
</template>

<style scoped>
.dashboard-stat-card {
  appearance: none;
  border: 1px solid var(--color-border);
  background: rgba(255, 255, 255, 0.78);
  border-radius: 24px;
  padding: 22px;
  display: grid;
  gap: 18px;
  align-content: start;
  text-align: left;
  box-shadow: 0 18px 36px rgba(30, 36, 54, 0.08);
  transition:
    transform 180ms ease,
    box-shadow 180ms ease,
    border-color 180ms ease;
}

.dashboard-stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 22px 44px rgba(30, 36, 54, 0.12);
  border-color: rgba(111, 123, 191, 0.32);
}

.dashboard-stat-card__icon {
  width: 52px;
  height: 52px;
  border-radius: 18px;
  display: inline-grid;
  place-items: center;
  color: var(--color-azul-neutro);
  background: rgba(111, 123, 191, 0.1);
}

.dashboard-stat-card__icon :deep(svg) {
  width: 24px;
  height: 24px;
}

.dashboard-stat-card__body {
  display: grid;
  gap: 6px;
}

.dashboard-stat-card__title {
  font-size: 0.92rem;
  color: var(--color-ink-soft);
}

.dashboard-stat-card__value {
  font-size: clamp(1.8rem, 4vw, 2.6rem);
  line-height: 1;
  color: var(--color-ink);
}

.dashboard-stat-card__description {
  font-size: 0.92rem;
  color: var(--color-ink-soft);
}

.tone-accent .dashboard-stat-card__icon {
  color: var(--color-celeste);
  background: rgba(137, 185, 238, 0.14);
}

.tone-warm .dashboard-stat-card__icon {
  color: var(--color-amarillo);
  background: rgba(217, 181, 4, 0.14);
}

.tone-danger .dashboard-stat-card__icon {
  color: var(--color-rojo);
  background: rgba(191, 54, 4, 0.12);
}
</style>