<template>
  <div class="proveedores-view">
    <div class="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
      <div>
        <h2 class="font-serif fw-bold text-white mb-1">Proveedores Textiles & Talleres</h2>
        <p class="text-secondary small mb-0 font-display">Casas importadoras de pañería, lanas y manufactura artesanal</p>
      </div>
      <button class="btn btn-gold d-flex align-items-center gap-2" @click="abrirCrear">
        <i class="bi bi-plus-circle-fill"></i> Nuevo Proveedor
      </button>
    </div>

    <!-- Tabla -->
    <div class="card-sartorial">
      <div class="card-sartorial-body p-0">
        <div class="table-responsive">
          <table class="table-sartorial mb-0">
            <thead>
              <tr>
                <th>Razón Social</th>
                <th>NIT / Identificación</th>
                <th>Contacto & Teléfono</th>
                <th>Dirección</th>
                <th class="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in proveedores" :key="p.id">
                <td>
                  <div class="fw-bold text-white">{{ p.nombre }}</div>
                  <small class="text-secondary">{{ p.correo || 'Sin correo' }}</small>
                </td>
                <td class="text-gold fw-bold">{{ p.nit || 'S/N' }}</td>
                <td>{{ p.telefono || 'Sin teléfono' }}</td>
                <td class="small text-secondary">{{ p.direccion || 'Sin dirección' }}</td>
                <td class="text-end">
                  <button class="btn btn-sm btn-outline-gold me-2" @click="abrirEditar(p)"><i class="bi bi-pencil"></i></button>
                  <button class="btn btn-sm btn-outline-danger" @click="eliminar(p)"><i class="bi bi-trash"></i></button>
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
            <h5 class="modal-title font-display text-gold">{{ modoEdicion ? 'Editar Proveedor' : 'Nuevo Proveedor' }}</h5>
            <button type="button" class="btn-close btn-close-white" @click="modalOpen = false"></button>
          </div>
          <form @submit.prevent="guardar">
            <div class="modal-body p-4">
              <div class="mb-3">
                <label class="form-label">Razón Social *</label>
                <input v-model="form.nombre" type="text" class="form-control" required />
              </div>
              <div class="row g-2 mb-3">
                <div class="col-6">
                  <label class="form-label">NIT / Identificación Fiscal</label>
                  <input v-model="form.nit" type="text" class="form-control" />
                </div>
                <div class="col-6">
                  <label class="form-label">Teléfono</label>
                  <input v-model="form.telefono" type="text" class="form-control" />
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label">Correo Electrónico</label>
                <input v-model="form.correo" type="email" class="form-control" />
              </div>
              <div class="mb-3">
                <label class="form-label">Dirección de Planta / Taller</label>
                <input v-model="form.direccion" type="text" class="form-control" />
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

const proveedores = ref<any[]>([])
const modalOpen = ref(false)
const modoEdicion = ref(false)
const editId = ref<number | null>(null)
const guardando = ref(false)

const form = ref({
  nombre: '',
  nit: '',
  telefono: '',
  correo: '',
  direccion: '',
})

const cargarProveedores = async () => {
  try {
    const res = await http.get('proveedores')
    proveedores.value = res.data
  } catch (e) {
    console.error(e)
  }
}

const abrirCrear = () => {
  modoEdicion.value = false
  editId.value = null
  form.value = { nombre: '', nit: '', telefono: '', correo: '', direccion: '' }
  modalOpen.value = true
}

const abrirEditar = (p: any) => {
  modoEdicion.value = true
  editId.value = p.id
  form.value = { nombre: p.nombre, nit: p.nit || '', telefono: p.telefono || '', correo: p.correo || '', direccion: p.direccion || '' }
  modalOpen.value = true
}

const guardar = async () => {
  guardando.value = true
  try {
    if (modoEdicion.value && editId.value) {
      await http.patch(`proveedores/${editId.value}`, form.value)
    } else {
      await http.post('proveedores', form.value)
    }
    modalOpen.value = false
    cargarProveedores()
    Swal.fire({
      icon: 'success',
      title: 'Éxito',
      text: 'Proveedor guardado correctamente.',
      background: '#131A26',
      color: '#F8FAFC',
      timer: 1500,
      showConfirmButton: false,
    })
  } catch (err: any) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: err.response?.data?.message || 'No se pudo guardar el proveedor.',
      background: '#131A26',
      color: '#F8FAFC',
    })
  } finally {
    guardando.value = false
  }
}

const eliminar = async (p: any) => {
  const res = await Swal.fire({
    title: `¿Eliminar proveedor ${p.nombre}?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#EF4444',
    confirmButtonText: 'Sí, eliminar',
    background: '#131A26',
    color: '#F8FAFC',
  })
  if (res.isConfirmed) {
    try {
      await http.delete(`proveedores/${p.id}`)
      cargarProveedores()
      Swal.fire({
        icon: 'success',
        title: 'Eliminado',
        text: 'El proveedor ha sido eliminado.',
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
  cargarProveedores()
})
</script>
