<template>
  <div class="marcas-view">
    <div class="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
      <div>
        <h2 class="font-serif fw-bold text-white mb-1">Firmas & Casas de Moda</h2>
        <p class="text-secondary small mb-0 font-display">Marcas internacionales de sastrería, calzado y confección</p>
      </div>
      <button class="btn btn-gold d-flex align-items-center gap-2" @click="abrirCrear">
        <i class="bi bi-plus-circle-fill"></i> Nueva Firma / Marca
      </button>
    </div>

    <!-- Tabla de Marcas -->
    <div class="card-sartorial">
      <div class="card-sartorial-body p-0">
        <div class="table-responsive">
          <table class="table-sartorial mb-0">
            <thead>
              <tr>
                <th>Firma / Marca</th>
                <th>País de Origen</th>
                <th>Descripción & Prestigio</th>
                <th>Prendas en Stock</th>
                <th class="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="m in marcas" :key="m.id">
                <td>
                  <div class="fw-bold text-gold font-display fs-6">{{ m.nombre }}</div>
                </td>
                <td>
                  <span class="badge bg-dark border border-secondary text-white">
                    <i class="bi bi-geo-alt me-1 text-gold"></i>{{ m.paisOrigen || 'Internacional' }}
                  </span>
                </td>
                <td class="small text-secondary">{{ m.descripcion || 'Casa de moda' }}</td>
                <td>
                  <span class="badge bg-secondary">{{ m.productos?.length || 0 }} modelos</span>
                </td>
                <td class="text-end">
                  <button class="btn btn-sm btn-outline-gold me-2" @click="abrirEditar(m)"><i class="bi bi-pencil"></i></button>
                  <button class="btn btn-sm btn-outline-danger" @click="eliminar(m)"><i class="bi bi-trash"></i></button>
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
            <h5 class="modal-title font-display text-gold">{{ modoEdicion ? 'Editar Firma' : 'Nueva Firma' }}</h5>
            <button type="button" class="btn-close btn-close-white" @click="modalOpen = false"></button>
          </div>
          <form @submit.prevent="guardar">
            <div class="modal-body p-4">
              <div class="mb-3">
                <label class="form-label">Nombre de la Firma *</label>
                <input v-model="form.nombre" type="text" class="form-control" placeholder="Ej. Canali, Tom Ford..." required />
              </div>
              <div class="mb-3">
                <label class="form-label">País de Procedencia *</label>
                <input v-model="form.paisOrigen" type="text" class="form-control" placeholder="Ej. Italia, Reino Unido..." required />
              </div>
              <div class="mb-3">
                <label class="form-label">Reseña Histórica / Descripción</label>
                <textarea v-model="form.descripcion" class="form-control" rows="3" placeholder="Tradición artesanal, tipos de corte..."></textarea>
              </div>
            </div>
            <div class="modal-footer border-secondary">
              <button type="button" class="btn btn-outline-secondary" @click="modalOpen = false">Cancelar</button>
              <button type="submit" class="btn btn-gold" :disabled="guardando">
                <i class="bi bi-check2-circle me-1"></i> {{ guardando ? 'Guardando...' : 'Guardar' }}
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

const marcas = ref<any[]>([])
const modalOpen = ref(false)
const modoEdicion = ref(false)
const editId = ref<number | null>(null)
const guardando = ref(false)

const form = ref({
  nombre: '',
  paisOrigen: '',
  descripcion: '',
})

const cargarMarcas = async () => {
  try {
    const res = await http.get('marcas')
    marcas.value = res.data
  } catch (e) {
    console.error(e)
  }
}

const abrirCrear = () => {
  modoEdicion.value = false
  editId.value = null
  form.value = { nombre: '', paisOrigen: '', descripcion: '' }
  modalOpen.value = true
}

const abrirEditar = (m: any) => {
  modoEdicion.value = true
  editId.value = m.id
  form.value = { nombre: m.nombre, paisOrigen: m.paisOrigen || '', descripcion: m.descripcion || '' }
  modalOpen.value = true
}

const guardar = async () => {
  guardando.value = true
  try {
    if (modoEdicion.value && editId.value) {
      await http.patch(`marcas/${editId.value}`, form.value)
    } else {
      await http.post('marcas', form.value)
    }
    modalOpen.value = false
    cargarMarcas()
    Swal.fire({
      icon: 'success',
      title: 'Éxito',
      text: 'Marca guardada correctamente.',
      background: '#131A26',
      color: '#F8FAFC',
      timer: 1500,
      showConfirmButton: false,
    })
  } catch (err: any) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: err.response?.data?.message || 'No se pudo guardar la marca.',
      background: '#131A26',
      color: '#F8FAFC',
    })
  } finally {
    guardando.value = false
  }
}

const eliminar = async (m: any) => {
  const res = await Swal.fire({
    title: `¿Eliminar ${m.nombre}?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#EF4444',
    confirmButtonText: 'Sí, eliminar',
    background: '#131A26',
    color: '#F8FAFC',
  })
  if (res.isConfirmed) {
    try {
      await http.delete(`marcas/${m.id}`)
      cargarMarcas()
      Swal.fire({
        icon: 'success',
        title: 'Eliminado',
        text: 'La firma ha sido eliminada.',
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
  cargarMarcas()
})
</script>
