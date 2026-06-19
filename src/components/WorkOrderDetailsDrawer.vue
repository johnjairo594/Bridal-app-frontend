<script setup>
import { computed, ref, watch } from 'vue'
import { getWorkOrderById } from '../services/work-orders.service'
import { toast } from 'vue-sonner'

const props = defineProps({
    open: {
        type: Boolean,
        default: false,
    },
    workOrderId: {
        type: [Number, String],
        default: null,
    },
})

const emit = defineEmits(['close'])

const loading = ref(false)
const workOrder = ref(null)

const formatCurrency = (value) => {
    const amount = Number(value || 0)

    return amount.toLocaleString('es-EC', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })
}

const formatDateTime = (value) => {
    if (!value) {
        return '---'
    }

    const date = new Date(value)

    if (Number.isNaN(date.getTime())) {
        return value
    }

    return new Intl.DateTimeFormat('es-EC', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(date)
}

const normalizeName = (person = {}) => {
    return person?.full_name || person?.name || person?.username || '---'
}

const normalizeProducts = (source = {}) => {
    const products = source?.work_order_products ?? source?.products ?? []

    return Array.isArray(products)
        ? products.map((item) => {
            const product = item.product || {}
            const quantity = Number(item.quantity ?? 0)
            const price = Number(item.price ?? product.price ?? 0)

            return {
                id: item.id ?? product.id,
                name: product.name || 'Producto sin nombre',
                quantity,
                price,
                subtotal: price * quantity,
            }
        })
        : []
}

const normalizeServices = (source = {}) => {
    const services = source?.work_order_services ?? source?.services ?? []

    return Array.isArray(services)
        ? services.map((item) => {
            const service = item.service || {}
            const quantity = Number(item.quantity ?? 0)
            const price = Number(item.price ?? service.price ?? 0)

            return {
                id: item.id ?? service.id,
                name: service.name || 'Servicio sin nombre',
                quantity,
                price,
                subtotal: price * quantity,
            }
        })
        : []
}

const emptyWorkOrder = () => ({
    id: null,
    status: '',
    diagnosis: '',
    repair_notes: '',
    total_price: 0,
    entry_date: '',
    finish_date: '',
    vehicle: null,
    client: null,
    mechanic: null,
    work_order_products: [],
    work_order_services: [],
})

const resetState = () => {
    loading.value = false
    workOrder.value = emptyWorkOrder()
}

resetState()

const loadWorkOrder = async () => {
    if (!props.workOrderId) {
        resetState()
        return
    }

    try {
        loading.value = true

        const response = await getWorkOrderById(props.workOrderId)
        const data = response?.data ?? response

        workOrder.value = {
            ...emptyWorkOrder(),
            ...data,
        }
    } catch (error) {
        toast.error('No se pudo cargar el detalle de la orden de trabajo')
        resetState()
    } finally {
        loading.value = false
    }
}

watch(
    () => [props.open, props.workOrderId],
    ([open]) => {
        if (!open) {
            return
        }

        loadWorkOrder()
    },
    { immediate: true }
)

const vehicle = computed(() => workOrder.value?.vehicle || {})
const client = computed(() => workOrder.value?.client?.person || workOrder.value?.client || {})
const mechanic = computed(() => workOrder.value?.mechanic?.person || workOrder.value?.mechanic || {})
const products = computed(() => normalizeProducts(workOrder.value))
const services = computed(() => normalizeServices(workOrder.value))
</script>

<template>
    <div
        v-if="open"
        class="details-overlay"
        @click="emit('close')"
    />

    <aside
        class="details-drawer"
        :class="{ open }"
    >
        <div class="details-header">
            <div>
                <h2>Detalle de orden de trabajo</h2>
                <p>Información de solo lectura de la orden seleccionada</p>
            </div>

            <button
                type="button"
                class="close-button"
                @click="emit('close')"
            >
                ✕
            </button>
        </div>

        <div class="details-content">
            <section class="details-section">
                <h3>Productos</h3>

                <div
                    v-if="products.length"
                    class="line-items"
                >
                    <div class="line-items-header">
                        <span>Producto</span>
                        <span>Cantidad</span>
                        <span>Precio</span>
                        <span>Subtotal</span>
                    </div>

                    <div
                        v-for="product in products"
                        :key="`product-${product.id}`"
                        class="line-items-row"
                    >
                        <span>{{ product.name }}</span>
                        <span>{{ product.quantity }}</span>
                        <span>$ {{ formatCurrency(product.price) }}</span>
                        <span>$ {{ formatCurrency(product.subtotal) }}</span>
                    </div>
                </div>

                <p v-else class="empty-state">No hay productos asociados.</p>
            </section>

            <section class="details-section">
                <h3>Servicios</h3>

                <div
                    v-if="services.length"
                    class="line-items"
                >
                    <div class="line-items-header">
                        <span>Servicio</span>
                        <span>Cantidad</span>
                        <span>Precio</span>
                        <span>Subtotal</span>
                    </div>

                    <div
                        v-for="service in services"
                        :key="`service-${service.id}`"
                        class="line-items-row"
                    >
                        <span>{{ service.name }}</span>
                        <span>{{ service.quantity }}</span>
                        <span>$ {{ formatCurrency(service.price) }}</span>
                        <span>$ {{ formatCurrency(service.subtotal) }}</span>
                    </div>
                </div>

                <p v-else class="empty-state">No hay servicios asociados.</p>
            </section>

            <section class="details-section total-section">
                <div class="total-row">
                    <span>Total</span>
                    <strong>$ {{ formatCurrency(workOrder.total_price) }}</strong>
                </div>
                
                <div style="display: flex; flex-direction: column; gap: 12px;">
                    <div class="detail-item">
                        <strong class="detail-label">Diagnóstico</strong>
                        <span>{{ workOrder.diagnosis || '---' }}</span>
                    </div>
                    <div class="detail-item">
                        <strong class="detail-label">Notas de reparación</strong>
                        <span>{{ workOrder.repair_notes || '---' }}</span>
                    </div>
                </div>
                <div class="meta-grid">
                    <div class="detail-item">
                        <span class="detail-label">Estado</span>
                        <strong>{{ workOrder.status || '---' }}</strong>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Fecha ingreso</span>
                        <strong>{{ formatDateTime(workOrder.entry_date) }}</strong>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Fecha finalización</span>
                        <strong>{{ formatDateTime(workOrder.finish_date) }}</strong>
                    </div>
                </div>
            </section>

            <section class="details-section">
                <div class="section-header">
                    <h3>Vehículo</h3>
                    <span class="status-pill">#{{ workOrder.id || '---' }}</span>
                </div>

                <div class="details-grid">
                    <div class="detail-item">
                        <span class="detail-label">Placa</span>
                        <strong>{{ vehicle.plate || '---' }}</strong>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Marca</span>
                        <strong>{{ vehicle.brand || '---' }}</strong>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Modelo</span>
                        <strong>{{ vehicle.model || '---' }}</strong>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Año</span>
                        <strong>{{ vehicle.year || '---' }}</strong>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Kilometraje</span>
                        <strong>{{ vehicle.mileage ?? '---' }}</strong>
                    </div>
                </div>
            </section>

            <section class="details-section">
                <h3>Cliente</h3>

                <div class="details-grid">
                    <div class="detail-item">
                        <span class="detail-label">Nombre completo</span>
                        <strong>{{ normalizeName(client) }}</strong>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Identificación</span>
                        <strong>{{ client.identification || '---' }}</strong>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Teléfono</span>
                        <strong>{{ client.phone || '---' }}</strong>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Dirección</span>
                        <strong>{{ client.address || '---' }}</strong>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Fecha nacimiento</span>
                        <strong>{{ client.birth_date || '---' }}</strong>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Mecánico</span>
                        <strong>{{ normalizeName(mechanic) }}</strong>
                    </div>
                </div>
            </section>

            
        </div>
    </aside>
</template>

<style scoped>
.details-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.3);
    z-index: 90;
}

.details-drawer {
    position: fixed;
    top: 0;
    right: 0;
    width: 760px;
    max-width: 100%;
    height: 100vh;
    background: white;
    z-index: 100;
    display: flex;
    flex-direction: column;
    transform: translateX(100%);
    transition: transform 220ms ease;
}

.details-drawer.open {
    transform: translateX(0);
}

.details-header {
    padding: 20px 20px 0 20px;
    border-bottom: 1px solid var(--color-border);
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
}

.details-header h2,
.details-section h3 {
    margin: 0;
}

.details-header p {
    margin: 4px 0 0;
    color: var(--color-ink-soft);
    font-size: 14px;
}

.details-content {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.details-section {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
}

.status-pill {
    display: inline-flex;
    align-items: center;
    border-radius: 999px;
    padding: 6px 12px;
    background: var(--color-azul-claro);
    color: var(--color-azul);
    font-weight: 700;
    font-size: 12px;
}

.details-grid,
.meta-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
}

.detail-item {
    border: 1px solid var(--color-border);
    border-radius: 16px;
    padding: 12px 14px;
    background: rgba(255, 255, 255, 0.88);
    display: grid;
    gap: 4px;
}

.detail-label {
    font-size: 12px;
    color: var(--color-ink-soft);
}

.line-items {
    border: 1px solid var(--color-border);
    border-radius: 16px;
    overflow: hidden;
}

.line-items-header,
.line-items-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 90px 120px 120px;
    gap: 12px;
    padding: 12px 14px;
    align-items: center;
}

.line-items-header {
    background: #f8f9fc;
    font-size: 12px;
    font-weight: 700;
    color: var(--color-ink-soft);
}

.line-items-row {
    border-top: 1px solid var(--color-border);
    font-size: 13px;
}

.line-items-row span:first-child {
    word-break: break-word;
}

.empty-state {
    margin: 0;
    color: var(--color-ink-soft);
    font-size: 14px;
}

.total-section {
    border-top: 1px solid var(--color-border);
    padding-top: 4px;
}

.total-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 16px;
    border-radius: 16px;
    background: linear-gradient(135deg, rgba(219, 234, 254, 0.7), rgba(255, 255, 255, 0.92));
    border: 1px solid var(--color-border);
}

.close-button {
    border: 0;
    background: transparent;
    font-size: 20px;
    cursor: pointer;
}

@media (max-width: 760px) {
    .details-drawer {
        width: 100%;
    }

    .details-grid,
    .meta-grid,
    .line-items-header,
    .line-items-row {
        grid-template-columns: 1fr;
    }
}
</style>