import api from './api'

export const getUsers = async (filters = {}) => {
  const params = new URLSearchParams()

  if (filters.role) {
    params.set('role', filters.role)
  }

  const queryString = params.toString()
  const response = await api.get(queryString ? `/users?${queryString}` : '/users')

  return response.data
}