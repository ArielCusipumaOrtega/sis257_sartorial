<template>
  <div class="perfil-view">
    <div class="mb-4">
      <h2 class="font-serif fw-bold text-white mb-1">Mi Perfil de Usuario</h2>
      <p class="text-secondary small mb-0 font-display">Información personal y actualización de credenciales de acceso</p>
    </div>

    <div class="row g-4">
      <div class="col-12 col-md-4">
        <div class="card-sartorial p-4 text-center h-100">
          <div class="rounded-circle p-4 bg-dark border border-warning d-inline-flex mb-3">
            <i class="bi bi-person-fill text-gold display-3"></i>
          </div>
          <h4 class="font-serif text-white mb-1">{{ authStore.fullName }}</h4>
          <span class="badge bg-gold px-3 py-1 mb-2 font-display">{{ authStore.user?.rol?.nombre }}</span>
          <p class="text-secondary small">{{ authStore.user?.correo }}</p>
          <div class="border-top border-secondary pt-3 mt-3 text-start small">
            <div class="mb-2"><span class="text-secondary">Nombre de Usuario:</span> <strong class="text-white ms-1">{{ authStore.user?.usuario }}</strong></div>
            <div><span class="text-secondary">Estado Cuenta:</span> <span class="badge bg-success ms-1">Activa</span></div>
          </div>
        </div>
      </div>

      <div class="col-12 col-md-8">
        <div class="card-sartorial p-4">
          <h5 class="font-serif text-gold mb-3"><i class="bi bi-shield-lock me-2"></i> Cambiar Contraseña de Acceso</h5>
          <form @submit.prevent="cambiarPassword">
            <div class="mb-3">
              <label class="form-label">Nueva Contraseña *</label>
              <input v-model="nuevaClave" type="password" class="form-control" required minlength="6" placeholder="Mínimo 6 caracteres..." />
            </div>
            <div class="mb-4">
              <label class="form-label">Confirmar Nueva Contraseña *</label>
              <input v-model="confirmarClave" type="password" class="form-control" required minlength="6" placeholder="Repita la contraseña..." />
            </div>
            <button type="submit" class="btn btn-gold" :disabled="guardando">
              <i class="bi bi-check2-circle me-1"></i> {{ guardando ? 'Actualizando...' : 'Actualizar Contraseña' }}
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import http from '@/plugins/axios'
import Swal from 'sweetalert2'

const authStore = useAuthStore()
const nuevaClave = ref('')
const confirmarClave = ref('')
const guardando = ref(false)

const cambiarPassword = async () => {
  if (nuevaClave.value !== confirmarClave.value) {
    Swal.fire({
      icon: 'warning',
      title: 'Contraseñas no coinciden',
      text: 'Por favor verifique que ambas contraseñas sean idénticas.',
      background: '#131A26',
      color: '#F8FAFC',
    })
    return
  }

  guardando.value = true
  try {
    await http.patch(`usuarios/${authStore.user?.id}`, {
      password: nuevaClave.value,
    })
    Swal.fire({
      icon: 'success',
      title: 'Contraseña Actualizada',
      text: 'Su contraseña ha sido modificada con éxito.',
      background: '#131A26',
      color: '#F8FAFC',
      timer: 1800,
      showConfirmButton: false,
    })
    nuevaClave.value = ''
    confirmarClave.value = ''
  } catch (err: any) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: err.response?.data?.message || 'No se pudo actualizar la contraseña.',
      background: '#131A26',
      color: '#F8FAFC',
    })
  } finally {
    guardando.value = false
  }
}
</script>
