import api from "./api";

export const getServices = async (filters = {}) => {
    const params = new URLSearchParams();

    if (filters.name) {
        params.set('name', filters.name);
    }

    const queryString = params.toString();
    const response = await api.get(queryString ? `/services?${queryString}` : '/services');
    return response.data;
}