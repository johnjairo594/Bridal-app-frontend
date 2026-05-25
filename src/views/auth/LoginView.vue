<script setup>
import { ref } from 'vue'
import { Eye, EyeOff } from '@lucide/vue';
import { reactive } from 'vue';
import { loginRequest } from '../../services/auth.service';
import { useAuthStore } from '../../stores/auth.store';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const form = reactive({
    email: '',
    password: '',
})

const loading = ref(false)
const errors = ref({})

const login = async () => {
    try {
        loading.value = true
        errors.value = {}
        const response = await loginRequest(form)

        authStore.setAuth(response)

        router.push('/inicio')

    } catch (error) {
        if (error.response?.status === 422) {
            errors.value = error.response.data.errors
        } else if (error.response?.status === 401) {
            errors.value = { 
              email: [error.response.data.message],
              password: [error.response.data.message]
            }
        } else {
            console.error('Error de inicio de sesión:', error)
        }
        loading.value = false
    } finally {
        loading.value = false
    }
}

const passwordVisible = ref(false)
</script>

<template>
  <main class="login-page">
    <section class="login-shell" aria-labelledby="login-title">
      <header class="login-brand-card">
        <span class="login-brand-eyebrow">Tecnicentro Bridal</span>
        <h1 id="login-title">Iniciar sesión</h1>
      </header>

      <form class="login-card" autocomplete="on" @submit.prevent="login">
        <div class="field-group">
          <label for="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="tucorreo@ejemplo.com"
            autocomplete="email"
            v-model="form.email"
            :disabled="loading"
          />
          <small v-if="errors.email" class="error-message">
            {{ errors.email[0] }}
          </small>
        </div>

        <div class="field-group">
          <label for="password">Contraseña</label>
          <div class="password-field">
            <input
              id="password"
              name="password"
              :type="passwordVisible ? 'text' : 'password'"
              placeholder="Ingresa tu contraseña"
              autocomplete="current-password"
              v-model="form.password" 
              :disabled="loading"
            />
            <button
              class="password-toggle"
              type="button"
              :aria-pressed="passwordVisible"
              :aria-label="passwordVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'"
              @click="passwordVisible = !passwordVisible"
            >
              <Eye v-if="!passwordVisible" />
              <EyeOff v-else />
            </button>
          </div>
          <small v-if="errors.password" class="error-message">
            {{ errors.password[0] }}
          </small>
        </div>

        <button 
          class="submit-button" type="submit" :disabled="loading">
          <span v-if="loading" class="spinner"></span>
          <span v-else>Iniciar sesión</span>
        </button>
      </form>
    </section>
  </main>
</template>

<style scoped>  

.login-page {
  min-height: 100svh;
  display: grid;
  place-items: center;
  padding: 32px 20px;
  position: relative;
  isolation: isolate;
}

.login-page::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(242, 242, 242, 0.2), rgba(242, 242, 242, 0.42));
  backdrop-filter: blur(3px);
  z-index: -1;
}

.login-shell {
  width: min(100%, 440px);
  position: relative;
  padding-top: 42px;
}

.login-brand-card,
.login-card {
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  box-shadow: var(--color-shadow);
  backdrop-filter: blur(14px);
}

.login-brand-card {
  width: min(92%, 400px);
  margin: 0 auto -68px;
  padding: 18px 24px 16px;
  border-radius: 18px;
  text-align: center;
  position: relative;
  z-index: 2;
  background: var(--color-surface);
}

.login-brand-card::after {
  content: '';
  position: absolute;
  inset: auto 28px 11px;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(111, 123, 191, 0.4), transparent);
}

.login-brand-eyebrow {
  display: block;
  text-transform: uppercase;
  letter-spacing: 0.22em;
  font-size: 1rem;
  color: var(--color-azul-neutro);
  margin-bottom: 6px;
  font-weight: 600;
}

.login-brand-card h1 {
  margin: 0;
  font-family: var(--font-heading);
  font-size: clamp(1.3rem, 2vw, 1.4rem);
  line-height: 1.15;
  color: var(--color-ink);
}

.login-card {
  position: relative;
  z-index: 1;
  border-radius: 28px;
  padding: 84px 32px 34px;
  display: grid;
  gap: 18px;
}


.password-field {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  overflow: hidden;
  border-radius: 16px;
  border: 1px solid rgba(111, 123, 191, 0.18);
  background: rgba(255, 255, 255, 0.84);
  transition:
    border-color 160ms ease,
    box-shadow 160ms ease,
    transform 160ms ease;
}

.password-field:focus-within {
  border-color: var(--color-celeste);
  box-shadow: 0 0 0 4px var(--color-focus);
}

.password-field input {
  border: 0;
  border-radius: 0;
  background: transparent;
}

.password-field input:focus {
  box-shadow: none;
}

.password-toggle {
  appearance: none;
  border: 0;
  background: transparent;
  color: var(--color-ink-soft);
  width: 48px;
  height: 48px;
  display: inline-grid;
  place-items: center;
  margin-right: 6px;
  border-radius: 999px;
  transition:
    color 160ms ease,
    background-color 160ms ease;
}

.password-toggle:hover {
  color: var(--color-azul-neutro);
  background: rgba(111, 123, 191, 0.08);
}

.password-toggle:focus-visible {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
}

.password-toggle svg {
  width: 22px;
  height: 22px;
}

</style>