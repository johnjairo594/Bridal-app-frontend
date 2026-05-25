<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getWorkOrders } from '../../services/work-orders.service'

const loading = ref(false)
const workOrders = ref([])
const pagination = ref({})

const currentPage = ref(1)

const loadWorkOrders = async (page = 1) => {
    try {
        loading.value = true

        const response = await getWorkOrders(page)

        workOrders.value = response.data
        pagination.value = response
        currentPage.value = response.current_page
    } catch (error) {
        console.error(error)
    } finally {
        loading.value = false
    }
}

const changePage = (page) => {
    if (!page || page === currentPage.value) {
        return
    }

    loadWorkOrders(page)
}


onMounted(() => {
    loadWorkOrders()
})

</script>

<template>
    <div class="full-page-content">
        <div class="table-container">
            <table class="custom-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Cliente</th>
                        <th>Vehículo</th>
                        <th>Placa</th>
                        <th>Estado</th>
                        <th>Total</th>
                        <th>Fecha ingreso</th>
                        <th>Opciones</th>
                    </tr>
                </thead>

                <tbody v-if="!loading">
                    <tr
                        v-for="workOrder in workOrders"
                        :key="workOrder.id"
                    >
                        <td>{{ workOrder.id }}</td>

                        <td>
                            {{ workOrder.client?.person?.full_name }}
                        </td>

                        <td>
                            {{ workOrder.vehicle?.brand }}
                            {{ workOrder.vehicle?.model }}
                        </td>

                        <td>
                            {{ workOrder.vehicle?.plate }}
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
                            <button
                                type="button"
                                class="options-button"
                                @click="$emit('open', `/ordenes-trabajo/${workOrder.id}`)"
                            >
                                Ver detalles
                            </button>
                        </td>
                    </tr>
                </tbody>

                <tbody v-else>
                    <tr>
                        <td colspan="7">
                            Cargando...
                        </td>
                    </tr>
                </tbody>
            </table>
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
    border-collapse: collapse;
}

.custom-table tr {
    text-align: left;
    padding: 14px;
    font-size: 14px;
    border: 1px solid #d3d6e4;
}

.custom-table th {
    text-align: center;
    padding: 8px;
    font-size: 12px;
    border: 1px solid #d3d6e4;
}

.custom-table td {
    padding: 8px;
    border: 1px solid #d3d6e4;
}

.custom-table tbody tr:hover {
    background: #fafafa;
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

.pagination-button.active {
    background: var(--color-azul-neutro);
    color: white;
}
</style>
