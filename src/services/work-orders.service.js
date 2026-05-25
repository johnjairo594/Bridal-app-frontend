import api from './api'

export const getWorkOrders = async (page = 1) => {
  const response = await api.get(`/work-orders?page=${page}`)

  return response.data
}