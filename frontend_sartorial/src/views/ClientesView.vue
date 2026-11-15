<template>
  <div class="clientes-view">
    <div class="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
      <div>
        <h2 class="font-serif fw-bold text-white mb-1">Cartera de Clientes Exclusivos</h2>
        <p class="text-secondary small mb-0 font-display">Perfiles de compradores, medidas y preferencias de talla</p>
      </div>
      <button class="btn btn-gold d-flex align-items-center gap-2" @click="abrirCrear">
        <i class="bi bi-person-plus-fill"></i> Registrar Cliente
      </button>
    </div>

    <!-- Buscador y Filtro -->
    <div class="card-sartorial p-3 mb-4">
      <div class="row g-2 align-items-center">
        <div class="col-md-8">
          <div class="input-group">
            <span class="input-group-text bg-transparent text-gold border-secondary"><i class="bi bi-search"></i></span>
            <input v-model="busqueda" type="text" class="form-control" placeholder="Buscar por nombre, apellido, CI/NIT o teléfono..." @input="buscarClientes" />
          </div>
        </div>
        <div class="col-md-4 text-md-end">
          <div class="form-check form-switch d-inline-block mb-0">
            <input class="form-check-input" type="checkbox" id="checkClientesInactivos" v-model="verInactivos" @change="cargarClientes" />
            <label class="form-check-label text-secondary small ms-2" for="checkClientesInactivos">
              Mostrar dados de baja
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabla -->
    <div class="card-sartorial">
      <div class="card-sartorial-body p-0">
        <div class="table-responsive">
          <table class="table-sartorial mb-0">
            <thead>
              <tr>
                <th>Cliente</th>
                <th class="text-nowrap-cell">CI / NIT</th>
                <th class="text-nowrap-cell">Teléfono</th>
                <th>Correo Electrónico</th>
                <th class="text-nowrap-cell">Talla Habitual</th>
                <th>Dirección</th>
                <th class="cell-actions text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="c in clientes" :key="c.id">
                <td>
                  <div class="fw-bold text-white">{{ c.nombre }} {{ c.apellido }}</div>
                  <small class="text-secondary">Registrado: {{ formatDate(c.fechaCreacion) }}</small>
                </td>
                <td class="text-gold fw-bold text-nowrap-cell cell-nit">{{ c.ciNit || 'S/N' }}</td>
                <td class="text-nowrap-cell">{{ c.telefono || 'Sin teléfono' }}</td>
                <td class="small">{{ c.correo || 'Sin correo' }}</td>
                <td class="text-nowrap-cell cell-badge">
                  <span class="badge-talla">{{ c.preferenciaTalla || 'General' }}</span>
                </td>
                <td class="small text-secondary">{{ c.direccion || 'Sin dirección' }}</td>
                <td class="cell-actions text-end">
                  <div class="btn-group">
                    <template v-if="c.fechaEliminacion">
                      <span class="badge bg-danger me-2">Dado de baja</span>
                      <button class="btn btn-sm btn-outline-success" @click="restaurar(c)" title="Restaurar Cliente">
                        <i class="bi bi-arrow-counterclockwise"></i> Restaurar
                      </button>
                    </template>
                    <template v-else>
                      <button class="btn btn-sm btn-outline-gold" @click="abrirEditar(c)"><i class="bi bi-pencil"></i></button>
                      <button v-if="c.ciNit !== '0'" class="btn btn-sm btn-outline-danger" @click="eliminar(c)"><i class="bi bi-trash"></i></button>
                    </template>
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
            <h5 class="modal-title font-display text-gold">{{ modoEdicion ? 'Editar Cliente' : 'Registrar Cliente' }}</h5>
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
              <div class="row g-2 mb-3">
                <div class="col-6">
                  <label class="form-label">Cédula de Identidad o NIT</label>
                  <input v-model="form.ciNit" type="text" class="form-control" />
                </div>
                <div class="col-6">
                  <label class="form-label">Teléfono Móvil (WhatsApp)</label>
                  <input v-model="form.telefono" type="text" class="form-control" />
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label">Correo Electrónico</label>
                <input v-model="form.correo" type="email" class="form-control" />
              </div>
              <div class="mb-3">
                <label class="form-label">Preferencia de Talla (Traje / Pantalón / Calzado)</label>
                <input v-model="form.preferenciaTalla" type="text" class="form-control" placeholder="Ej. Traje 40R / Pantalón 32 / Calzado 42" />
              </div>
              <div class="mb-3">
                <label class="form-label">Dirección de Envío Habitual</label>
                <input v-model="form.direccion" type="text" class="form-control" />
              </div>
            </div>
            <div class="modal-footer border-secondary">
              <button type="button" class="btn btn-outline-secondary" @click="modalOpen = false">Cancelar</button>
              <button type="submit" class="btn btn-gold" :disabled="guardando">
                <i class="bi bi-check2-circle me-1"></i> Guardar Cliente
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
import { formatDate } from '@/helpers'
import Swal from 'sweetalert2'

const clientes = ref<any[]>([])
const busqueda = ref('')
const modalOpen = ref(false)
const modoEdicion = ref(false)
const editId = ref<number | null>(null)
const guardando = ref(false)

const form = ref({
  nombre: '',
  apellido: '',
  ciNit: '',
  telefono: '',
  correo: '',
  preferenciaTalla: '',
  direccion: '',
})

const verInactivos = ref(false)

const cargarClientes = async () => {
  try {
    const res = await http.get('clientes', {
      params: { conInactivos: verInactivos.value ? 'true' : undefined },
    })
    clientes.value = res.data
  } catch (e) {
    console.error(e)
  }
}

const buscarClientes = async () => {
  try {
    const res = await http.get('clientes', {
      params: {
        search: busqueda.value || undefined,
        conInactivos: verInactivos.value ? 'true' : undefined,
      },
    })
    clientes.value = res.data
  } catch (e) {
    console.error(e)
  }
}

const abrirCrear = () => {
  modoEdicion.value = false
  editId.value = null
  form.value = { nombre: '', apellido: '', ciNit: '', telefono: '', correo: '', preferenciaTalla: '', direccion: '' }
  modalOpen.value = true
}

const abrirEditar = (c: any) => {
  modoEdicion.value = true
  editId.value = c.id
  form.value = {
    nombre: c.nombre,
    apellido: c.apellido,
    ciNit: c.ciNit || '',
    telefono: c.telefono || '',
    correo: c.correo || '',
    preferenciaTalla: c.preferenciaTalla || '',
    direccion: c.direccion || '',
  }
  modalOpen.value = true
}

const guardar = async () => {
  guardando.value = true
  try {
    if (modoEdicion.value && editId.value) {
      await http.patch(`clientes/${editId.value}`, form.value)
    } else {
      await http.post('clientes', form.value)
    }
    modalOpen.value = false
    cargarClientes()
    Swal.fire({
      icon: 'success',
      title: 'Éxito',
      text: 'Cliente guardado correctamente.',
      background: '#131A26',
      color: '#F8FAFC',
      timer: 1500,
      showConfirmButton: false,
    })
  } catch (err: any) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: err.response?.data?.message || 'No se pudo guardar el cliente.',
      background: '#131A26',
      color: '#F8FAFC',
    })
  } finally {
    guardando.value = false
  }
}

const eliminar = async (c: any) => {
  const res = await Swal.fire({
    title: `¿Dar de baja a ${c.nombre} ${c.apellido}?`,
    text: 'Se aplicará Soft Delete para no comprometer el historial de ventas registradas con este cliente.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#EF4444',
    confirmButtonText: 'Sí, dar de baja',
    cancelButtonText: 'Cancelar',
    background: '#131A26',
    color: '#F8FAFC',
  })
  if (res.isConfirmed) {
    try {
      await http.delete(`clientes/${c.id}`)
      cargarClientes()
      Swal.fire({
        icon: 'success',
        title: 'Baja Lógica Exitosa',
        text: 'El cliente ha sido dado de baja sin borrar su historial comercial.',
        background: '#131A26',
        color: '#F8FAFC',
        timer: 1600,
        showConfirmButton: false,
      })
    } catch (e: any) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: e.response?.data?.message || 'No se pudo dar de baja.',
        background: '#131A26',
        color: '#F8FAFC',
      })
    }
  }
}

const restaurar = async (c: any) => {
  const res = await Swal.fire({
    title: `¿Restaurar a ${c.nombre} ${c.apellido}?`,
    text: 'El cliente volverá a estar activo para registrar ventas y facturación.',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#10B981',
    confirmButtonText: 'Sí, restaurar',
    cancelButtonText: 'Cancelar',
    background: '#131A26',
    color: '#F8FAFC',
  })
  if (res.isConfirmed) {
    try {
      await http.patch(`clientes/${c.id}/restaurar`)
      cargarClientes()
      Swal.fire({
        icon: 'success',
        title: 'Cliente Restaurado',
        text: 'El cliente fue reactivado exitosamente.',
        background: '#131A26',
        color: '#F8FAFC',
        timer: 1600,
        showConfirmButton: false,
      })
    } catch (e: any) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: e.response?.data?.message || 'No se pudo restaurar el cliente.',
        background: '#131A26',
        color: '#F8FAFC',
      })
    }
  }
}

onMounted(() => {
  cargarClientes()
})
</script>
