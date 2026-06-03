import api from "./api";

export const getProducts = async (filters = {}) => {
    const params = new URLSearchParams();

    if (filters.name) {
        params.set('name', filters.name);
    }

    const queryString = params.toString();
    const response = await api.get(queryString ? `/products?${queryString}` : '/products');
    return response.data;
}
