<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import Multiselect from 'vue-multiselect'
import { getProducts } from '../services/products.service'
import { getServices } from '../services/services.service'
import { getVehicleByPlate } from '../services/vehicles.service'
import { createWorkOrder, getWorkOrderById, updateWorkOrder } from '../services/work-orders.service'
import { Trash2, RotateCcw, Search } from '@lucide/vue'
import { toast } from 'vue-sonner'

const props = defineProps({
    open: {
        type: Boolean,
        default: false,
    },
    mode: {
        type: String,
        default: 'create',
    },
    workOrderId: {
        type: [Number, String],
        default: null,
    },
})

const emit = defineEmits(['close', 'saved'])

const isEditMode = computed(() => props.mode === 'edit')

const loadingVehicle = ref(false)
const loadingWorkOrder = ref(false)
const searchAttempted = ref(false)
const vehicleFound = ref(false)
const plateMessage = ref('')

const clientForm = ref({
    identification: '',
    full_name: '',
    phone: '',
    address: '',
    birth_date: '',
})

const selectedVehicle = ref(null)

const vehicleForm = ref({
    brand: '',
    model: '',
    year: '',
    plate: '',
    mileage: '',
})

const workOrderForm = ref({
    diagnosis: '',
    repair_notes: '',
    status: 'PROCESO',
})

const availableProducts = ref([])
const selectedProducts = ref([])

const availableServices = ref([])
const selectedServices = ref([])

const clientFieldsDisabled = computed(() => isEditMode.value || !searchAttempted.value || vehicleFound.value)
const vehicleFieldsDisabled = computed(() => isEditMode.value || !searchAttempted.value || vehicleFound.value)
const plateDisabled = computed(() => isEditMode.value || vehicleFound.value)

const emptyClientForm = () => ({
    identification: '',
    full_name: '',
    phone: '',
    address: '',
    birth_date: '',
})

const emptyVehicleForm = () => ({
    brand: '',
    model: '',
    year: '',
    plate: '',
    mileage: '',
})

const emptyWorkOrderForm = () => ({
    diagnosis: '',
    repair_notes: '',
    status: 'PROCESO',
})

const normalizeStatus = (status) => {
    const normalized = String(status || '').trim().toUpperCase()

    return normalized === 'FINALIZADO' ? 'FINALIZADO' : 'PROCESO'
}

const resetForm = () => {
    loadingVehicle.value = false
    loadingWorkOrder.value = false
    searchAttempted.value = false
    vehicleFound.value = false
    plateMessage.value = ''
    selectedVehicle.value = null
    clientForm.value = emptyClientForm()
    vehicleForm.value = emptyVehicleForm()
    workOrderForm.value = emptyWorkOrderForm()
    selectedProducts.value = []
    selectedServices.value = []
}

const loadProducts = async () => {
    try {
        const response = await getProducts()

        availableProducts.value = response.data
    } catch (error) {
        console.error(error)
    }
}

const loadServices = async () => {
    try {
        const response = await getServices()

        availableServices.value = response.data
    } catch (error) {
        console.error(error)
    }
}

const getSelectableProducts = (currentProduct = null) => {
    const selectedIds = selectedProducts.value
        .map(item => item.product?.id)
        .filter(Boolean)

    return availableProducts.value.filter(product =>
        product.id === currentProduct?.id ||
        !selectedIds.includes(product.id)
    )
}

const getSelectableServices = (currentService = null) => {
    const selectedIds = selectedServices.value
        .map((item) => item.service?.id)
        .filter(Boolean)

    return availableServices.value.filter(
        (service) => service.id === currentService?.id || !selectedIds.includes(service.id)
    )
}

const onProductChange = (productRow) => {
    if (!productRow.product) {
        productRow.price = 0
        return
    }

    productRow.price = Number(productRow.product.price)
}

const onServiceChange = (serviceRow) => {
    if (!serviceRow.service) {
        serviceRow.price = 0
        return
    }

    serviceRow.price = Number(serviceRow.service.price)
}

const addProduct = () => {
    selectedProducts.value.push({
        product: null,
        quantity: 1,
        price: 0,
    })
}

const addService = () => {
    selectedServices.value.push({
        service: null,
        quantity: 1,
        price: 0,
    })
}

const removeProduct = (index) => {
    selectedProducts.value.splice(index, 1)
}

const removeService = (index) => {
    selectedServices.value.splice(index, 1)
}

const fillFormsFromVehicle = (vehicle) => {
    const client = vehicle?.client || {}
    const person = client?.person || client || {}

    clientForm.value = {
        identification: person.identification || '',
        full_name: person.full_name || '',
        phone: person.phone || '',
        address: person.address || '',
        birth_date: person.birth_date || '',
    }

    vehicleForm.value = {
        brand: vehicle?.brand || '',
        model: vehicle?.model || '',
        year: vehicle?.year || '',
        plate: vehicle?.plate || '',
        mileage: vehicle?.mileage ?? '',
    }
}

const mapProductRow = (item) => ({
    product: item.product || availableProducts.value.find((product) => product.id === item.product_id) || null,
    quantity: item.quantity ?? 1,
    price: Number(item.price ?? item.product?.price ?? 0),
})

const mapServiceRow = (item) => ({
    service: item.service || availableServices.value.find((service) => service.id === item.service_id) || null,
    quantity: item.quantity ?? 1,
    price: Number(item.price ?? item.service?.price ?? 0),
})

const getWorkOrderProducts = (workOrder) => {
    const products = workOrder?.work_order_products ?? workOrder?.products ?? []

    return Array.isArray(products) ? products : []
}

const getWorkOrderServices = (workOrder) => {
    const services = workOrder?.work_order_services ?? workOrder?.services ?? []

    return Array.isArray(services) ? services : []
}

const fillFromWorkOrder = async (workOrderId) => {
    try {
        loadingWorkOrder.value = true

        const response = await getWorkOrderById(workOrderId)
        const workOrder = response?.data ?? response

        const vehicle = workOrder?.vehicle || {}

        fillFormsFromVehicle(vehicle)
        selectedVehicle.value = vehicle?.id ? vehicle : null
        searchAttempted.value = true
        vehicleFound.value = true
        plateMessage.value = ''

        workOrderForm.value = {
            diagnosis: workOrder?.diagnosis || '',
            repair_notes: workOrder?.repair_notes || '',
            status: normalizeStatus(workOrder?.status),
        }

        selectedProducts.value = getWorkOrderProducts(workOrder).map(mapProductRow)

        selectedServices.value = getWorkOrderServices(workOrder).map(mapServiceRow)
    } catch (error) {
        toast.error('No se pudo cargar la orden de trabajo')
        resetForm()
    } finally {
        loadingWorkOrder.value = false
    }
}

watch(
    () => [props.open, props.mode, props.workOrderId],
    ([open]) => {
        if (!open) {
            return
        }

        if (isEditMode.value && props.workOrderId) {
            fillFromWorkOrder(props.workOrderId)
            return
        }

        resetForm()
    },
    { immediate: true }
)

onMounted(async () => {
    await loadProducts()
    await loadServices()

    if (isEditMode.value && props.open && props.workOrderId) {
        await fillFromWorkOrder(props.workOrderId)
    }
})

const resetPlateSearch = () => {
    resetForm()
}

const searchVehicleByPlate = async () => {
    const plate = vehicleForm.value.plate?.trim().toUpperCase()

    if (!plate) {
        toast.error('Debe ingresar una placa')
        return
    }

    try {
        loadingVehicle.value = true

        const response = await getVehicleByPlate(plate)
        const vehicle = response.data?.vehicle || response.data?.data || response.data

        if (!vehicle) {
            throw Object.assign(new Error('Vehículo no encontrado'), {
                response: { status: 404 },
            })
        }

        selectedVehicle.value = vehicle
        vehicleFound.value = true
        searchAttempted.value = true
        plateMessage.value = ''

        fillFormsFromVehicle(vehicle)
    } catch (error) {
        const status = error?.response?.status ?? error?.status

        if (status === 404) {
            selectedVehicle.value = null
            vehicleFound.value = false
            searchAttempted.value = true
            plateMessage.value = 'Vehículo no encontrado. Complete los datos del cliente y del vehículo.'

            clientForm.value = emptyClientForm()
            vehicleForm.value = emptyVehicleForm()
            vehicleForm.value.plate = plate
            return
        }

        toast.error('Ocurrió un error al consultar la placa')
    } finally {
        loadingVehicle.value = false
    }
}

const validateForm = () => {
    if (!workOrderForm.value.diagnosis?.trim()) {
        toast.error('Debe ingresar un diagnóstico')
        return false
    }

    if (!workOrderForm.value.status) {
        toast.error('Debe seleccionar un estado')
        return false
    }

    if (isEditMode.value) {
        return true
    }

    if (!clientForm.value.identification?.match(/^(\d{10}|\d{13})$/)) {
        toast.error('La identificación debe tener 10 o 13 dígitos')
        return false
    }

    if (!clientForm.value.full_name?.trim()) {
        toast.error('Debe ingresar el nombre completo')
        return false
    }

    if (clientForm.value.full_name.length > 50) {
        toast.error('El nombre no puede superar los 50 caracteres')
        return false
    }

    if (!clientForm.value.phone?.match(/^(\d{6}|\d{7}|\d{10})$/)) {
        toast.error('Número telefónico inválido')
        return false
    }

    if (!selectedVehicle.value) {
        if (!vehicleForm.value.plate?.trim() || vehicleForm.value.plate.length !== 7) {
            toast.error('La placa debe tener 7 caracteres')
            return false
        }

        if (!vehicleForm.value.brand?.trim()) {
            toast.error('Debe ingresar la marca')
            return false
        }

        if (!vehicleForm.value.model?.trim()) {
            toast.error('Debe ingresar el modelo')
            return false
        }

        const currentYear = new Date().getFullYear()

        if (
            vehicleForm.value.year < 1900 ||
            vehicleForm.value.year > currentYear + 1
        ) {
            toast.error('Año inválido')
            return false
        }

        if (vehicleForm.value.mileage < 0) {
            toast.error('El kilometraje no puede ser negativo')
            return false
        }
    }

    for (const product of selectedProducts.value) {
        if (!product.product?.id) {
            toast.error('Seleccione un producto')
            return false
        }

        if (product.quantity <= 0) {
            toast.error('La cantidad del producto debe ser mayor a 0')
            return false
        }
    }

    for (const service of selectedServices.value) {
        if (!service.service?.id) {
            toast.error('Seleccione un servicio')
            return false
        }

        if (service.quantity <= 0) {
            toast.error('La cantidad del servicio debe ser mayor a 0')
            return false
        }
    }

    return true
}

const saveWorkOrder = async () => {
    if (!validateForm()) {
        return
    }

    if (normalizeStatus(workOrderForm.value.status) === 'FINALIZADO') {
        const confirmed = window.confirm('Si está seguro de finalizar la orden de trabajo, una vez finalizada no se podrán efectuar cambios')

        if (!confirmed) {
            return
        }
    }

    const payload = {
        client: {
            person: {
                full_name: clientForm.value.full_name,
                identification: clientForm.value.identification,
                phone: clientForm.value.phone,
                address: clientForm.value.address,
                birth_date: clientForm.value.birth_date,
            },
        },

        vehicle_id: selectedVehicle.value?.id || null,

        vehicle: selectedVehicle.value?.id
            ? null
            : {
                brand: vehicleForm.value.brand,
                model: vehicleForm.value.model,
                year: vehicleForm.value.year,
                plate: vehicleForm.value.plate,
                mileage: vehicleForm.value.mileage,
            },

        diagnosis: workOrderForm.value.diagnosis,
        repair_notes: workOrderForm.value.repair_notes,
        status: normalizeStatus(workOrderForm.value.status),

        products: selectedProducts.value.map(product => ({
            product_id: product.product.id,
            quantity: product.quantity,
        })),

        services: selectedServices.value.map(service => ({
            service_id: service.service.id,
            quantity: service.quantity,
        })),
    }

    try {
        if (isEditMode.value) {
            await updateWorkOrder(props.workOrderId, payload)
            toast.success('Orden de trabajo actualizada correctamente')
        } else {
            await createWorkOrder(payload)
            toast.success('Orden de trabajo creada correctamente')
        }

        resetForm()
        emit('saved')
        emit('close')
    } catch (error) {
        if (error?.response?.status === 409 && error?.response?.data?.message) {
            toast.error(error.response.data.message)
            return
        }
        toast.error('Ocurrió un error al guardar')
    }
}
</script>

<template>
    <div
        v-if="open"
        class="drawer-overlay"
        @click="emit('close')"
    />

    <aside
        class="drawer"
        :class="{ open }"
    >
        <div class="drawer-header">
            <div>
                <h2>{{ isEditMode ? 'Editar orden de trabajo' : 'Nueva orden de trabajo' }}</h2>
                <p>{{ isEditMode ? 'Actualización de diagnóstico, notas, productos y servicios' : 'Registro de cliente, vehículo y servicios' }}</p>
            </div>

            <button
                type="button"
                class="close-button"
                @click="emit('close')"
            >
                ✕
            </button>
        </div>

        <div class="drawer-content">

            <section class="form-section">
                <div class="section-header">
                    <h3>Vehículo</h3>

                    <button
                        v-if="!isEditMode"
                        type="button"
                        class="secondary-button"
                        @click="resetPlateSearch"
                    >
                        Limpiar
                    </button>
                </div>

                <small
                    v-if="plateMessage"
                    class="field-message"
                >
                    {{ plateMessage }}
                </small>

                <div class="form-grid">
                    <div class="form-field full-width">
                        <label>Placa</label>

                        <div class="identification-wrapper">
                            <input
                                v-model="vehicleForm.plate"
                                type="text"
                                class="table-input"
                                :disabled="plateDisabled"
                                style="width:100%;"
                            >

                            <button
                                v-if="!isEditMode"
                                type="button"
                                class="primary-button small-button"
                                :disabled="loadingVehicle || plateDisabled"
                                @click="searchVehicleByPlate"
                                style="display: flex; align-items: center; justify-content: center; padding: 8px 12px;"
                            >
                                <Search v-if="!loadingVehicle" />
                                <span v-else>...</span>
                            </button>

                            <button
                                v-if="!isEditMode"
                                type="button"
                                class="primary-button small-button"
                                @click="resetPlateSearch"
                                style="display: flex; align-items: center; justify-content: center; padding: 8px 12px;"
                            >
                                <RotateCcw />
                            </button>
                        </div>
                    </div>

                    <div class="form-field">
                        <label>Marca</label>
                        <input
                            v-model="vehicleForm.brand"
                            type="text"
                            class="table-input"
                            :disabled="vehicleFieldsDisabled"
                        >
                    </div>

                    <div class="form-field">
                        <label>Modelo</label>
                        <input
                            v-model="vehicleForm.model"
                            type="text"
                            class="table-input"
                            :disabled="vehicleFieldsDisabled"
                        >
                    </div>

                    <div class="form-field">
                        <label>Año</label>
                        <input
                            v-model="vehicleForm.year"
                            type="number"
                            class="table-input"
                            :disabled="vehicleFieldsDisabled"
                        >
                    </div>

                    <div class="form-field">
                        <label>Kilometraje</label>
                        <input
                            v-model="vehicleForm.mileage"
                            type="number"
                            class="table-input"
                            :disabled="vehicleFieldsDisabled"
                        >
                    </div>
                </div>
            </section>
            
            <section class="form-section">
                <h3>Cliente</h3>
                <div class="form-grid">
                    <div class="form-field">
                        <label>Identificación</label>

                        <input
                            v-model="clientForm.identification"
                            type="text"
                            class="table-input"
                            :disabled="clientFieldsDisabled"
                        >
                    </div>

                    <div class="form-field">
                        <label>Nombre completo</label>
                        <input
                            v-model="clientForm.full_name"
                            type="text"
                            class="table-input"
                            :disabled="clientFieldsDisabled"
                        >
                    </div>

                    <div class="form-field">
                        <label>Teléfono</label>
                        <input
                            v-model="clientForm.phone"
                            type="text"
                            class="table-input"
                            :disabled="clientFieldsDisabled"
                        >
                    </div>

                    <div class="form-field">
                        <label>Dirección</label>
                        <input
                            v-model="clientForm.address"
                            type="text"
                            class="table-input"
                            :disabled="clientFieldsDisabled"
                        >
                    </div>

                    <div class="form-field">
                        <label>Fecha nacimiento</label>
                        <input
                            v-model="clientForm.birth_date"
                            type="date"
                            class="table-input"
                            :disabled="clientFieldsDisabled"
                        >
                    </div>
                </div>
            </section>

            <section class="form-section">
                <h3>Orden de trabajo</h3>

                <div class="form-grid">
                    <div class="form-field" v-if="isEditMode">
                        <label>Estado</label>

                        <select
                            v-model="workOrderForm.status"
                            class="table-select"
                        >
                            <option value="PROCESO">
                                En proceso
                            </option>
                            <option value="FINALIZADO">
                                Finalizado
                            </option>
                        </select>
                    </div>

                    <div class="form-field full-width">
                        <label>Diagnóstico</label>

                        <textarea
                            v-model="workOrderForm.diagnosis"
                            class="table-textarea"
                        />
                    </div>

                    <div class="form-field full-width">
                        <label>Notas reparación</label>

                        <textarea
                            v-model="workOrderForm.repair_notes"
                            class="table-textarea"
                        />
                    </div>
                </div>
            </section>

            <section class="form-section">
                <div class="section-header">
                    <h3>Productos</h3>

                    <button
                        type="button"
                        class="secondary-button"
                        @click="addProduct"
                    >
                        Agregar
                    </button>
                </div>

                <div
                    v-if="selectedProducts.length"
                    class="mini-table-header"
                >
                    <span>Producto</span>
                    <span>Cantidad</span>
                    <span>Precio Unitario</span>
                    <span></span>
                </div>
                <div
                    v-for="(product, index) in selectedProducts"
                    :key="index"
                    class="mini-table-row"
                >
                    <Multiselect
                        v-model="product.product"
                        :options="getSelectableProducts(product.product)"
                        label="name"
                        track-by="id"
                        @update:model-value="onProductChange(product)"
                    />

                    <input
                        v-model="product.quantity"
                        type="number"
                        min="1"
                        class="table-input small-input"
                    >

                    <input
                        v-model="product.price"
                        type="number"
                        class="table-input small-input"
                        disabled
                    >

                    <button
                        type="button"
                        class="delete-row-button"
                        @click="removeProduct(index)"
                    >
                        <Trash2 style="color: var(--color-rojo);" />
                    </button>
                </div>
            </section>

            <section class="form-section">
                <div class="section-header">
                    <h3>Servicios</h3>

                    <button
                        type="button"
                        class="secondary-button"
                        @click="addService"
                    >
                        Agregar
                    </button>
                </div>

                <div
                    v-if="selectedServices.length"
                    class="mini-table-header"
                >
                    <span>Servicio</span>
                    <span>Cantidad</span>
                    <span>Precio Unitario</span>
                    <span></span>
                </div>

                <div
                    v-for="(service, index) in selectedServices"
                    :key="index"
                    class="mini-table-row"
                >
                    <Multiselect
                        v-model="service.service"
                        :options="getSelectableServices(service.service)"
                        label="name"
                        track-by="id"
                        @update:model-value="onServiceChange(service)"
                    />

                    <input
                        v-model="service.quantity"
                        type="number"
                        class="table-input small-input"
                    >

                    <input
                        v-model="service.price"
                        type="number"
                        class="table-input small-input"
                    >

                    <button
                        type="button"
                        class="delete-row-button"
                        @click="removeService(index)"
                    >
                        <Trash2 style="color: var(--color-rojo);" />
                    </button>
                </div>
            </section>

        </div>

        <div class="drawer-footer">
            <button
                type="button"
                class="secondary-button"
                @click="emit('close')"
            >
                Cancelar
            </button>

            <button
                type="button"
                class="primary-button"
                @click="saveWorkOrder"
            >
                {{ isEditMode ? 'Actualizar' : 'Guardar' }}
            </button>
        </div>
    </aside>
</template>

<style scoped>

.drawer-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.3);
    z-index: 90;
}

.drawer {
    position: fixed;
    top: 0;
    right: 0;
    width: 720px;
    max-width: 100%;
    height: 100vh;
    background: white;
    z-index: 100;

    display: flex;
    flex-direction: column;

    transform: translateX(100%);
    transition: transform 220ms ease;
}

.drawer.open {
    transform: translateX(0);
}

.drawer-header {
    padding: 20px 20px 0 20px;
    border-bottom: 1px solid var(--color-border);

    display: flex;
    align-items: flex-start;
    justify-content: space-between;
}

.drawer-content {
    flex: 1;
    overflow-y: auto;
    padding: 0 20px 20px 20px;

    display: flex;
    flex-direction: column;
    gap: 24px;
}

.drawer-footer {
    padding: 20px;
    border-top: 1px solid var(--color-border);

    display: flex;
    justify-content: flex-end;
    gap: 12px;
}

.form-section {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.form-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
}

.form-field {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.full-width {
    grid-column: 1 / -1;
}

.section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.identification-wrapper {
    display: flex;
    gap: 10px;
}

.table-input,
.table-select,
.table-textarea {
    border: 1px solid var(--color-border);
    border-radius: 12px;
    padding: 12px;
    font-size: 14px;
}



.table-textarea {
    resize: vertical;
    min-height: 120px;
}

.mini-table-row {
    display: grid;
    grid-template-columns: 1fr 100px 100px 40px;
    gap: 8px;
}

.primary-button {
    border: 0;
    background: var(--color-azul-neutro);
    color: white;
    border-radius: 12px;
    padding: 12px 18px;
    cursor: pointer;
}

.secondary-button {
    border: 1px solid var(--color-border);
    background: white;
    border-radius: 12px;
    padding: 12px 18px;
    cursor: pointer;
}

.small-button {
    white-space: nowrap;
}

.close-button {
    border: 0;
    background: transparent;
    font-size: 20px;
    cursor: pointer;
}
.field-message {
    display: block;
    color: #dc3545;
    font-size: 12px;
    margin-top: 4px;
}

.mini-table-header {
    display: grid;
    grid-template-columns: 1fr 100px 100px 40px;
    gap: 8px;
    margin-bottom: 0px;
    font-size: 12px;
    font-weight: 700;
}

.mini-table-row {
    display: grid;
    grid-template-columns: 1fr 100px 100px 40px;
    gap: 8px;
    margin-bottom: 0px;
    align-items: center;
}

.delete-row-button {
    width: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--color-border);
    border-radius: 10px;
    background: white;
    cursor: pointer;
    height: 42px;
}
</style>