<template>
  <div class="categorias-view">
    <div class="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
      <div>
        <h2 class="font-serif fw-bold text-white mb-1">Categorías de Confección</h2>
        <p class="text-secondary small mb-0 font-display">Clasificación departamental de prendas, calzado y accesorios</p>
      </div>
      <button class="btn btn-gold d-flex align-items-center gap-2" @click="abrirCrear">
        <i class="bi bi-plus-circle-fill"></i> Nueva Categoría
      </button>
    </div>

    <!-- Grid de Categorías -->
    <div class="row g-4">
      <div v-for="c in categorias" :key="c.id" class="col-12 col-md-6 col-lg-3">
        <div class="card-sartorial h-100 d-flex flex-column">
          <div class="ratio ratio-16x9 overflow-hidden" style="background: #111;">
            <img :src="getImageUrl(c.imagen)" :alt="c.nombre" class="img-fluid object-fit-cover" />
          </div>
          <div class="card-sartorial-body p-3 d-flex flex-column flex-grow-1">
            <h5 class="font-serif text-white mb-1">{{ c.nombre }}</h5>
            <p class="text-secondary small mb-3 flex-grow-1" style="font-size: 0.82rem; line-height: 1.5;">
              {{ c.descripcion || 'Sin descripción detallada.' }}
            </p>
            <div class="d-flex justify-content-between align-items-center pt-2 border-top border-secondary">
              <span class="badge bg-dark border border-secondary text-gold">
                {{ c.productos?.length || 0 }} prendas registradas
              </span>
              <div>
                <button class="btn btn-sm btn-outline-gold me-1" @click="abrirEditar(c)"><i class="bi bi-pencil"></i></button>
                <button class="btn btn-sm btn-outline-danger" @click="eliminar(c)"><i class="bi bi-trash"></i></button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Formulario -->
    <div v-if="modalOpen" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.85); backdrop-filter: blur(6px);">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header border-secondary">
            <h5 class="modal-title font-display text-gold">{{ modoEdicion ? 'Editar Categoría' : 'Nueva Categoría' }}</h5>
            <button type="button" class="btn-close btn-close-white" @click="modalOpen = false"></button>
          </div>
          <form @submit.prevent="guardar">
            <div class="modal-body p-4">
              <div class="mb-3">
                <label class="form-label">Nombre de la Categoría *</label>
                <input v-model="form.nombre" type="text" class="form-control" placeholder="Ej. Trajes & Esmóquines" required />
              </div>
              <div class="mb-3">
                <label class="form-label">URL de Imagen Representativa</label>
                <input v-model="form.imagen" type="text" class="form-control" placeholder="https://..." />
              </div>
              <div class="mb-3">
                <label class="form-label">Descripción</label>
                <textarea v-model="form.descripcion" class="form-control" rows="3" placeholder="Resumen de las prendas que abarca esta categoría..."></textarea>
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
import { getImageUrl } from '@/helpers'
import Swal from 'sweetalert2'

const categorias = ref<any[]>([])
const modalOpen = ref(false)
const modoEdicion = ref(false)
const editId = ref<number | null>(null)
const guardando = ref(false)

const form = ref({
  nombre: '',
  imagen: '',
  descripcion: '',
})

const cargarCategorias = async () => {
  try {
    const res = await http.get('categorias')
    categorias.value = res.data
  } catch (e) {
    console.error(e)
  }
}

const abrirCrear = () => {
  modoEdicion.value = false
  editId.value = null
  form.value = { nombre: '', imagen: '', descripcion: '' }
  modalOpen.value = true
}

const abrirEditar = (c: any) => {
  modoEdicion.value = true
  editId.value = c.id
  form.value = { nombre: c.nombre, imagen: c.imagen || '', descripcion: c.descripcion || '' }
  modalOpen.value = true
}

const guardar = async () => {
  guardando.value = true
  try {
    if (modoEdicion.value && editId.value) {
      await http.patch(`categorias/${editId.value}`, form.value)
    } else {
      await http.post('categorias', form.value)
    }
    modalOpen.value = false
    cargarCategorias()
    Swal.fire({
      icon: 'success',
      title: 'Éxito',
      text: 'Categoría guardada correctamente.',
      background: '#131A26',
      color: '#F8FAFC',
      timer: 1500,
      showConfirmButton: false,
    })
  } catch (err: any) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: err.response?.data?.message || 'No se pudo guardar la categoría.',
      background: '#131A26',
      color: '#F8FAFC',
    })
  } finally {
    guardando.value = false
  }
}

const eliminar = async (c: any) => {
  const res = await Swal.fire({
    title: `¿Eliminar ${c.nombre}?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#EF4444',
    confirmButtonText: 'Sí, eliminar',
    background: '#131A26',
    color: '#F8FAFC',
  })
  if (res.isConfirmed) {
    try {
      await http.delete(`categorias/${c.id}`)
      cargarCategorias()
      Swal.fire({
        icon: 'success',
        title: 'Eliminado',
        text: 'La categoría ha sido eliminada.',
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
  cargarCategorias()
})
</script>
