import api from './api'

export const getVehicleByPlate = async (plate) => {
    return await api.get(`/vehicles/plate/${plate}`)
}