import api from './api'

export const getClientByIdentification = async (identification) => {
    return await api.get(`/clients/identification/${identification}`)
}