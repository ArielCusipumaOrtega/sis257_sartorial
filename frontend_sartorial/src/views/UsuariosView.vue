<template>
  <div class="usuarios-view">
    <div class="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
      <div>
        <h2 class="font-serif fw-bold text-white mb-1">Usuarios del Sistema</h2>
        <p class="text-secondary small mb-0 font-display">Personal administrativo, cajeros y asesores de venta</p>
      </div>
      <button class="btn btn-gold d-flex align-items-center gap-2" @click="abrirCrear">
        <i class="bi bi-person-plus-fill"></i> Crear Usuario
      </button>
    </div>

    <!-- Tabla -->
    <div class="card-sartorial">
      <div class="card-sartorial-body p-0">
        <div class="table-responsive">
          <table class="table-sartorial mb-0">
            <thead>
              <tr>
                <th>Nombre Completo</th>
                <th class="text-nowrap-cell">Usuario</th>
                <th>Correo</th>
                <th class="text-nowrap-cell">Rol Asignado</th>
                <th class="text-nowrap-cell">Estado</th>
                <th class="cell-actions text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="u in usuarios" :key="u.id">
                <td class="fw-bold text-white">{{ u.nombre }} {{ u.apellido }}</td>
                <td class="text-gold fw-bold text-nowrap-cell">@{{ u.usuario }}</td>
                <td class="small text-secondary">{{ u.correo }}</td>
                <td class="text-nowrap-cell cell-badge">
                  <span class="badge" :class="u.rol?.nombre === 'ADMIN' ? 'bg-gold' : 'bg-secondary'">
                    {{ u.rol?.nombre }}
                  </span>
                </td>
                <td class="text-nowrap-cell cell-badge">
                  <span class="badge" :class="u.estado ? 'bg-success' : 'bg-danger'">
                    {{ u.estado ? 'Activo' : 'Inactivo' }}
                  </span>
                </td>
                <td class="cell-actions text-end">
                  <div class="btn-group">
                    <button class="btn btn-sm btn-outline-gold" @click="abrirEditar(u)"><i class="bi bi-pencil"></i></button>
                    <button v-if="u.usuario !== 'admin'" class="btn btn-sm btn-outline-danger" @click="eliminar(u)"><i class="bi bi-trash"></i></button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal Formulario -->
    <div v-if="modalOpen" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.85); backdrop-filter: blur(6px);">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header border-secondary">
            <h5 class="modal-title font-display text-gold">{{ modoEdicion ? 'Editar Usuario' : 'Nuevo Usuario' }}</h5>
            <button type="button" class="btn-close btn-close-white" @click="modalOpen = false"></button>
          </div>
          <form @submit.prevent="guardar">
            <div class="modal-body p-4">
              <div class="row g-2 mb-3">
                <div class="col-6">
                  <label class="form-label">Nombre *</label>
                  <input v-model="form.nombre" type="text" class="form-control" required />
                </div>
                <div class="col-6">
                  <label class="form-label">Apellido *</label>
                  <input v-model="form.apellido" type="text" class="form-control" required />
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label">Correo Electrónico *</label>
                <input v-model="form.correo" type="email" class="form-control" required />
              </div>
              <div class="row g-2 mb-3">
                <div class="col-6">
                  <label class="form-label">Nombre de Usuario *</label>
                  <input v-model="form.usuario" type="text" class="form-control" required :disabled="modoEdicion" />
                </div>
                <div class="col-6">
                  <label class="form-label">Rol del Sistema *</label>
                  <select v-model="form.rolId" class="form-select" required>
                    <option v-for="r in roles" :key="r.id" :value="r.id">{{ r.nombre }}</option>
                  </select>
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label">{{ modoEdicion ? 'Nueva Contraseña (dejar en blanco para conservar)' : 'Contraseña *' }}</label>
                <input v-model="form.password" type="password" class="form-control" :required="!modoEdicion" minlength="6" />
              </div>
            </div>
            <div class="modal-footer border-secondary">
              <button type="button" class="btn btn-outline-secondary" @click="modalOpen = false">Cancelar</button>
              <button type="submit" class="btn btn-gold" :disabled="guardando">
                <i class="bi bi-check2-circle me-1"></i> Guardar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import http from '@/plugins/axios'
import Swal from 'sweetalert2'

const usuarios = ref<any[]>([])
const roles = ref<any[]>([])
const modalOpen = ref(false)
const modoEdicion = ref(false)
const editId = ref<number | null>(null)
const guardando = ref(false)

const form = ref({
  nombre: '',
  apellido: '',
  correo: '',
  usuario: '',
  password: '',
  rolId: 1,
})

const cargarDatos = async () => {
  try {
    const [uRes, rRes] = await Promise.all([http.get('usuarios'), http.get('roles')])
    usuarios.value = uRes.data
    roles.value = rRes.data
    if (roles.value.length > 0 && !form.value.rolId) {
      form.value.rolId = roles.value[0].id
    }
  } catch (e) {
    console.error(e)
  }
}

const abrirCrear = () => {
  modoEdicion.value = false
  editId.value = null
  form.value = {
    nombre: '',
    apellido: '',
    correo: '',
    usuario: '',
    password: '',
    rolId: roles.value[0]?.id || 1,
  }
  modalOpen.value = true
}

const abrirEditar = (u: any) => {
  modoEdicion.value = true
  editId.value = u.id
  form.value = {
    nombre: u.nombre,
    apellido: u.apellido,
    correo: u.correo,
    usuario: u.usuario,
    password: '',
    rolId: u.rolId || u.rol?.id,
  }
  modalOpen.value = true
}

const guardar = async () => {
  guardando.value = true
  try {
    if (modoEdicion.value && editId.value) {
      const payload: any = { ...form.value }
      if (!payload.password) delete payload.password
      await http.patch(`usuarios/${editId.value}`, payload)
    } else {
      await http.post('usuarios', form.value)
    }
    modalOpen.value = false
    cargarDatos()
    Swal.fire({
      icon: 'success',
      title: 'Éxito',
      text: 'Usuario guardado correctamente.',
      background: '#131A26',
      color: '#F8FAFC',
      timer: 1500,
      showConfirmButton: false,
    })
  } catch (err: any) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: err.response?.data?.message || 'No se pudo guardar el usuario.',
      background: '#131A26',
      color: '#F8FAFC',
    })
  } finally {
    guardando.value = false
  }
}

const eliminar = async (u: any) => {
  const res = await Swal.fire({
    title: `¿Eliminar a ${u.nombre}?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#EF4444',
    confirmButtonText: 'Sí, eliminar',
    background: '#131A26',
    color: '#F8FAFC',
  })
  if (res.isConfirmed) {
    try {
      await http.delete(`usuarios/${u.id}`)
      cargarDatos()
      Swal.fire({
        icon: 'success',
        title: 'Eliminado',
        text: 'El usuario ha sido eliminado.',
        background: '#131A26',
        color: '#F8FAFC',
        timer: 1500,
        showConfirmButton: false,
      })
    } catch (e: any) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: e.response?.data?.message || 'No se pudo eliminar.',
        background: '#131A26',
        color: '#F8FAFC',
      })
    }
  }
}

onMounted(() => {
  cargarDatos()
})
</script>
