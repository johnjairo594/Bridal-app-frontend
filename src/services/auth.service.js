import api from './api'

export const loginRequest = async (payload) => {
    const response = await api.post('/login', payload)

    return response.data
}