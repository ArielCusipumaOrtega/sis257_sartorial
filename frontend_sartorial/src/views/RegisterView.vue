<template>
  <div class="min-vh-100 d-flex align-items-center justify-content-center p-3" style="background: radial-gradient(circle at center, #1E293B 0%, #070A0F 100%);">
    <div class="card-sartorial p-4 p-md-5 shadow-lg" style="max-width: 520px; width: 100%; border: 1px solid rgba(212,175,55,0.3);">
      <div class="text-center mb-4">
        <router-link to="/" class="text-decoration-none">
          <i class="bi bi-gem text-gold display-4 mb-2 d-inline-block"></i>
          <h3 class="font-display fw-bold text-gold mb-1" style="letter-spacing: 2.5px;">SARTORIAL PRESTIGE</h3>
          <p class="text-secondary small text-uppercase" style="letter-spacing: 2px;">Registro de Cliente Exclusivo</p>
        </router-link>
      </div>

      <form @submit.prevent="handleRegister">
        <div class="row g-2 mb-3">
          <div class="col-6">
            <label class="form-label">Nombre *</label>
            <input v-model="form.nombre" type="text" class="form-control" placeholder="Carlos" required />
          </div>
          <div class="col-6">
            <label class="form-label">Apellido *</label>
            <input v-model="form.apellido" type="text" class="form-control" placeholder="Montenegro" required />
          </div>
        </div>

        <div class="mb-3">
          <label class="form-label">Correo Electrónico *</label>
          <input v-model="form.correo" type="email" class="form-control" placeholder="carlos@ejemplo.com" required />
        </div>

        <div class="mb-3">
          <label class="form-label">Nombre de Usuario *</label>
          <input v-model="form.usuario" type="text" class="form-control" placeholder="cmontenegro" required />
        </div>

        <div class="mb-4">
          <label class="form-label">Contraseña *</label>
          <input v-model="form.password" type="password" class="form-control" placeholder="Mínimo 6 caracteres" required minlength="6" />
        </div>

        <button type="submit" class="btn btn-gold w-100 py-3 font-display mb-3" :disabled="loading" style="letter-spacing: 1.5px;">
          <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
          {{ loading ? 'CREANDO CUENTA...' : 'CREAR CUENTA' }}
        </button>
      </form>

      <div class="text-center mt-3">
        <router-link to="/login" class="text-secondary small text-decoration-none">
          ¿Ya tiene una cuenta? <span class="text-gold fw-bold">Inicie Sesión</span>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import http from '@/plugins/axios'
import { useAuthStore } from '@/stores/auth'
import Swal from 'sweetalert2'
import router from '@/router'

const authStore = useAuthStore()
const loading = ref(false)

const form = ref({
  nombre: '',
  apellido: '',
  correo: '',
  usuario: '',
  password: '',
})

const handleRegister = async () => {
  loading.value = true
  try {
    const res = await http.post('auth/register', form.value)
    // El backend devuelve token y usuario en register
    authStore.token = res.data.access_token
    authStore.user = res.data
    localStorage.setItem('token', res.data.access_token)
    localStorage.setItem('user', JSON.stringify(res.data))

    Swal.fire({
      icon: 'success',
      title: '¡Bienvenido a Sartorial Prestige!',
      text: 'Su cuenta ha sido creada con éxito.',
      background: '#131A26',
      color: '#F8FAFC',
      timer: 1800,
      showConfirmButton: false,
    })
    router.push('/')
  } catch (err: any) {
    Swal.fire({
      icon: 'error',
      title: 'Error de Registro',
      text: err.response?.data?.message || 'No se pudo completar el registro.',
      background: '#131A26',
      color: '#F8FAFC',
    })
  } finally {
    loading.value = false
  }
}
</script>
