<script setup>
import { ref, onMounted } from 'vue'
import { getWorkOrders } from '../../services/work-orders.service'
import { getUsers } from '../../services/users.service'
import { Eye, Trash2, PencilLine, Search } from '@lucide/vue'

const formatDateInput = (date) => {
    return date.toLocaleDateString('en-CA')
}

const today = new Date()
const sevenDaysAgo = new Date()

sevenDaysAgo.setDate(today.getDate() - 7)

const loading = ref(false)
const workOrders = ref([])
const pagination = ref({})

const currentPage = ref(1)
const searchTerm = ref('')
const selectedMechanicId = ref('')
const selectedStatus = ref('')
const entryDateFrom = ref(formatDateInput(sevenDaysAgo))
const entryDateTo = ref(formatDateInput(today))

const truncateText = (text, limit = 60) => {
    if (!text) {
        return '---'
    }

    return text.length > limit
        ? `${text.slice(0, limit)}...`
        : text
}

const mechanicOptions = ref([])

const loadMechanics = async () => {
    try {
        const response = await getUsers({ role: 'MECANICO' })
        const users = Array.isArray(response)
            ? response
            : response?.data ?? response?.users ?? []

        mechanicOptions.value = users.map((user) => ({
            value: user.id,
            label: user?.person?.full_name ?? user?.full_name ?? user?.name ?? `Usuario ${user.id}`,
        }))
    } catch (error) {
        console.error(error)
    }
}

const loadWorkOrders = async (page = 1) => {
    try {
        loading.value = true

        const response = await getWorkOrders(page, {
            filter: searchTerm.value,
            entry_date_from: entryDateFrom.value,
            entry_date_to: entryDateTo.value,
            mechanic_id: selectedMechanicId.value,
            status: selectedStatus.value,
        })

        workOrders.value = response.data
        pagination.value = response
        currentPage.value = response.current_page
    } catch (error) {
        console.error(error)
    } finally {
        loading.value = false
    }
}

const applyFilters = () => {
    currentPage.value = 1
    loadWorkOrders(1)
}

const applyFiltersFromChange = () => {
    applyFilters()
}

const changePage = (page) => {
    if (!page || page === currentPage.value) {
        return
    }

    loadWorkOrders(page)
}

onMounted(() => {
    loadMechanics()
    loadWorkOrders()
})

</script>

<template>
    <div class="full-page-content">
        <div class="table-container">
            <div class="table-header">
                <div class="table-header-top">
                    <div>
                        <h2 class="table-title">
                            Órdenes de trabajo
                        </h2>

                        <p class="table-subtitle">
                            Gestión y seguimiento de órdenes de trabajo
                        </p>
                    </div>

                    <button
                        type="button"
                        class="primary-button"
                    >
                        Nuevo
                    </button>
                </div>

                <div class="table-filters">
                    <div class="filters-left">
                        <div class="filter-field">
                            <label class="filter-label" for="mechanic-select">
                                Mecánico
                            </label>
                            <select
                                id="mechanic-select"
                                v-model="selectedMechanicId"
                                class="table-select"
                                @change="applyFiltersFromChange"
                            >
                                <option value="">Todos los mecánicos</option>
                                <option
                                    v-for="mechanic in mechanicOptions"
                                    :key="mechanic.value"
                                    :value="mechanic.value"
                                >
                                    {{ mechanic.label }}
                                </option>
                            </select>
                        </div>

                        <div class="filter-field">
                            <label class="filter-label" for="status-select">
                                Estado
                            </label>
                            <select
                                id="status-select"
                                v-model="selectedStatus"
                                class="table-select"
                                @change="applyFiltersFromChange"
                            >
                                <option value="">Todos los estados</option>
                                <option value="EN PROCESO">
                                    En proceso
                                </option>
                                <option value="FINALIZADO">
                                    Finalizado
                                </option>
                            </select>
                        </div>

                        <div class="filter-field">
                            <label class="filter-label" for="entry-date-from">
                                Fecha inicio
                            </label>
                            <input
                                id="entry-date-from"
                                type="date"
                                class="table-input"
                                v-model="entryDateFrom"
                                @change="applyFiltersFromChange"
                            >
                        </div>

                        <div class="filter-field">
                            <label class="filter-label" for="entry-date-to">
                                Fecha fin
                            </label>
                            <input
                                id="entry-date-to"
                                type="date"
                                class="table-input"
                                v-model="entryDateTo"
                                @change="applyFiltersFromChange"
                            >
                        </div>
                    </div>

                    <div class="filters-right">
                        <input
                            type="text"
                            class="table-search"
                            placeholder="Buscar..."
                            v-model="searchTerm"
                        >
                        <button
                            type="button"
                            class="options-button"
                            @click="applyFilters"
                        >
                            <Search />
                        </button>
                    </div>
                </div>
            </div>

            <div class="table-wrapper">
                <table class="custom-table">
                    <thead>
                        <tr>
                            <th class="sticky-column sticky-id">
                                ID
                            </th>

                            <th class="sticky-column sticky-client">
                                Cliente
                            </th>

                            <th class="sticky-column sticky-vehicle">
                                Vehículo
                            </th>

                            <th>Placa</th>
                            <th>Mecánico</th>
                            <th>Estado</th>
                            <th>Total</th>
                            <th>Fecha ingreso</th>
                            <th>Fecha Finalización</th>

                            <th class="sticky-column sticky-actions">
                                Opciones
                            </th>
                        </tr>
                    </thead>

                    <tbody v-if="!loading">
                        <tr
                            v-for="workOrder in workOrders"
                            :key="workOrder.id"
                        >
                            <td class="sticky-column sticky-id">
                                {{ workOrder.id }}
                            </td>

                            <td
                                class="sticky-column sticky-client multiline-cell"
                                :title="workOrder.client?.person?.full_name"
                            >
                                {{
                                    truncateText(
                                        workOrder.client?.person?.full_name
                                    )
                                }}
                            </td>

                            <td
                                class="sticky-column sticky-vehicle multiline-cell"
                                :title="`${workOrder.vehicle?.brand} ${workOrder.vehicle?.model}`"
                            >
                                {{
                                    truncateText(
                                        `${workOrder.vehicle?.brand} ${workOrder.vehicle?.model}`
                                    )
                                }}
                            </td>

                            <td>
                                {{ workOrder.vehicle?.plate }}
                            </td>

                            <td>
                                {{ workOrder.mechanic?.person?.full_name }}
                            </td>

                            <td>
                                {{ workOrder.status }}
                            </td>

                            <td>
                                ${{ workOrder.total_price }}
                            </td>

                            <td>
                                {{ workOrder.entry_date }}
                            </td>
                            <td>
                                {{ workOrder.finish_date || '---' }}
                            </td>
                            <td class="sticky-column sticky-actions">
                                <div class="actions-wrapper">
                                    <button
                                        type="button"
                                        class="options-button"
                                    >
                                        <Eye color="blue"/>
                                    </button>
                                    <button
                                        type="button"
                                        class="options-button"
                                    >
                                        <PencilLine color="green" />
                                    </button>
                                    <button
                                        type="button"
                                        class="options-button"
                                    >
                                        <Trash2 color="red"/>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>

                    <tbody v-else>
                        <tr>
                            <td colspan="10">
                                Cargando...
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="pagination">
                <div>
                    Mostrando: {{ pagination.from }} a {{ pagination.to }} de {{ pagination.total }}
                </div>
                <div class="pagination-buttons">
                    <button
                        v-for="link in pagination.links"
                        :key="link.label"
                        type="button"
                        class="pagination-button"
                        :class="{ active: link.active }"
                        :disabled="!link.page"
                        @click="changePage(link.page)"
                        v-html="link.label"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>

.custom-table {
    width: 100%;
    min-width: max-content;
    border-collapse: separate;
    border-spacing: 0;
    background: white;
}

.custom-table thead th {
    top: 0;
    background: #f8f9fc;
}

.custom-table tr {
    text-align: left;
    padding: 14px;
    font-size: 14px;
}

.custom-table th,
.custom-table td {
    padding: 12px;
    text-align: left;
    font-size: 14px;
    white-space: nowrap;
    background: white;

    border-right: 1px solid #d3d6e4;
    border-bottom: 1px solid #d3d6e4;
}

.custom-table th {
    font-size: 12px;
    font-weight: 700;
}

.custom-table tbody tr:hover td {
    background: #fafafa;
}

.multiline-cell {
    white-space: normal !important;
    word-break: break-word;
    line-height: 1.4;
}

.sticky-column {
    position: sticky;
    background: white;
    z-index: 5;
}

thead .sticky-column {
    z-index: 20;
}

.sticky-id {
    left: 0;
    min-width: 40px;
    max-width: 40px;
    z-index: 15;
    border-right: 1px solid #d3d6e4;
}

.sticky-client {
    left: 40px;
    min-width: 200px;
    max-width: 200px;
    z-index: 15;
    border-right: 1px solid #d3d6e4;
}

.sticky-vehicle {
    left: 240px;
    min-width: 200px;
    max-width: 200px;
    z-index: 15;
}

.sticky-actions {
    display: flex;
    gap: 8px;
    justify-content: center;

    right: -1px;
    min-width: 160px;
    max-width: 100%;
    text-align: center;
    z-index: 15;
    border-left: 1px solid #d3d6e4;
}

.actions-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    gap: 4px;
}

.options-button {
    border: 1px solid var(--color-border);
    background: white;
    border-radius: 10px;
    padding: 6px;
    cursor: pointer;
    transition: 160ms ease;

    display: flex;
    align-items: center;
    justify-content: center;
}

.options-button:hover {
    background: #f5f6fb;
}

.pagination {
    display: flex;
    gap: 8px;
    margin-top: 20px;
    flex-wrap: wrap;
    justify-content: space-between;
}

.pagination-buttons {
    display: flex;
    gap: 8px;
}

.pagination-button {
    border: 1px solid var(--color-border);
    background: white;
    min-width: 40px;
    height: 40px;
    border-radius: 10px;
    cursor: pointer;
    padding-inline: 12px;
}

.filter-field {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.filter-label {
    font-size: 12px;
    font-weight: 700;
    color: var(--color-ink-soft);
}

.pagination-button.active {
    background: var(--color-azul-neutro);
    color: white;
}

.table-header {
    display: grid;
    gap: 18px;
    margin-bottom: 18px;
}

.table-header-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
}

.table-title {
    font-size: 28px;
    font-weight: 700;
    color: var(--color-ink);
    margin: 0;
}

.table-subtitle {
    margin: 4px 0 0;
    color: var(--color-ink-soft);
    font-size: 14px;
}

.primary-button {
    border: 0;
    background: var(--color-azul-neutro);
    color: white;
    border-radius: 12px;
    height: 44px;
    padding-inline: 20px;
    font-weight: 600;
    cursor: pointer;

    transition:
        transform 160ms ease,
        opacity 160ms ease;
}

.primary-button:hover {
    transform: translateY(-1px);
    opacity: 0.92;
}

.table-filters {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
}

.filters-left,
.filters-right {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
}

.table-select,
.table-input,
.table-search {
    height: 42px;
    border: 1px solid var(--color-border);
    border-radius: 12px;
    background: white;
    padding-inline: 14px;
    font-size: 14px;
    outline: none;
}

.table-search {
    min-width: 260px;
}

.table-select:focus,
.table-input:focus,
.table-search:focus {
    border-color: var(--color-azul-neutro);
}
</style>
