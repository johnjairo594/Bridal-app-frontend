import api from './api'

export const getWorkOrders = async (page = 1, filters = {}) => {
  const params = new URLSearchParams()

  params.set('page', page)

  if (filters.filter) {
    params.set('filter', filters.filter)
  }

  if (filters.entry_date_from) {
    params.set('entry_date_from', filters.entry_date_from)
  }

  if (filters.entry_date_to) {
    params.set('entry_date_to', filters.entry_date_to)
  }

  if (filters.mechanic_id) {
    params.set('mechanic_id', filters.mechanic_id)
  }

  if (filters.status) {
    params.set('status', filters.status)
  }

  const response = await api.get(`/work-orders?${params.toString()}`)

  return response.data
}

export const createWorkOrder = async (workOrderData) => {
  const response = await api.post('/work-orders', workOrderData)

  return response.data
}

export const getWorkOrderById = async (id) => {
  const response = await api.get(`/work-orders/${id}`)

  return response.data
}

export const updateWorkOrder = async (id, workOrderData) => {
  const response = await api.put(`/work-orders/${id}`, workOrderData)

  return response.data
}

export const deleteWorkOrder = async (id) => {
  const response = await api.delete(`/work-orders/${id}`)

  return response.data
}