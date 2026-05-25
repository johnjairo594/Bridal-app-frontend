import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: JSON.parse(localStorage.getItem('user')) || null,
        token: localStorage.getItem('token') || null,
    }),

    getters: {
        isAuthenticated: (state) => !!state.token,
    },

    actions: {
        setAuth(data) {
            this.user = data.user
            this.token = data.token

            localStorage.setItem('user', JSON.stringify(data.user))
            localStorage.setItem('token', data.token)
        },

        logout() {
            this.user = null
            this.token = null

            localStorage.removeItem('user')
            localStorage.removeItem('token')
        }
    }
})