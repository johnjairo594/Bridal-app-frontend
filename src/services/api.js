import axios from 'axios'
import { useAuthStore } from '../stores/auth.store'

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
})

api.interceptors.request.use((config) => {
    const authStore = useAuthStore()

    if (authStore.token) {
        config.headers.Authorization = `Bearer ${authStore.token}`
    }

    return config
})

export default api