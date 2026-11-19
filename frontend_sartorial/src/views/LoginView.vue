<template>
  <div class="min-vh-100 d-flex align-items-center justify-content-center p-3" style="background: radial-gradient(circle at center, #1E293B 0%, #070A0F 100%);">
    <div class="card-sartorial p-4 p-md-5 shadow-lg" style="max-width: 480px; width: 100%; border: 1px solid rgba(212,175,55,0.3);">
      <div class="text-center mb-4">
        <router-link to="/" class="text-decoration-none">
          <i class="bi bi-gem text-gold display-4 mb-2 d-inline-block"></i>
          <h3 class="font-display fw-bold text-gold mb-1" style="letter-spacing: 2.5px;">SARTORIAL PRESTIGE</h3>
          <p class="text-secondary small text-uppercase" style="letter-spacing: 2px;">Boutique & Haute Couture</p>
        </router-link>
      </div>


      <form @submit.prevent="handleLogin">
        <div class="mb-3">
          <label class="form-label">Usuario o Correo</label>
          <div class="input-group">
            <span class="input-group-text bg-transparent text-gold border-secondary"><i class="bi bi-person"></i></span>
            <input v-model="usuario" type="text" class="form-control" placeholder="admin, vendedor1..." required />
          </div>
        </div>

        <div class="mb-4">
          <label class="form-label">Contraseña</label>
          <div class="input-group">
            <span class="input-group-text bg-transparent text-gold border-secondary"><i class="bi bi-lock"></i></span>
            <input v-model="clave" type="password" class="form-control" placeholder="••••••••" required />
          </div>
        </div>

        <button type="submit" class="btn btn-gold w-100 py-3 font-display mb-3" :disabled="loading" style="letter-spacing: 1.5px;">
          <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
          {{ loading ? 'INGRESANDO...' : 'INICIAR SESIÓN' }}
        </button>
      </form>


      <div class="text-center mt-4">
        <router-link to="/register" class="text-secondary small text-decoration-none">
          ¿No tiene cuenta? <span class="text-gold fw-bold">Registrarse como Cliente</span>
        </router-link>
        <div class="mt-3">
          <router-link to="/" class="btn btn-sm btn-outline-secondary text-light">
            <i class="bi bi-arrow-left me-1"></i> Volver a la Tienda / Catálogo
          </router-link>
        </div>
      </div>

      <div class="text-center mt-4 pt-3 border-top border-secondary text-secondary" style="font-size: 0.75rem;">
        Sartorial Prestige Boutique &bull; Todos los derechos reservados
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import Swal from 'sweetalert2'

const authStore = useAuthStore()
const usuario = ref('')
const clave = ref('')
const loading = ref(false)

const handleLogin = async () => {
  loading.value = true
  try {
    await authStore.login(usuario.value, clave.value)
  } catch (err: any) {
    Swal.fire({
      icon: 'error',
      title: 'Acceso Denegado',
      text: err.response?.data?.message || 'Usuario o contraseña incorrectos.',
      background: '#131A26',
      color: '#F8FAFC',
    })
  } finally {
    loading.value = false
  }
}
</script>
