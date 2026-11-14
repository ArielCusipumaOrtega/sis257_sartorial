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

      <!-- Alerta de Sesión Activa (Si el usuario ya tiene sesión y visita /login) -->
      <div
        v-if="authStore.isAuthenticated"
        class="mb-4 p-3 rounded border border-warning"
        style="background: rgba(212, 175, 55, 0.12); border-color: rgba(212, 175, 55, 0.4) !important;"
      >
        <div class="d-flex align-items-center gap-3 mb-2">
          <div class="rounded-circle bg-dark border border-warning d-flex align-items-center justify-content-center" style="width: 44px; height: 44px;">
            <i class="bi bi-person-fill text-gold fs-4"></i>
          </div>
          <div class="flex-grow-1 overflow-hidden">
            <div class="fw-bold text-white text-truncate">{{ authStore.fullName || authStore.user?.usuario }}</div>
            <div class="small text-secondary d-flex align-items-center gap-2">
              <span class="text-gold">@{{ authStore.user?.usuario }}</span>
              <span class="badge bg-gold px-2 py-0" style="font-size: 0.7rem;">
                {{ authStore.rolName }}
              </span>
            </div>
          </div>
        </div>

        <p class="text-light small mb-3">
          Tienes una sesión abierta actualmente. Puedes entrar a tu panel o cerrar sesión para ingresar con otra cuenta.
        </p>

        <div class="d-flex gap-2">
          <button type="button" class="btn btn-gold btn-sm flex-grow-1 d-flex align-items-center justify-content-center gap-2" @click="goToActivePanel">
            <i class="bi bi-speedometer2"></i>
            <span>Ir a Mi Panel / Tienda</span>
          </button>
          <button type="button" class="btn btn-outline-danger btn-sm d-flex align-items-center justify-content-center gap-1 px-3" @click="handleLogout">
            <i class="bi bi-box-arrow-right"></i>
            <span>Cerrar</span>
          </button>
        </div>
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

      <!-- Accesos Rápidos de 1 Clic -->
      <div class="pt-3 border-top border-secondary text-center">
        <small class="text-secondary d-block mb-2 font-display">CREDENCIALES DE PRUEBA RÁPIDA (1 CLIC):</small>
        <div class="d-flex flex-wrap gap-2 justify-content-center">
          <button type="button" class="btn btn-sm btn-outline-gold" @click="setCredentials('admin', 'admin123')">
            <i class="bi bi-shield-lock me-1"></i> Admin
          </button>
          <button type="button" class="btn btn-sm btn-outline-secondary text-white" @click="setCredentials('vendedor1', 'vend123')">
            <i class="bi bi-person-badge me-1"></i> Vendedor POS
          </button>
          <button type="button" class="btn btn-sm btn-outline-secondary text-white" @click="setCredentials('cliente1', 'client123')">
            <i class="bi bi-person me-1"></i> Cliente Demo
          </button>
        </div>
      </div>

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
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Swal from 'sweetalert2'

const router = useRouter()
const authStore = useAuthStore()
const usuario = ref('')
const clave = ref('')
const loading = ref(false)

const goToActivePanel = () => {
  if (authStore.isAdmin) {
    router.push('/admin/dashboard')
  } else if (authStore.isVendedor) {
    router.push('/vendedor/dashboard')
  } else {
    router.push('/')
  }
}

const handleLogout = () => {
  authStore.logout()
}

const setCredentials = async (u: string, p: string) => {
  if (authStore.isAuthenticated) {
    authStore.token = null
    authStore.user = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }
  usuario.value = u
  clave.value = p
  await handleLogin()
}

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
